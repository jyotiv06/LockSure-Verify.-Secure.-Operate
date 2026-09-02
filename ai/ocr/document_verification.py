
import os
import re
import tempfile
from pathlib import Path

# ============================================================
# CPU COMPATIBILITY
# ============================================================

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR
import cv2


# ============================================================
# OCR INITIALIZATION
# ============================================================

# Initialize PaddleOCR once when this module is imported.
# The LockSure demo documents are front-facing, so the extra document
# orientation/unwarping pipelines are unnecessary and slow on CPU.
ocr = PaddleOCR(
    lang="en",
    device="cpu",
    enable_mkldnn=False,
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):
    if text is None:
        return ""

    text = str(text).strip().lower()
    text = re.sub(r"\s+", " ", text)

    return text


# ============================================================
# FIELD EXTRACTION
# ============================================================

def extract_fields(ocr_texts):
    """
    Extract the four required identity fields from OCR text.

    Label matching is tolerant of casing/spacing variations. The extracted
    values are still checked by compare_fields(), which requires all four
    fields to match.
    """
    fields = {
        "name": None,
        "dob": None,
        "id_number": None,
        "address": None
    }

    patterns = [
        ("name", r"^(?:full\\s*name|name)\\s*[:\\-]?\\s*(.+)$"),
        ("dob", r"^(?:date\\s*of\\s*birth|dob)\\s*[:\\-]?\\s*(.+)$"),
        ("id_number", r"^(?:id\\s*number|id\\s*no|id)\\s*[:\\-]?\\s*(.+)$"),
        ("address", r"^address\\s*[:\\-]?\\s*(.+)$"),
    ]

    for raw_text in ocr_texts:
        if not raw_text:
            continue

        normalized = re.sub(r"\\s+", " ", str(raw_text).strip())
        if not normalized:
            continue

        for field, pattern in patterns:
            match = re.match(pattern, normalized, flags=re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                if value and not fields[field]:
                    fields[field] = value
                break

    return fields


# ============================================================
# FIELD COMPARISON
# ============================================================

def compare_fields(extracted_data, customer_data):

    name_match = (
        bool(extracted_data.get("name"))
        and bool(customer_data.get("name"))
        and normalize_text(extracted_data.get("name"))
        == normalize_text(customer_data.get("name"))
    )

    id_match = (
        bool(extracted_data.get("id_number"))
        and bool(customer_data.get("id_number"))
        and normalize_text(extracted_data.get("id_number"))
        == normalize_text(customer_data.get("id_number"))
    )

    dob_match = (
        bool(extracted_data.get("dob"))
        and bool(customer_data.get("dob"))
        and normalize_text(extracted_data.get("dob"))
        == normalize_text(customer_data.get("dob"))
    )

    address_match = (
        bool(extracted_data.get("address"))
        and bool(customer_data.get("address"))
        and normalize_text(extracted_data.get("address"))
        == normalize_text(customer_data.get("address"))
    )

    # All four fields must match
    verified = (
        name_match
        and id_match
        and dob_match
        and address_match
    )

    return {
        "verified": verified,
        "name_match": name_match,
        "id_match": id_match,
        "dob_match": dob_match,
        "address_match": address_match
    }


# ============================================================
# RUN OCR
# ============================================================

def _collect_ocr_texts(image_path):
    """
    Run the cached PaddleOCR engine on one image and return recognized text.
    """
    results = ocr.predict(image_path)
    texts = []

    for result in results:
        try:
            rec_texts = result.get("rec_texts", [])
        except AttributeError:
            rec_texts = []

        if rec_texts:
            texts.extend(
                str(value).strip()
                for value in rec_texts
                if value and str(value).strip()
            )

    return texts


def _prepare_ocr_variants(image_path):
    """
    Create a small number of OCR-friendly variants for low-quality photos.

    The original image is always tested first. Extra variants only improve
    text detection; they do not change the strict verification rules.
    """
    variants = [str(image_path)]
    temporary_files = []

    try:
        image = cv2.imread(str(image_path))

        if image is None:
            return variants, temporary_files

        height, width = image.shape[:2]
        scale = 2.0 if max(height, width) < 1600 else 1.5

        upscaled = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC
        )

        gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
        enhanced = cv2.equalizeHist(gray)

        for prefix, variant in (
            ("ocr_upscaled_", upscaled),
            ("ocr_enhanced_", enhanced),
        ):
            temp_file = tempfile.NamedTemporaryFile(
                prefix=prefix,
                suffix=".png",
                delete=False
            )
            temp_path = temp_file.name
            temp_file.close()

            if cv2.imwrite(temp_path, variant):
                variants.append(temp_path)
                temporary_files.append(temp_path)
            else:
                try:
                    os.remove(temp_path)
                except OSError:
                    pass

    except Exception:
        # Always retain the original image as a fallback.
        pass

    return variants, temporary_files


