import requests

from camera_capture import capture_face


API_URL = "http://127.0.0.1:8000/ai/face/verify"

REFERENCE_IMAGE = "data/reference/customer.jpg"
CAPTURED_IMAGE = "data/live/captured.jpg"


def verify_from_camera():

    print()
    print("=" * 60)
    print("LOCKSURE - FACE VERIFICATION")
    print("=" * 60)

    # --------------------------------------------------------
    # 1. Capture actual face
    # --------------------------------------------------------

    captured = capture_face(
        CAPTURED_IMAGE
    )

    if not captured:

        print("Face capture failed.")
        return

    # --------------------------------------------------------
    # 2. Send image to API
    # --------------------------------------------------------

    print()
    print("Sending captured face to verification service...")

    try:

        with open(REFERENCE_IMAGE, "rb") as reference_file, \
             open(CAPTURED_IMAGE, "rb") as live_file:

            files = {

                "reference_image": (
                    "customer.jpg",
                    reference_file,
                    "image/jpeg"
                ),

                "live_image": (
                    "captured.jpg",
                    live_file,
                    "image/jpeg"
                )
            }

            response = requests.post(
                API_URL,
                files=files,
                timeout=60
            )

        # ----------------------------------------------------
        # 3. Process response
        # ----------------------------------------------------

        if response.status_code != 200:

            print("API ERROR")
            print(response.text)
            return

        result = response.json()

        print()
        print("=" * 60)
        print("FACE VERIFICATION RESULT")
        print("=" * 60)

        print(
            f"PASS/FAIL  : "
            f"{'PASS' if result['matched'] else 'FAIL'}"
        )

        print(
            f"Matched    : "
            f"{result['matched']}"
        )

        print(
            f"Confidence : "
            f"{result['confidence']}"
        )

        print(
            f"Status     : "
            f"{result['status']}"
        )

        print("=" * 60)

    except requests.exceptions.ConnectionError:

        print()
        print("ERROR: Face API is not running.")
        print()
        print(
            "Start it using:"
        )
        print(
            "python -m uvicorn api:app "
            "--host 127.0.0.1 --port 8000 --reload"
        )

    except Exception as error:

        print(
            f"ERROR: {error}"
        )


if __name__ == "__main__":

    verify_from_camera()