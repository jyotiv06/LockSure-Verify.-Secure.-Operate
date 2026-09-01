import os
import sys
import cv2

from deepface import DeepFace

from config import (
    MODEL_NAME,
    DETECTOR_BACKEND,
    DISTANCE_METRIC,
    USE_ALIGNMENT,
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
    BLUR_THRESHOLD,
)


# ============================================================
# Utility Functions
# ============================================================

def validate_image_path(image_path):
    """
    Check whether the image exists and can be loaded.
    """

    if not image_path:
        return False, "IMAGE_PATH_MISSING"

    if not os.path.exists(image_path):
        return False, "IMAGE_NOT_FOUND"

    image = cv2.imread(image_path)

    if image is None:
        return False, "INVALID_IMAGE"

    return True, image


def check_image_quality(image):
    """
    Perform basic image-quality checks.

    Checks:
    - image dimensions
    - blur
    """

    height, width = image.shape[:2]

    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        return {
            "quality_ok": False,
            "error": "IMAGE_TOO_SMALL",
            "message": "Image resolution is too low. Please recapture."
        }

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Laplacian variance is commonly used as a simple blur indicator.
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()

    if blur_score < BLUR_THRESHOLD:
        return {
            "quality_ok": False,
            "error": "POOR_IMAGE_QUALITY",
            "message": "Image appears blurry. Please recapture.",
            "blur_score": round(float(blur_score), 2)
        }

    return {
        "quality_ok": True,
        "blur_score": round(float(blur_score), 2)
    }


def detect_faces(image_path):
    """
    Detect faces using DeepFace.

    Returns the detected face objects.
    """

    try:

        faces = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=False,
            align=USE_ALIGNMENT,
            anti_spoofing=False
        )

        return faces

    except Exception as error:

        return {
            "error": str(error)
        }


def validate_face_count(image_path, image_type):
    """
    Make sure exactly one face exists.

    Accepted:
        1 face

    Rejected:
        0 faces
        multiple faces
    """

    detected = detect_faces(image_path)

    if isinstance(detected, dict) and "error" in detected:
        return {
            "valid": False,
            "status": "ERROR",
            "error": "FACE_DETECTION_FAILED",
            "message": str(detected["error"])
        }

    face_count = len(detected)

    if face_count == 0:
        return {
            "valid": False,
            "status": "NO_FACE",
            "error": "NO_FACE_DETECTED",
            "message": f"No face detected in {image_type} image."
        }

    if face_count > 1:
        return {
            "valid": False,
            "status": "MULTIPLE_FACES",
            "error": "MULTIPLE_FACES_DETECTED",
            "message": (
                f"Multiple faces detected in {image_type} image. "
                "Please capture only one person's face."
            ),
            "face_count": face_count
        }

    return {
        "valid": True,
        "face_count": 1
    }


# ============================================================
# Main Face Verification Function
# ============================================================

