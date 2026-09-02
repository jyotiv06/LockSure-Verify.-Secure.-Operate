
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

    fields = {
        "name": None,
        "dob": None,
        "id_number": None,
        "address": None
    }

    for text in ocr_texts:

        if not text:
            continue

        text = text.strip()
        lower_text = text.lower()

        # ----------------------------------------------------
        # NAME
        # ----------------------------------------------------

        if lower_text.startswith("name:"):
            fields["name"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("full name:"):
            fields["name"] = text.split(":", 1)[1].strip()

        # ----------------------------------------------------
        # DATE OF BIRTH
        # ----------------------------------------------------

        elif lower_text.startswith("date of birth:"):
            fields["dob"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("dob:"):
            fields["dob"] = text.split(":", 1)[1].strip()

        # ----------------------------------------------------
        # ID NUMBER
        # ----------------------------------------------------

        elif lower_text.startswith("id number:"):
            fields["id_number"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("id no:"):
            fields["id_number"] = text.split(":", 1)[1].strip()

        # ----------------------------------------------------
        # ADDRESS
        # ----------------------------------------------------

        elif lower_text.startswith("address:"):
            fields["address"] = text.split(":", 1)[1].strip()

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

def run_ocr_on_image(image_path):

    results = ocr.predict(image_path)

    ocr_texts = []

    for result in results:

        texts = result.get(
            "rec_texts",
            []
        )

        if texts:
            ocr_texts.extend(texts)

    return ocr_texts


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
