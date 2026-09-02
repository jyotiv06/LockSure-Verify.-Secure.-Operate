import os

from deepface import DeepFace


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_NAME = "ArcFace"
DETECTOR = "retinaface"
DISTANCE_METRIC = "cosine"

# Lower cosine distance = more similar
# This threshold should be tuned using your test images.
DISTANCE_THRESHOLD = 0.68


# ============================================================
# FACE VERIFICATION
# ============================================================

def verify_face(reference_image, live_image):

    try:

        # ----------------------------------------------------
        # Validate reference image
        # ----------------------------------------------------

        if not reference_image:

            return {
                "matched": False,
                "confidence": 0.0,
                "status": "REFERENCE_IMAGE_MISSING"
            }

        if not os.path.exists(reference_image):

            return {
                "matched": False,
                "confidence": 0.0,
                "status": "REFERENCE_IMAGE_NOT_FOUND"
            }

        # ----------------------------------------------------
        # Validate live image
        # ----------------------------------------------------

        if not live_image:

            return {
                "matched": False,
                "confidence": 0.0,
                "status": "LIVE_IMAGE_MISSING"
            }

        if not os.path.exists(live_image):

            return {
                "matched": False,
                "confidence": 0.0,
                "status": "LIVE_IMAGE_NOT_FOUND"
            }

        # ----------------------------------------------------
        # DeepFace verification
        # ----------------------------------------------------

        result = DeepFace.verify(
            img1_path=reference_image,
            img2_path=live_image,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR,
            distance_metric=DISTANCE_METRIC,
            enforce_detection=True
        )

        # ----------------------------------------------------
        # Get result
        # ----------------------------------------------------

        verified = bool(
            result.get("verified", False)
        )

        distance = float(
            result.get("distance", 1.0)
        )

        threshold = float(
            result.get(
                "threshold",
                DISTANCE_THRESHOLD
            )
        )

        # ----------------------------------------------------
        # Convert distance into a simple confidence score
        #
        # NOTE:
        # This is an application score, not a calibrated
        # probability.
        # ----------------------------------------------------

        if threshold > 0:

            confidence = max(
                0.0,
                min(
                    1.0,
                    1.0 - (distance / threshold)
                )
            )

        else:

            confidence = 0.0

        # ----------------------------------------------------
        # Status
        # ----------------------------------------------------

        if verified:

            status = "VERIFIED"

        else:

            status = "NOT_VERIFIED"

        return {

            "matched":
                verified,

            "confidence":
                round(confidence, 3),

            "status":
                status,

            "distance":
                round(distance, 4),

            "threshold":
                round(threshold, 4)
        }

    except ValueError as error:

        error_message = str(error).lower()

        if "face could not be detected" in error_message:

            return {

                "matched": False,

                "confidence": 0.0,

                "status": "NO_FACE"
            }

        return {

            "matched": False,

            "confidence": 0.0,

            "status": "FACE_VERIFICATION_ERROR",

            "error": str(error)
        }

    except Exception as error:

        return {

            "matched": False,

            "confidence": 0.0,

            "status": "FACE_VERIFICATION_ERROR",

            "error": str(error)
        }


# ============================================================
# COMMAND LINE TEST
# ============================================================

if __name__ == "__main__":

    import sys

    if len(sys.argv) != 3:

        print(
            "Usage:"
        )

        print(
            "python face_verify.py "
            "<reference_image> <live_image>"
        )

        sys.exit(1)

    reference_image = sys.argv[1]
    live_image = sys.argv[2]

    result = verify_face(
        reference_image,
        live_image
    )

    print()
    print("=" * 60)
    print("FACE VERIFICATION")
    print("=" * 60)

    for key, value in result.items():

        print(
            f"{key}: {value}"
        )

    print("=" * 60)