def verify_face(reference_image, live_image):
    """
    Verify whether the reference image and live image
    belong to the same person.

    Parameters
    ----------
    reference_image : str
        Path to registered/customer reference image.

    live_image : str
        Path to captured/live image.

    Returns
    -------
    dict
        Standard face verification response.
    """

    # --------------------------------------------------------
    # 1. Validate reference image
    # --------------------------------------------------------

    reference_valid, reference_data = validate_image_path(reference_image)

    if not reference_valid:
        return {
            "matched": False,
            "confidence": 0.0,
            "status": "ERROR",
            "error": reference_data,
            "message": "Reference image is invalid."
        }

    reference_img = reference_data

    # --------------------------------------------------------
    # 2. Validate live image
    # --------------------------------------------------------

    live_valid, live_data = validate_image_path(live_image)

    if not live_valid:
        return {
            "matched": False,
            "confidence": 0.0,
            "status": "ERROR",
            "error": live_data,
            "message": "Live image is invalid."
        }

    live_img = live_data

    # --------------------------------------------------------
    # 3. Quality check - reference image
    # --------------------------------------------------------

    reference_quality = check_image_quality(reference_img)

    if not reference_quality["quality_ok"]:

        return {
            "matched": False,
            "confidence": 0.0,
            "status": "ERROR",
            "error": reference_quality["error"],
            "message": reference_quality["message"]
        }

    # --------------------------------------------------------
    # 4. Quality check - live image
    # --------------------------------------------------------

    live_quality = check_image_quality(live_img)

    if not live_quality["quality_ok"]:

        return {
            "matched": False,
            "confidence": 0.0,
            "status": "RECAPTURE_REQUIRED",
            "error": live_quality["error"],
            "message": live_quality["message"]
        }

    # --------------------------------------------------------
    # 5. Face count check - reference
    # --------------------------------------------------------

    reference_face = validate_face_count(
        reference_image,
        "reference"
    )

    if not reference_face["valid"]:
        return {
            "matched": False,
            "confidence": 0.0,
            "status": reference_face["status"],
            "error": reference_face["error"],
            "message": reference_face["message"]
        }

    # --------------------------------------------------------
    # 6. Face count check - live
    # --------------------------------------------------------

    live_face = validate_face_count(
        live_image,
        "live"
    )

    if not live_face["valid"]:
        return {
            "matched": False,
            "confidence": 0.0,
            "status": live_face["status"],
            "error": live_face["error"],
            "message": live_face["message"]
        }

    # --------------------------------------------------------
    # 7. DeepFace verification
    # --------------------------------------------------------

    try:

        result = DeepFace.verify(
            img1_path=reference_image,
            img2_path=live_image,

            model_name=MODEL_NAME,

            detector_backend=DETECTOR_BACKEND,

            distance_metric=DISTANCE_METRIC,

            enforce_detection=True,

            align=USE_ALIGNMENT,

            silent=True
        )

    except Exception as error:

        error_message = str(error)

        # DeepFace may raise errors when no face is found.
        if "face" in error_message.lower():

            return {
                "matched": False,
                "confidence": 0.0,
                "status": "NO_FACE",
                "error": "FACE_VERIFICATION_FAILED",
                "message": error_message
            }

        return {
            "matched": False,
            "confidence": 0.0,
            "status": "ERROR",
            "error": "VERIFICATION_FAILED",
            "message": error_message
        }

    # --------------------------------------------------------
    # 8. Extract verification result
    # --------------------------------------------------------

    matched = bool(result.get("verified", False))

    distance = float(result.get("distance", 0.0))

    threshold = float(
        result.get(
            "threshold",
            result.get("max_threshold_to_verify", 0.68)
        )
    )

    # --------------------------------------------------------
    # 9. Confidence
    #
    # Newer DeepFace versions provide confidence in [0,100].
    # Convert to [0,1] for our API contract.
    # --------------------------------------------------------

    deepface_confidence = result.get("confidence")

    if deepface_confidence is not None:

        confidence = float(deepface_confidence) / 100.0

    else:

        # Fallback confidence calculation.
        #
        # IMPORTANT:
        # This is an application score, not a calibrated
        # statistical probability.
        confidence = max(
            0.0,
            min(
                1.0,
                1.0 - (distance / threshold)
            )
        )

    confidence = round(confidence, 3)

    # --------------------------------------------------------
    # 10. Determine status
    # --------------------------------------------------------

    if matched:

        status = "VERIFIED"

    else:

        status = "NOT_VERIFIED"

    # --------------------------------------------------------
    # 11. Standard response
    # --------------------------------------------------------

    return {
        "matched": matched,
        "confidence": confidence,
        "status": status,

        # Additional debugging/integration information
        "model": MODEL_NAME,
        "distance_metric": DISTANCE_METRIC,
        "distance": round(distance, 6),
        "threshold": round(threshold, 6),

        "quality": {
            "reference_blur_score": reference_quality.get(
                "blur_score"
            ),
            "live_blur_score": live_quality.get(
                "blur_score"
            )
        }
    }


# ============================================================
# Command Line Testing
# ============================================================

def print_result(result):
    """
    Print verification result in a readable format.
    """

    print("\n" + "=" * 60)
    print("FACE VERIFICATION RESULT")
    print("=" * 60)

    print(f"Matched    : {result.get('matched')}")
    print(f"Confidence : {result.get('confidence')}")
    print(f"Status     : {result.get('status')}")

    if "model" in result:
        print(f"Model      : {result.get('model')}")

    if "distance" in result:
        print(f"Distance   : {result.get('distance')}")

    if "threshold" in result:
        print(f"Threshold  : {result.get('threshold')}")

    if result.get("error"):
        print(f"Error      : {result.get('error')}")

    if result.get("message"):
        print(f"Message    : {result.get('message')}")

    print("=" * 60)


def main():

    if len(sys.argv) != 3:

        print(
            "\nUsage:\n"
            "python face_verify.py "
            "<reference_image> <live_image>\n"
        )

        print(
            "Example:\n"
            "python face_verify.py "
            "data/reference/customer.jpg "
            "data/live/same_person.jpg"
        )

        sys.exit(1)

    reference_image = sys.argv[1]
    live_image = sys.argv[2]

    result = verify_face(
        reference_image,
        live_image
    )

    print_result(result)


if __name__ == "__main__":
    main()