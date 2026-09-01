from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException

from audit.service import create_audit_log

from integration.ai_services import (
    verify_document_real,
    verify_face_real,
    calculate_risk_real,
    detect_suspicious_real,
)


# ============================================================
# IN-MEMORY VERIFICATION SESSIONS
# ============================================================

verification_sessions = {}


# ============================================================
# VERIFICATION STATES
# ============================================================

VERIFICATION_STATES = [
    "INITIATED",
    "DOCUMENT_VERIFIED",
    "DOCUMENT_FAILED",
    "FACE_VERIFIED",
    "FACE_FAILED",
    "RISK_ASSESSMENT",
    "APPROVED",
    "REVIEW",
    "BLOCKED",
    "COMPLETED",
]


# ============================================================
# UTILITY
# ============================================================

def now():
    return datetime.now().isoformat()


def _audit(session, action, details):
    """
    Create an audit entry for every important verification action.
    """

    return create_audit_log(
        customer_id=session["customer_id"],
        locker_id=session["locker_id"],
        action=action,
        details=details,
        verification_id=session["verification_id"],
    )


# ============================================================
# START VERIFICATION
# ============================================================

def start_verification(
    customer_id: int,
    locker_id: int,
    account_status: str = "ACTIVE",
    failed_attempts: int = 0,
    access_attempts_last_hour: int = 0,
    customer_data: dict | None = None,
):
    """
    Start a new verification session.

    Initial state:
        INITIATED
    """

    verification_id = str(uuid4())

    session = {
        "verification_id": verification_id,

        "customer_id": customer_id,
        "locker_id": locker_id,

        "state": "INITIATED",

        # Document
        "document_match": None,
        "document_result": None,

        # Face
        "face_match": None,
        "face_result": None,

        # Risk
        "risk_result": None,
        "risk_level": None,
        "risk_decision": None,

        # Suspicious activity
        "suspicious_result": None,

        # Account information
        "account_status": account_status.upper(),
        "failed_attempts": failed_attempts,
        "access_attempts_last_hour": access_attempts_last_hour,

        # Data supplied to OCR
        "customer_data": customer_data or {},

        "created_at": now(),
        "updated_at": now(),
    }

    verification_sessions[verification_id] = session

    _audit(
        session,
        "VERIFICATION_STARTED",
        f"Verification {verification_id} started."
    )

    return session


# ============================================================
# GET VERIFICATION
# ============================================================

def get_verification(verification_id: str):
    """
    Return verification session by ID.
    """

    return verification_sessions.get(verification_id)


# ============================================================
# DOCUMENT VERIFICATION
# ============================================================

def process_document(
    verification_id: str,
    document_match: bool | None = None,
    image_path: str | None = None,
    customer_data: dict | None = None,
):
    """
    Process document verification.

    Real integration:

        Akanksha
             ↓
        Samiksha OCR
             ↓
        Document Result

    Real OCR function:

        verify_document(document, customer_data)
    """

    session = verification_sessions.get(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification session not found."
        )

    # --------------------------------------------------------
    # State validation
    # --------------------------------------------------------

    if session["state"] != "INITIATED":
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid state transition: "
                f"document result is not allowed from "
                f"{session['state']}"
            )
        )

    # --------------------------------------------------------
    # REAL SAMIKSHA OCR
    # --------------------------------------------------------

    if image_path:

        data = customer_data or session["customer_data"]

        required_fields = [
            "name",
            "dob",
            "id_number",
            "address",
        ]

        missing = [
            field
            for field in required_fields
            if not data.get(field)
        ]

        if missing:
            raise HTTPException(
                status_code=400,
                detail=(
                    "customer_data is missing: "
                    + ", ".join(missing)
                )
            )

        try:
            result = verify_document_real(
                image_path,
                data
            )
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Document AI error: {str(error)}"
            )

        if not isinstance(result, dict):
            raise HTTPException(
                status_code=500,
                detail="OCR returned an invalid result."
            )

        document_match = bool(
            result.get("verified", False)
        )

        session["document_result"] = result
        session["customer_data"] = data

    # --------------------------------------------------------
    # MANUAL TESTING MODE
    # --------------------------------------------------------

    elif document_match is not None:

        session["document_result"] = {
            "verified": bool(document_match),
            "source": "manual_test_input"
        }

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                "Provide either image_path for real OCR "
                "or document_match for testing."
            )
        )

    # --------------------------------------------------------
    # SAVE RESULT
    # --------------------------------------------------------

    session["document_match"] = bool(document_match)

    if session["document_match"]:

        session["state"] = "DOCUMENT_VERIFIED"

        action = "DOCUMENT_VERIFIED"

        details = (
            "Document verification passed."
        )

    else:

        session["state"] = "DOCUMENT_FAILED"

        action = "DOCUMENT_FAILED"

        details = (
            "Document verification failed."
        )

    session["updated_at"] = now()

    _audit(
        session,
        action,
        details
    )

    return session


