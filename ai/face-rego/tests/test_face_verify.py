import sys
import os

PROJECT_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(PROJECT_DIR)

from face_verify import verify_face

REFERENCE = "data/reference/customer.jpg"


def run_test(name, image):

    print("\n")
    print("=" * 50)
    print(name)
    print("=" * 50)

    result = verify_face(
        REFERENCE,
        image
    )

    print(result)


if __name__ == "__main__":

    run_test(
        "TEST 1 - SAME PERSON",
        "data/live/same_person.jpg"
    )

    run_test(
        "TEST 2 - DIFFERENT PERSON",
        "data/live/different_person.jpg"
    )

    run_test(
        "TEST 3 - NO FACE",
        "data/live/no_face.jpg"
    )

    run_test(
        "TEST 4 - MULTIPLE FACES",
        "data/live/multiple_faces.jpg"
    )

    run_test(
        "TEST 5 - POOR QUALITY",
        "data/live/poor_quality.jpg"
    )