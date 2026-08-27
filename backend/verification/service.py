from uuid import uuid4
from datetime import datetime


# Temporary in-memory storage.
# Database will be integrated later.
verification_sessions = {}


VERIFICATION_STATES = [
    "INITIATED",
    "DOCUMENT_PENDING",
    "DOCUMENT_VERIFIED",
    "DOCUMENT_FAILED",
    "FACE_PENDING",
    "FACE_VERIFIED",
    "FACE_FAILED",
    "RISK_ASSESSMENT",
    "APPROVED",
    "REVIEW",
    "BLOCKED",
    "COMPLETED",
]


def start_verification(customer_id: int, locker_id: int):
    verification_id = str(uuid4())

    session = {
        "verification_id": verification_id,
        "customer_id": customer_id,
        "locker_id": locker_id,
        "state": "INITIATED",
        "document_match": None,
        "face_match": None,
        "risk_decision": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    verification_sessions[verification_id] = session

    return session


def get_verification(verification_id: str):
    return verification_sessions.get(verification_id)


def process_document(
    verification_id: str,
    document_match: bool
):
    session = verification_sessions.get(verification_id)

    if not session:
        return None

    session["document_match"] = document_match

    if document_match:
        session["state"] = "DOCUMENT_VERIFIED"
    else:
        session["state"] = "DOCUMENT_FAILED"

    session["updated_at"] = datetime.now().isoformat()

    return session


def process_face(
    verification_id: str,
    face_match: bool
):
    session = verification_sessions.get(verification_id)

    if not session:
        return None

    session["face_match"] = face_match

    if face_match:
        session["state"] = "FACE_VERIFIED"
    else:
        session["state"] = "FACE_FAILED"

    session["updated_at"] = datetime.now().isoformat()

    return session


def finalize_verification(verification_id: str):
    session = verification_sessions.get(verification_id)

    if not session:
        return None

    document_match = session["document_match"]
    face_match = session["face_match"]

    # Dummy risk engine for today's implementation.
    if document_match is True and face_match is True:
        decision = "APPROVE"
        state = "APPROVED"

    elif document_match is False or face_match is False:
        decision = "BLOCK"
        state = "BLOCKED"

    else:
        decision = "REVIEW"
        state = "REVIEW"

    session["state"] = state
    session["risk_decision"] = decision
    session["updated_at"] = datetime.now().isoformat()

    return session