# ============================================================
# FACE VERIFICATION
# ============================================================

def process_face(
    verification_id: str,
    face_match: bool | None = None,
    reference_image: str | None = None,
    live_image: str | None = None,
):
    """
    Process face verification.

    Real integration:

        Akanksha
             ↓
        Dhanashree DeepFace
             ↓
        Face Result

    Dhanashree's verify_face() returns:

        {
            "matched": True/False,
            "confidence": ...,
            "status": ...,
            ...
        }
    """

    session = verification_sessions.get(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification session not found."
        )

    # --------------------------------------------------------
    # State validation
    # --------------------------------------------------------

    if session["state"] != "DOCUMENT_VERIFIED":
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid state transition: "
                f"face result is not allowed from "
                f"{session['state']}"
            )
        )

    # --------------------------------------------------------
    # REAL DHANASHREE DEEPFACE
    # --------------------------------------------------------

    if reference_image and live_image:

        try:
            result = verify_face_real(
                reference_image,
                live_image
            )

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Face AI error: {str(error)}"
            )

        if not isinstance(result, dict):
            raise HTTPException(
                status_code=500,
                detail=(
                    "Dhanashree face verification "
                    "returned an invalid result."
                )
            )

        # IMPORTANT:
        # Dhanashree's face_verify.py returns "matched",
        # NOT "verified".
        face_match = bool(
            result.get("matched", False)
        )

        session["face_result"] = result

    # --------------------------------------------------------
    # MANUAL TESTING MODE
    # --------------------------------------------------------

    elif face_match is not None:

        session["face_result"] = {
            "matched": bool(face_match),
            "source": "manual_test_input"
        }

    else:

        raise HTTPException(
            status_code=400,
            detail=(
                "Provide reference_image + live_image "
                "for real face AI or face_match for testing."
            )
        )

    # --------------------------------------------------------
    # SAVE RESULT
    # --------------------------------------------------------

    session["face_match"] = bool(face_match)

    if session["face_match"]:

        session["state"] = "FACE_VERIFIED"

        action = "FACE_VERIFIED"

        details = (
            "Dhanashree face verification passed."
        )

    else:

        session["state"] = "FACE_FAILED"

        action = "FACE_FAILED"

        details = (
            "Dhanashree face verification failed."
        )

    session["updated_at"] = now()

    _audit(
        session,
        action,
        details
    )

    return session


# ============================================================
# FINALIZE VERIFICATION + RISK
# ============================================================

