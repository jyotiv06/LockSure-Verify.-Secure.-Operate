import cv2
import os


OUTPUT_PATH = "data/live/captured.jpg"


def capture_face(output_path=OUTPUT_PATH):

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        print("ERROR: Could not open camera.")

        return False

    cascade_path = (
        cv2.data.haarcascades
        + "haarcascade_frontalface_default.xml"
    )

    face_detector = cv2.CascadeClassifier(
        cascade_path
    )

    if face_detector.empty():

        print(
            "ERROR: Could not load face detector."
        )

        camera.release()

        return False

    print()
    print("=" * 60)
    print("LOCKSURE - LIVE FACE CAPTURE")
    print("=" * 60)
    print("Look directly at the camera.")
    print("Only ONE person should be visible.")
    print("Press SPACE to capture.")
    print("Press ESC to cancel.")
    print("=" * 60)

    captured = False

    while True:

        ret, frame = camera.read()

        if not ret:

            print(
                "ERROR: Could not read camera frame."
            )

            break

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        face_count = len(faces)

        for (x, y, w, h) in faces:

            cv2.rectangle(
                frame,
                (x, y),
                (x + w, y + h),
                (0, 255, 0),
                2
            )

        if face_count == 0:

            status = (
                "NO FACE - Move into camera"
            )

        elif face_count == 1:

            status = (
                "FACE DETECTED - Press SPACE"
            )

        else:

            status = (
                "MULTIPLE FACES - Only one allowed"
            )

        cv2.putText(
            frame,
            status,
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            "SPACE = Capture | ESC = Cancel",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )

        cv2.imshow(
            "LockSure - Live Face Capture",
            frame
        )

        key = cv2.waitKey(1) & 0xFF

        # ----------------------------------------------------
        # ESC
        # ----------------------------------------------------

        if key == 27:

            print(
                "Capture cancelled."
            )

            break

        # ----------------------------------------------------
        # SPACE
        # ----------------------------------------------------

        if key == 32:

            if face_count == 0:

                print(
                    "Cannot capture: No face detected."
                )

                continue

            if face_count > 1:

                print(
                    "Cannot capture: Multiple faces detected."
                )

                continue

            directory = os.path.dirname(
                output_path
            )

            if directory:

                os.makedirs(
                    directory,
                    exist_ok=True
                )

            success = cv2.imwrite(
                output_path,
                frame
            )

            if success:

                print()
                print(
                    "Face captured successfully."
                )

                print(
                    f"Saved to: {output_path}"
                )

                captured = True

            else:

                print(
                    "ERROR: Could not save image."
                )

            break

    camera.release()

    cv2.destroyAllWindows()

    return captured


if __name__ == "__main__":

    capture_face()