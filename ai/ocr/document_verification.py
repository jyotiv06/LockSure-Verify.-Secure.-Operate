
import os

# CPU compatibility workaround for PaddlePaddle
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
# FIELD EXTRACTION
# --------------------------------------------------

def extract_fields(ocr_texts):
    """
    Extract Name, DOB, ID Number and Address
    from PaddleOCR recognized text.
    """

    fields = {
        "name": None,
        "dob": None,
        "id_number": None,
        "address": None
    }

    for text in ocr_texts:
        text = text.strip()

        if text.lower().startswith("name:"):
            fields["name"] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("date of birth:"):
            fields["dob"] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("id number:"):
            fields["id_number"] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("address:"):
            fields["address"] = text.split(":", 1)[1].strip()

    return fields


# --------------------------------------------------
# TEXT NORMALIZATION
# --------------------------------------------------

def normalize_text(text):
    """
    Normalize text before comparison.
    """

    if text is None:
        return ""

    return " ".join(
        text.lower().strip().split()
    )


# --------------------------------------------------
# FIELD COMPARISON
# --------------------------------------------------

def compare_fields(extracted_data, customer_data):
    """
    Compare OCR-extracted fields with customer data.
    """

    name_match = (
        normalize_text(extracted_data["name"])
        == normalize_text(customer_data["name"])
    )

    dob_match = (
        normalize_text(extracted_data["dob"])
        == normalize_text(customer_data["dob"])
    )

    id_match = (
        normalize_text(extracted_data["id_number"])
        == normalize_text(customer_data["id_number"])
    )

    address_match = (
        normalize_text(extracted_data["address"])
        == normalize_text(customer_data["address"])
    )

    # Core identity verification
    verified = (
        name_match
        and id_match
        and dob_match
    )

    return {
        "verified": verified,
        "name_match": name_match,
        "id_match": id_match,
        "dob_match": dob_match,
        "address_match": address_match
    }


# --------------------------------------------------
# DOCUMENT VERIFICATION
# --------------------------------------------------

def verify_document(image, customer_data):
    """
    Verify customer information from an uploaded document.

    Pipeline:
    Image → PaddleOCR → Field Extraction → Customer Data Matching
    """

    # Run OCR
    results = ocr.predict(image)

    # Collect recognized text
    ocr_texts = []

    for res in results:
        ocr_texts.extend(res["rec_texts"])

    # Extract fields
    extracted_fields = extract_fields(ocr_texts)

    # Compare with customer data
    comparison = compare_fields(
        extracted_fields,
        customer_data
    )

    # Return verification result
    return {
        "verified": comparison["verified"],
        "name_match": comparison["name_match"],
        "id_match": comparison["id_match"],
        "dob_match": comparison["dob_match"]
    }
