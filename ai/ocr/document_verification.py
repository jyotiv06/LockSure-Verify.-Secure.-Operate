
import os
import re
from pathlib import Path

# --------------------------------------------------
# PaddlePaddle CPU compatibility
# --------------------------------------------------

os.environ["FLAGS_enable_pir_api"] = "0"

from paddleocr import PaddleOCR


# --------------------------------------------------
# OCR INITIALIZATION
# --------------------------------------------------

ocr = PaddleOCR(
    lang="en",
    device="cpu",
    enable_mkldnn=False
)


# --------------------------------------------------
# NORMALIZATION
# --------------------------------------------------

def normalize_text(text):
    """
    Normalize text so formatting differences do not
    automatically cause a mismatch.
    """

    if text is None:
        return ""

    text = str(text).strip().lower()
    text = re.sub(r"\s+", " ", text)

    return text


# --------------------------------------------------
# FIELD EXTRACTION
# --------------------------------------------------

def extract_fields(ocr_texts):
    """
    Extract Name, DOB, ID Number and Address
    from OCR recognized text.
    """

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

        if lower_text.startswith("name:"):
            fields["name"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("full name:"):
            fields["name"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("date of birth:"):
            fields["dob"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("dob:"):
            fields["dob"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("id number:"):
            fields["id_number"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("id no:"):
            fields["id_number"] = text.split(":", 1)[1].strip()

        elif lower_text.startswith("address:"):
            fields["address"] = text.split(":", 1)[1].strip()

    return fields


# --------------------------------------------------
# FIELD COMPARISON
# --------------------------------------------------

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


# --------------------------------------------------
# IMAGE OCR
# --------------------------------------------------

def run_ocr_on_image(image_path):

    results = ocr.predict(image_path)

    ocr_texts = []

    for result in results:

        texts = result.get("rec_texts", [])

        if texts:
            ocr_texts.extend(texts)

    return ocr_texts


# --------------------------------------------------
# DOCUMENT VERIFICATION
# --------------------------------------------------

def verify_document(image, customer_data):

    try:

        # ------------------------------------------
        # Validate input
        # ------------------------------------------

        if not image:
            return {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
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
                "error": "Document not found"
            }

        # ------------------------------------------
        # Supported formats
        # ------------------------------------------

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
                "error": "Unsupported document format"
            }

        # ------------------------------------------
        # PDF handling
        # ------------------------------------------

        if path.suffix.lower() == ".pdf":

            try:
                from pdf2image import convert_from_path

                pages = convert_from_path(
                    str(path),
                    first_page=1,
                    last_page=1
                )

                if not pages:
                    raise ValueError("PDF contains no readable pages")

                temp_image = str(Path("document_page.png").resolve())

                pages[0].save(
                    temp_image,
                    "PNG"
                )

                ocr_texts = run_ocr_on_image(temp_image)

            except Exception as pdf_error:

                return {
                    "verified": False,
                    "name_match": False,
                    "id_match": False,
                    "dob_match": False,
                    "address_match": False,
                    "error": f"PDF processing failed: {pdf_error}"
                }

        else:

            # --------------------------------------
            # Image OCR
            # --------------------------------------

            ocr_texts = run_ocr_on_image(str(path))

        # ------------------------------------------
        # OCR failure / empty result
        # ------------------------------------------

        if not ocr_texts:

            return {
                "verified": False,
                "name_match": False,
                "id_match": False,
                "dob_match": False,
                "address_match": False,
                "error": "OCR could not extract readable text"
            }

        # ------------------------------------------
        # Extract fields
        # ------------------------------------------

        extracted_fields = extract_fields(ocr_texts)

        # ------------------------------------------
        # Check required fields
        # ------------------------------------------

        missing_fields = [
            field
            for field, value in extracted_fields.items()
            if not value
        ]

        # ------------------------------------------
        # Compare with customer data
        # ------------------------------------------

        comparison = compare_fields(
            extracted_fields,
            customer_data
        )

        # ------------------------------------------
        # Add failure information if necessary
        # ------------------------------------------

        response = {
            "verified": comparison["verified"],
            "name_match": comparison["name_match"],
            "id_match": comparison["id_match"],
            "dob_match": comparison["dob_match"],
            "address_match": comparison["address_match"]
        }

        if missing_fields:
            response["error"] = (
                "Missing fields: " +
                ", ".join(missing_fields)
            )

        return response

    except Exception as error:

        return {
            "verified": False,
            "name_match": False,
            "id_match": False,
            "dob_match": False,
            "address_match": False,
            "error": f"OCR verification failed: {error}"
        }