def finalize_verification(verification_id: str):
    """
    Final verification stage.

    Flow:

        Document Verified
              ↓
        Face Verified
              ↓
        Anisha Risk Engine
              ↓
        Risk Decision
              ↓
        APPROVED / REVIEW / BLOCKED
    """

    session = verification_sessions.get(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification session not found."
        )

    # --------------------------------------------------------
    # State validation
    # --------------------------------------------------------

    if session["state"] != "FACE_VERIFIED":
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid state transition: "
                f"finalization is not allowed from "
                f"{session['state']}"
            )
        )

    # --------------------------------------------------------
    # RISK INPUT
    # --------------------------------------------------------

    risk_input = {
        "face_match": session["face_match"],
        "document_match": session["document_match"],
        "account_status": session["account_status"],
        "failed_attempts": session["failed_attempts"],
    }

    suspicious_input = {
        **risk_input,
        "access_attempts_last_hour": (
            session["access_attempts_last_hour"]
        ),
    }

    # --------------------------------------------------------
    # RISK ASSESSMENT STATE
    # --------------------------------------------------------

    session["state"] = "RISK_ASSESSMENT"
    session["updated_at"] = now()

    _audit(
        session,
        "RISK_ASSESSMENT_STARTED",
        "Risk assessment started using risk engine."
    )

    # --------------------------------------------------------
    # ANISHA RISK ENGINE
    # --------------------------------------------------------

    try:

        risk_result = calculate_risk_real(
            risk_input
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Risk engine error: {str(error)}"
        )

    if not isinstance(risk_result, dict):

        raise HTTPException(
            status_code=500,
            detail="Risk engine returned an invalid result."
        )

    # --------------------------------------------------------
    # SUSPICIOUS ACTIVITY ENGINE
    # --------------------------------------------------------

    try:

        suspicious_result = detect_suspicious_real(
            suspicious_input
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Suspicious activity engine error: {str(error)}"
            )
        )

    if not isinstance(suspicious_result, dict):

        suspicious_result = {
            "severity": "LOW"
        }

    # --------------------------------------------------------
    # SAVE RISK RESULTS
    # --------------------------------------------------------

    session["risk_result"] = risk_result

    session["suspicious_result"] = suspicious_result

    session["risk_level"] = risk_result.get(
        "risk_level",
        "UNKNOWN"
    )

    # --------------------------------------------------------
    # GET DECISION
    # --------------------------------------------------------

    decision = str(
        risk_result.get(
            "decision",
            "REVIEW"
        )
    ).upper()

    suspicious_severity = str(
        suspicious_result.get(
            "severity",
            "LOW"
        )
    ).upper()

    # --------------------------------------------------------
    # HIGH SUSPICIOUS ACTIVITY OVERRIDE
    # --------------------------------------------------------

    if suspicious_severity == "HIGH":

        decision = "BLOCK"

    session["risk_decision"] = decision

    # --------------------------------------------------------
    # AUDIT RISK RESULT
    # --------------------------------------------------------

    _audit(
        session,
        "RISK_CALCULATED",
        (
            "Anisha risk engine: "
            f"score={risk_result.get('risk_score')}, "
            f"level={risk_result.get('risk_level')}, "
            f"decision={risk_result.get('decision')}. "
            f"Suspicious severity={suspicious_severity}."
        )
    )

    # ========================================================
    # APPROVED
    # ========================================================

    if decision == "APPROVE":

        session["state"] = "APPROVED"

        _audit(
            session,
            "VERIFICATION_APPROVED",
            (
                "Verification approved. "
                "Locker operation is allowed."
            )
        )

    # ========================================================
    # REVIEW
    # ========================================================

    elif decision == "REVIEW":

        session["state"] = "REVIEW"

        _audit(
            session,
            "VERIFICATION_REVIEW",
            (
                "Verification requires manual review. "
                "Locker remains closed."
            )
        )

    # ========================================================
    # BLOCKED
    # ========================================================

    else:

        session["state"] = "BLOCKED"

        _audit(
            session,
            "VERIFICATION_BLOCKED",
            (
                "Verification blocked. "
                "Locker operation is not allowed."
            )
        )

        # ----------------------------------------------------
        # HIGH RISK ALERT
        # ----------------------------------------------------

        if suspicious_severity == "HIGH":

            _audit(
                session,
                "ALERT_RAISED",
                (
                    "High-risk suspicious activity detected. "
                    "Locker operation blocked."
                )
            )

    # --------------------------------------------------------
    # FINAL UPDATE
    # --------------------------------------------------------

    session["updated_at"] = now()

    return session