def run_ocr_on_image(image_path):
    """
    Run OCR on the original image plus a small number of preprocessing
    variants and combine unique recognized text.
    """
    variants, temporary_files = _prepare_ocr_variants(image_path)

    all_texts = []
    seen = set()

    try:
        for variant in variants:
            try:
                texts = _collect_ocr_texts(variant)
            except Exception:
                continue

            for value in texts:
                key = normalize_text(value)
                if key and key not in seen:
                    seen.add(key)
                    all_texts.append(value)

    finally:
        for temp_path in temporary_files:
            try:
                os.remove(temp_path)
            except OSError:
                pass

    return all_texts

# ============================================================
# DOCUMENT PHOTO EXTRACTION
# ============================================================
#
# The current demo document has a fixed layout:
#
#   DEMO BANK CUSTOMER IDENTIFICATION
#
#   [ PHOTO ]    Name: ...
#                Date of Birth: ...
#                ID Number: ...
#                Address: ...
#
# The document photo is located in the upper-left region.
#
# We intentionally DO NOT use cv2.CascadeClassifier here
# because the current OpenCV 5 environment does not provide it.
#
# Instead, we crop the known photo region.
# ============================================================

def extract_document_photo(image_path):

    try:

        # ----------------------------------------------------
        # Read document
        # ----------------------------------------------------

        image = cv2.imread(str(image_path))

        if image is None:

            return {
                "success": False,
                "photo_path": None,
                "error": "Could not read document image"
            }

        height, width = image.shape[:2]

        # ----------------------------------------------------
        # PHOTO REGION
        # ----------------------------------------------------
        #
        # For the supplied document:
        #
        # Image size approximately:
        # width  = 583
        # height = 465
        #
        # Photo approximately:
        # x = 43 to 209
        # y = 49 to 222
        #
        # Percentage coordinates make the crop work
        # even if the document image is resized.
        # ----------------------------------------------------

        x1 = int(width * 0.074)
        y1 = int(height * 0.105)

        x2 = int(width * 0.359)
        y2 = int(height * 0.478)

        # ----------------------------------------------------
        # Crop photo
        # ----------------------------------------------------

        photo_crop = image[
            y1:y2,
            x1:x2
        ]

        if photo_crop.size == 0:

            return {
                "success": False,
                "photo_path": None,
                "error": "Photo extraction failed"
            }

        # ----------------------------------------------------
        # Save extracted photo
        # ----------------------------------------------------

        temp_file = tempfile.NamedTemporaryFile(
            prefix="document_face_",
            suffix=".jpg",
            delete=False
        )

        photo_path = temp_file.name
        temp_file.close()

        saved = cv2.imwrite(
            photo_path,
            photo_crop
        )

        if not saved:

            return {
                "success": False,
                "photo_path": None,
                "error": "Could not save extracted document photo"
            }

        return {
            "success": True,
            "photo_path": photo_path,
            "error": None
        }

    except Exception as error:

        return {
            "success": False,
            "photo_path": None,
            "error": f"Photo extraction failed: {error}"
        }


