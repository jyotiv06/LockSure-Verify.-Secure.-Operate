import os
import sys
from deepface import DeepFace


# Face recognition configuration
MODEL_NAME = "ArcFace"
DETECTOR = "opencv"
DISTANCE_METRIC = "cosine"


def verify_face(reference_image, live_image):

    # Check reference image
    if not os.path.exists(reference_image):
        print("ERROR: Reference image not found.")
        return

    # Check live image
    if not os.path.exists(live_image):
        print("ERROR: Live image not found.")
        return

    print("\n===================================")
    print("       M5 - FACE VERIFICATION")
    print("===================================")

    print(f"Model    : {MODEL_NAME}")
    print(f"Detector : {DETECTOR}")
    print(f"Metric   : {DISTANCE_METRIC}")

    print("\nComparing faces...")
    print("First execution may take longer because model files may be downloaded.")

    try:

        result = DeepFace.verify(
            img1_path=reference_image,
            img2_path=live_image,

            model_name=MODEL_NAME,
            detector_backend=DETECTOR,
            distance_metric=DISTANCE_METRIC,

            enforce_detection=True,
            align=True,

            silent=True
        )

    except Exception as error:

        print("\nFACE VERIFICATION ERROR")
        print("-----------------------------------")
        print(type(error).__name__)
        print(error)

        print("\nFull error:")
        import traceback
        traceback.print_exc()

        print("\nPossible reasons:")
        print("1. No face detected")
        print("2. Image quality is poor")
        print("3. Image path is incorrect")
        print("4. More than one face may be present")

        return

    # Extract result
    verified = result.get("verified")
    distance = result.get("distance")
    threshold = result.get("threshold")

    # Some DeepFace versions may use another key
    if threshold is None:
        threshold = result.get("max_threshold_to_verify")

    confidence = result.get("confidence")

    print("\n===================================")
    print("          VERIFICATION RESULT")
    print("===================================")

    print(f"Verified  : {verified}")
    print(f"Distance  : {distance}")
    print(f"Threshold : {threshold}")
    print(f"Confidence: {confidence}")

    print("\n-----------------------------------")

    if verified:

        print("FACE MATCHED")
        print("The two images are considered the same person.")

    else:

        print("FACE NOT MATCHED")
        print("The two images are considered different persons.")

    print("-----------------------------------")


if __name__ == "__main__":

    # Reference image
    reference_image = "data/reference/customer.jpg"

    # Live/sample image
    live_image = "data/live/no_face.jpg"

    verify_face(reference_image, live_image)