import os
import sys
import requests

from camera_capture import capture_face
from document_verification import verify_document
from face_verify import verify_face


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = (
    "http://127.0.0.1:8000/ai/face/verify"
)

CAPTURED_IMAGE = (
    "data/live/captured.jpg"
)


# ============================================================
# CUSTOMER DATA
# ============================================================
#
# This is only for Samiksha's OCR field verification.
#
# Face verification does NOT use this data.
#
# Later Member 7/backend can provide this from PostgreSQL.
# ============================================================

CUSTOMER_DATA = {

    "name": "Test Customer",

    "dob": "01/01/2000",

    "id_number": "123456789",

    "address": "Pune"
}


# ============================================================
# MAIN WORKFLOW
# ============================================================

def run_complete_face_verification(
    document_path
):

    print()
    print("=" * 70)
    print("LOCKSURE - FACE VERIFICATION")
    print("=" * 70)

    # ========================================================
    # STEP 1 — DOCUMENT VERIFICATION / PHOTO EXTRACTION
    # ========================================================

    print()
   # print("[1/4] Processing customer document...")

    document_result = verify_document(
        document_path,
        CUSTOMER_DATA
    )

    if not document_result:

        print(
            "ERROR: Document verification returned no result."
        )

        return

    print()
    #print("Document processing result:")

   # print(
      #  "Document verified:",
      #  document_result.get("verified")
    #)

    # --------------------------------------------------------
    # IMPORTANT:
    # This is the dynamic reference image.
    # --------------------------------------------------------

    document_photo_path = (
        document_result.get(
            "document_photo_path"
        )
    )

    print(
        "Document photo path:",
        document_photo_path
    )

    if not document_photo_path:

        print()
        print(
            "ERROR: Could not extract face/photo "
            "from customer document."
        )

        return

    if not os.path.exists(
        document_photo_path
    ):

        print()
        print(
            "ERROR: Extracted document photo "
            "does not exist."
        )

        return

    # ========================================================
    # STEP 2 — ACTUAL WEBCAM CAPTURE
    # ========================================================

    print()
    #print("[2/4] Capturing live customer face...")

    captured = capture_face(
        CAPTURED_IMAGE
    )

    if not captured:

        print(
            "ERROR: Live face capture failed."
        )

        return

    # ========================================================
    # STEP 3 — LOCAL FACE VERIFICATION
    # ========================================================

    print()
    #print("[3/4] Comparing document face with live face...")

    print()
    print("Document photo path:")
    print(
        document_photo_path
    )

    print()
    #print("LIVE IMAGE:")
    #print(
       # CAPTURED_IMAGE
   # )

    face_result = verify_face(
        reference_image=document_photo_path,
        live_image=CAPTURED_IMAGE
    )

    print()
    print("Face verification result:")

    for key, value in face_result.items():

        print(
            f"{key}: {value}"
        )

    # ========================================================
    # STEP 4 — OPTIONAL API VERIFICATION
    # ========================================================
    #
    # This demonstrates that the same face service can
    # be consumed through the backend API.
    # ========================================================

    print()
    #print("[4/4] Testing face verification API...")

    try:

        with open(
            document_photo_path,
            "rb"
        ) as reference_file, open(
            CAPTURED_IMAGE,
            "rb"
        ) as live_file:

            files = {

                "reference_image": (
                    "document_face.png",
                    reference_file,
                    "image/png"
                ),

                "live_image": (
                    "captured.png",
                    live_file,
                    "image/png"
                )
            }

            response = requests.post(
                API_URL,
                files=files,
                timeout=120
            )

        if response.status_code == 200:

            api_result = response.json()

            print()
           # print("API RESULT:")

           # print(
               # api_result
            #)

        else:

            print()
            #print(
               # "API returned status:",
               # response.status_code
            #)

           # print(
             #   response.text
            #)

    except requests.exceptions.ConnectionError:

        print()
        print(
            "API is not running."
        )

        print(
            "Local face verification already completed."
        )

    except Exception as error:

        print()
        print(
            "API test error:",
            error
        )

    # ========================================================
    # FINAL RESULT
    # ========================================================

   # print()
   # print("=" * 70)
   # print("FINAL FACE VERIFICATION RESULT")
   # print("=" * 70)

   # print(
      ##  "Document photo path:",
       # document_photo_path
    #)

    #print(
    #"Document photo extraction error:",
    #document_result.get("photo_error")
    #)

    #print()
    #print("COMPLETE DOCUMENT RESULT:")
    #print(document_result)

   # print(
      #  "Live capture:",
       # CAPTURED_IMAGE
    #)

   # print(
    #    "Matched:",
    #    face_result.get("matched")
    #)

    #print(
      #  "Confidence:",
     #   face_result.get("confidence")
    #)

    #print(
    #    "Status:",
   #     face_result.get("status")
   # )

    #print("=" * 70)


# ============================================================
# COMMAND LINE
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 2:

        print()
        print(
            "Usage:"
        )

        print()
        print(
            "python camera_verify.py "
            "<document_image>"
        )

        print()
        print(
            "Example:"
        )

        print(
            "python camera_verify.py "
            "data/document/customer.png"
        )

        sys.exit(1)

    document_path = sys.argv[1]

    run_complete_face_verification(
        document_path
    )