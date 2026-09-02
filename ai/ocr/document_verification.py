
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
ocr = None


def _get_ocr():
    global ocr

    if ocr is None:
        ocr = PaddleOCR(
            lang="en",
            device="cpu",
            enable_mkldnn=False,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False
        )

    return ocr



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
    Extract Name, DOB, ID number, and Address from OCR output.

    Supports:
      Name: Jyoti Vaggu
      Name - Jyoti Vaggu
      NAME Jyoti Vaggu
    and also handles a label appearing on one OCR line and its value on
    the next OCR line.
    """
    fields = {
        "name": None,
        "dob": None,
        "id_number": None,
        "customer_number": None,
        "address": None
    }

    cleaned = []
    for raw_text in ocr_texts:
        if not raw_text:
            continue

        value = re.sub(r"\s+", " ", str(raw_text).strip())
        if value:
            cleaned.append(value)

    patterns = [
        ("name", re.compile(r"^(?:full\s*name|name)\s*[:\-]?\s*(.+)$", re.I)),
        ("dob", re.compile(r"^(?:date\s*of\s*birth|dob)\s*[:\-]?\s*(.+)$", re.I)),
        ("id_number", re.compile(r"^(?:id\s*number|id\s*no|id)\s*[:\-]?\s*(.+)$", re.I)),
        ("customer_number", re.compile(r"^customer\s*(?:number|no)\s*[:\-]?\s*(.+)$", re.I)),
        ("address", re.compile(r"^address\s*[:\-]?\s*(.+)$", re.I)),
    ]

    label_only = [
        ("name", re.compile(r"^(?:full\s*name|name)\s*[:\-]?\s*$", re.I)),
        ("dob", re.compile(r"^(?:date\s*of\s*birth|dob)\s*[:\-]?\s*$", re.I)),
        ("id_number", re.compile(r"^(?:id\s*number|id\s*no|id)\s*[:\-]?\s*$", re.I)),
        ("customer_number", re.compile(r"^customer\s*(?:number|no)\s*[:\-]?\s*$", re.I)),
        ("address", re.compile(r"^address\s*[:\-]?\s*$", re.I)),
    ]

    for index, line in enumerate(cleaned):
        for field, pattern in patterns:
            match = pattern.match(line)
            if match and not fields[field]:
                fields[field] = match.group(1).strip()
                break

        for field, pattern in label_only:
            if pattern.match(line) and not fields[field]:
                if index + 1 < len(cleaned):
                    fields[field] = cleaned[index + 1].strip()
                break

    return fields


# ============================================================
# FIELD COMPARISON
# ============================================================

def _normalize_dob(value):
    """Normalize common DOB formats to YYYY-MM-DD for comparison."""
    if value is None:
        return ""

    value = str(value).strip()

    # Database/ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...
    iso_match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})", value)
    if iso_match:
        year, month, day = iso_match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    # Demo document format: DD/MM/YYYY
    slash_match = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", value)
    if slash_match:
        day, month, year = slash_match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    # Also tolerate DD-MM-YYYY.
    dash_match = re.match(r"^(\d{1,2})-(\d{1,2})-(\d{4})$", value)
    if dash_match:
        day, month, year = dash_match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    return normalize_text(value)


def compare_fields(extracted_data, customer_data):
    """Compare OCR data with the registered customer.

    The current Customer schema has customer_number but no separate
    id_number column. Therefore the document's ID Number is informational,
    while Customer Number is the registered identity used for matching.
    """
    name_match = (
        bool(extracted_data.get("name"))
        and bool(customer_data.get("name"))
        and normalize_text(extracted_data.get("name"))
        == normalize_text(customer_data.get("name"))
    )

    customer_number_match = (
        bool(extracted_data.get("customer_number"))
        and bool(customer_data.get("customer_number"))
        and normalize_text(extracted_data.get("customer_number"))
        == normalize_text(customer_data.get("customer_number"))
    )

    # Keep id_match for frontend/backward compatibility.
    id_match = customer_number_match

    dob_match = (
        bool(extracted_data.get("dob"))
        and bool(customer_data.get("dob"))
        and _normalize_dob(extracted_data.get("dob"))
        == _normalize_dob(customer_data.get("dob"))
    )

    address_match = (
        bool(extracted_data.get("address"))
        and bool(customer_data.get("address"))
        and normalize_text(extracted_data.get("address"))
        == normalize_text(customer_data.get("address"))
    )

    required_matches = [name_match, customer_number_match]

    if customer_data.get("dob") not in (None, ""):
        required_matches.append(dob_match)

    if customer_data.get("address") not in (None, ""):
        required_matches.append(address_match)

    verified = all(required_matches)

    return {
        "verified": verified,
        "name_match": name_match,
        "id_match": id_match,
        "customer_number_match": customer_number_match,
        "dob_match": dob_match,
        "address_match": address_match,
        "verification_policy": {
            "name_required": True,
            "customer_number_required": True,
            "id_number_required": False,
            "dob_required": bool(customer_data.get("dob")),
            "address_required": bool(customer_data.get("address")),
        }
    }


# ============================================================
# RUN OCR
# ============================================================

def _collect_ocr_texts(image_path):
    """
    Run PaddleOCR and extract recognized strings.

    PaddleOCR 3.x returns result objects that expose dictionary-like
    fields such as rec_texts. This helper also tolerates attribute-style
    access so the integration is less sensitive to minor API differences.
    """
    results = _get_ocr().predict(image_path)
    texts = []

    for result in results:
        rec_texts = []

        try:
            if hasattr(result, "get"):
                rec_texts = result.get("rec_texts", []) or []
        except Exception:
            rec_texts = []

        if not rec_texts:
            try:
                rec_texts = getattr(result, "rec_texts", []) or []
            except Exception:
                rec_texts = []

        for value in rec_texts:
            value = str(value).strip()
            if value:
                texts.append(value)

    return texts

def _prepare_ocr_variants(image_path):
    """
    Create OCR-friendly variants for document photos.

    The original image is always tested first. Additional variants are used
    only to improve text detection on screenshots, phone photos, compression,
    low contrast, or small text. Verification remains strict.
    """
    variants = [str(image_path)]
    temporary_files = []

    try:
        image = cv2.imread(str(image_path))

        if image is None:
            return variants, temporary_files

        height, width = image.shape[:2]

        # Keep the document large enough for text detection.
        longest = max(height, width)
        scale = 2.0 if longest < 1800 else 1.5

        upscaled = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_CUBIC
        )

        gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)

        # Contrast enhancement.
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrast = clahe.apply(gray)

        # Adaptive threshold helps with uneven lighting/backgrounds.
        adaptive = cv2.adaptiveThreshold(
            contrast,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            31,
            11
        )

        # Mild sharpening preserves characters without aggressive noise.
        blurred = cv2.GaussianBlur(contrast, (0, 0), 1.0)
        sharpened = cv2.addWeighted(contrast, 1.5, blurred, -0.5, 0)

        for prefix, variant in (
            ("ocr_upscaled_", upscaled),
            ("ocr_contrast_", contrast),
            ("ocr_adaptive_", adaptive),
            ("ocr_sharpened_", sharpened),
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
    Run PaddleOCR 3.x on an image and return recognized text lines.
    """
    try:
        results = _get_ocr().predict(image_path)

        texts = []

        for result in results:
            # PaddleOCR 3.x returns recognized text in rec_texts
            if isinstance(result, dict):
                rec_texts = result.get("rec_texts", [])
            else:
                try:
                    rec_texts = result["rec_texts"]
                except Exception:
                    rec_texts = getattr(result, "rec_texts", [])

            if rec_texts:
                texts.extend(
                    str(text).strip()
                    for text in rec_texts
                    if str(text).strip()
                )

        return texts

    except Exception as error:
        print(f"OCR error: {error}")
        return []

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
                "customer_number_match": False,
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
                "customer_number_match": False,
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
                "customer_number_match": False,
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
                "customer_number_match": False,
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

            "customer_number_match":
                comparison["customer_number_match"],

            "dob_match":
                comparison["dob_match"],

            "address_match":
                comparison["address_match"],

            "extracted_fields":
                extracted_fields,

            "ocr_text":
                ocr_texts,

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