# ============================================================
# DOCUMENT VERIFICATION
# ============================================================

def verify_document(image, customer_data):

    try:

        # ----------------------------------------------------
        # Validate input
        # ----------------------------------------------------

        if not image:

            return {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
                "document_photo_path": None,
                "error": "No document provided"
            }

        path = Path(image)

        if not path.exists():

            return {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
                "document_photo_path": None,
                "error": "Document not found"
            }

        # ----------------------------------------------------
        # Supported formats
        # ----------------------------------------------------

        supported_extensions = {
            ".png",
            ".jpg",
            ".jpeg",
            ".pdf"
        }

        if path.suffix.lower() not in supported_extensions:

            return {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
                "document_photo_path": None,
                "error": "Unsupported document format"
            }

        # ----------------------------------------------------
        # PDF handling
        # ----------------------------------------------------

        if path.suffix.lower() == ".pdf":

            try:

                from pdf2image import convert_from_path

                pages = convert_from_path(
                    str(path),
                    first_page=1,
                    last_page=1
                )

                if not pages:
                    raise ValueError(
                        "PDF contains no readable pages"
                    )

                temp_image = str(
                    Path(tempfile.gettempdir())
                    / "document_page.png"
                )

                pages[0].save(
                    temp_image,
                    "PNG"
                )

                ocr_image_path = temp_image

            except Exception as pdf_error:

                return {
                    "verified": False,
                    "name_match": False,
                    "id_match": False,
                    "dob_match": False,
                    "address_match": False,
                    "document_photo_path": None,
                    "error": f"PDF processing failed: {pdf_error}"
                }

        else:

            ocr_image_path = str(path)

        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        ocr_texts = run_ocr_on_image(
            ocr_image_path
        )

        # ----------------------------------------------------
        # Extract document photo
        # ----------------------------------------------------

        photo_result = extract_document_photo(
            ocr_image_path
        )

        document_photo_path = None

        if photo_result:
            document_photo_path = photo_result.get(
                "photo_path"
            )

        # ----------------------------------------------------
        # OCR failure
        # ----------------------------------------------------

        if not ocr_texts:

            response = {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
                "document_photo_path": document_photo_path,
                "error": "OCR could not extract readable text"
            }

            if photo_result and not photo_result["success"]:
                response["photo_error"] = photo_result["error"]

            return response

        # ----------------------------------------------------
        # Extract fields
        # ----------------------------------------------------

        extracted_fields = extract_fields(
            ocr_texts
        )

        # ----------------------------------------------------
        # Find missing fields
        # ----------------------------------------------------

        missing_fields = [
            field
            for field, value in extracted_fields.items()
            if not value
        ]

        # ----------------------------------------------------
        # Compare with customer data
        # ----------------------------------------------------

        comparison = compare_fields(
            extracted_fields,
            customer_data
        )

        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        response = {

            "verified":
                comparison["verified"],

            "name_match":
                comparison["name_match"],

            "id_match":
                comparison["id_match"],

            "dob_match":
                comparison["dob_match"],

            "address_match":
                comparison["address_match"],

            "extracted_fields":
                extracted_fields,

            "document_photo_path":
                document_photo_path
        }

        # ----------------------------------------------------
        # Photo extraction error
        # ----------------------------------------------------

        if photo_result and not photo_result["success"]:

            response["photo_error"] = (
                photo_result["error"]
            )

        # ----------------------------------------------------
        # Missing OCR fields
        # ----------------------------------------------------

        if missing_fields:

            response["error"] = (
                "Missing fields: "
                + ", ".join(missing_fields)
            )

        return response

    except Exception as error:

        return {

            "verified": False,

            "name_match": False,

            "id_match": False,

            "dob_match": False,

            "address_match": False,

            "document_photo_path": None,

            "error":
                f"OCR verification failed: {error}"
        }
