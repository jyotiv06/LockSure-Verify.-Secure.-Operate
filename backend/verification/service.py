from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal

from models.verification_session import VerificationSession
from models.locker import Locker
from models.document import Document
from models.document_verification import DocumentVerification
from models.face_verification import FaceVerification
from models.risk_assessment import RiskAssessment

from audit.service import create_audit_log

from integration.ai_services import (
    verify_document_real,
    verify_face_real,
    calculate_risk_real,
    detect_suspicious_real,
)


# Extra risk/AI inputs supplied when verification starts.
# The actual verification session remains stored in PostgreSQL.
verification_contexts = {}


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


def get_db():
    return SessionLocal()


def now():
    return datetime.now().isoformat()


def _audit(
    session,
    locker_number,
    action,
    details,
):
    """
    Create an audit entry without making audit failure
    break the main verification workflow.
    """

    try:
        create_audit_log(
            customer_id=session.customer_id,
            locker_id=locker_number,
            action=action,
            details=details,
            verification_id=str(session.session_id),
        )
    except Exception:
        # Audit must not break the verification flow.
        pass


# =========================================================
# START VERIFICATION
# =========================================================

def start_verification(
    customer_id: int,
    locker_id: str,
    account_status: str = "ACTIVE",
    failed_attempts: int = 0,
    access_attempts_last_hour: int = 0,
    customer_data: dict | None = None,
):

    db: Session = get_db()

    try:

        # API accepts business locker number such as "L001".
        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_number == locker_id
            )
            .first()
        )

        if not locker:
            return None


        session = VerificationSession(
            customer_id=customer_id,
            locker_id=locker.locker_id,
            status="IN_PROGRESS",
        )

        db.add(session)
        db.commit()
        db.refresh(session)


        # Store temporary verification context.
        verification_contexts[str(session.session_id)] = {
            "account_status": account_status.upper(),
            "failed_attempts": failed_attempts,
            "access_attempts_last_hour": access_attempts_last_hour,
            "customer_data": customer_data or {},
        }


        _audit(
            session,
            locker.locker_number,
            "VERIFICATION_STARTED",
            f"Verification {session.session_id} started.",
        )


        return {
            "verification_id": str(session.session_id),
            "customer_id": session.customer_id,
            "locker_id": locker.locker_number,
            "state": "INITIATED",
            "document_match": None,
            "face_match": None,
            "risk_decision": None,
            "risk_score": None,
            "risk_level": None,
            "reason": None,
            "created_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            ),
            "updated_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            ),
        }

    finally:
        db.close()


# =========================================================
# GET VERIFICATION
# =========================================================

def get_verification(verification_id: str):

    db: Session = get_db()

    try:

        try:
            session_id = int(verification_id)
        except ValueError:
            return None


        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id == session_id
            )
            .first()
        )

        if not session:
            return None


        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id == session.locker_id
            )
            .first()
        )


        document = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.session_id
                == session.session_id
            )
            .order_by(
                DocumentVerification.document_verification_id.desc()
            )
            .first()
        )


        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id
                == session.session_id
            )
            .order_by(
                FaceVerification.face_verification_id.desc()
            )
            .first()
        )


        risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.session_id
                == session.session_id
            )
            .order_by(
                RiskAssessment.risk_id.desc()
            )
            .first()
        )


        document_match = (
            document.result == "PASSED"
            if document
            else None
        )


        face_match = (
            face.result == "PASSED"
            if face
            else None
        )


        return {
            "verification_id": str(session.session_id),

            "customer_id": session.customer_id,

            "locker_id": (
                locker.locker_number
                if locker
                else None
            ),

            "state": (
                "INITIATED"
                if session.status == "IN_PROGRESS"
                else session.status
            ),

            "document_match": document_match,

            "document_match_score": (
                float(document.match_score)
                if document and document.match_score is not None
                else None
            ),

            "face_match": face_match,

            "face_match_score": (
                float(face.match_score)
                if face and face.match_score is not None
                else None
            ),

            "risk_decision": (
                risk.risk_level
                if risk
                else None
            ),

            # IMPORTANT:
            # These fields were missing before.
            # Your frontend RiskAssessment needs them.
            "risk_score": (
                float(risk.risk_score)
                if risk and risk.risk_score is not None
                else None
            ),

            "risk_level": (
                risk.risk_level
                if risk
                else None
            ),

            "reason": (
                risk.reason
                if risk
                else None
            ),

            "created_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            ),

            "updated_at": (
                session.completed_at.isoformat()
                if session.completed_at
                else (
                    session.started_at.isoformat()
                    if session.started_at
                    else None
                )
            ),
        }

    finally:
        db.close()


# =========================================================
# DOCUMENT VERIFICATION
# =========================================================

def process_document(
    verification_id: str,
    document_match: bool | None = None,
    image_path: str | None = None,
    customer_data: dict | None = None,
):

    db: Session = get_db()

    try:

        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id
                == int(verification_id)
            )
            .first()
        )

        if not session:
            return None


        if session.status not in [
            "IN_PROGRESS",
            "DOCUMENT_VERIFIED",
        ]:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid state transition for "
                    "document verification."
                ),
            )


        context = verification_contexts.get(
            verification_id,
            {},
        )


        data = (
            customer_data
            or context.get("customer_data", {})
        )


        # -------------------------------------------------
        # REAL OCR MODE
        # -------------------------------------------------

        if image_path:

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
                    ),
                )


            try:

                result = verify_document_real(
                    image_path,
                    data,
                )

            except Exception as error:

                raise HTTPException(
                    status_code=500,
                    detail=f"Document AI error: {str(error)}",
                )


            if not isinstance(result, dict):

                raise HTTPException(
                    status_code=500,
                    detail="OCR returned an invalid result.",
                )


            document_match = bool(
                result.get("verified", False)
            )


        # -------------------------------------------------
        # MANUAL TEST MODE
        # -------------------------------------------------

        elif document_match is not None:

            result = {
                "verified": bool(document_match),
                "source": "manual_test_input",
            }


        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Provide either image_path for real OCR "
                    "or document_match for testing."
                ),
            )


        # -------------------------------------------------
        # FIND OR CREATE CUSTOMER DOCUMENT
        # -------------------------------------------------

        document = (
            db.query(Document)
            .filter(
                Document.customer_id == session.customer_id
            )
            .order_by(
                Document.document_id.desc()
            )
            .first()
        )


        if not document:

            document = Document(
                customer_id=session.customer_id,
                document_type="IDENTITY_DOCUMENT",
                document_number=(
                    f"VERIFICATION-{session.session_id}"
                ),
                document_reference=image_path,
                verified=False,
            )

            db.add(document)
            db.flush()


        # -------------------------------------------------
        # SAVE DOCUMENT VERIFICATION
        # -------------------------------------------------

        verification = DocumentVerification(
            session_id=session.session_id,
            document_id=document.document_id,
            match_score=(
                100.00
                if document_match
                else 0.00
            ),
            result=(
                "PASSED"
                if document_match
                else "FAILED"
            ),
        )


        db.add(verification)

        document.verified = bool(
            document_match
        )


        session.status = (
            "DOCUMENT_VERIFIED"
            if document_match
            else "DOCUMENT_FAILED"
        )


        db.commit()


        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id == session.locker_id
            )
            .first()
        )


        _audit(
            session,
            (
                locker.locker_number
                if locker
                else None
            ),
            (
                "DOCUMENT_VERIFIED"
                if document_match
                else "DOCUMENT_FAILED"
            ),
            (
                "Document verification passed."
                if document_match
                else "Document verification failed."
            ),
        )


        return get_verification(
            verification_id
        )

    finally:
        db.close()


# =========================================================
# FACE VERIFICATION
# =========================================================

def process_face(
    verification_id: str,
    face_match: bool | None = None,
    reference_image: str | None = None,
    live_image: str | None = None,
):

    db: Session = get_db()

    try:

        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id
                == int(verification_id)
            )
            .first()
        )

        if not session:
            return None


        if session.status != "DOCUMENT_VERIFIED":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Face verification is allowed only "
                    "after document verification."
                ),
            )


        # -------------------------------------------------
        # REAL FACE VERIFICATION
        # -------------------------------------------------

        if reference_image and live_image:

            try:

                result = verify_face_real(
                    reference_image,
                    live_image,
                )

            except Exception as error:

                raise HTTPException(
                    status_code=500,
                    detail=f"Face AI error: {str(error)}",
                )


            if not isinstance(result, dict):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Face verification returned "
                        "an invalid result."
                    ),
                )


            face_match = bool(
                result.get("matched", False)
            )


        # -------------------------------------------------
        # MANUAL TEST MODE
        # -------------------------------------------------

        elif face_match is not None:

            result = {
                "matched": bool(face_match),
                "source": "manual_test_input",
            }


        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Provide reference_image + live_image "
                    "for real face AI or face_match for testing."
                ),
            )


        # -------------------------------------------------
        # SAVE FACE RESULT
        # -------------------------------------------------

        verification = FaceVerification(
            session_id=session.session_id,
            customer_id=session.customer_id,
            match_score=(
                100.00
                if face_match
                else 0.00
            ),
            result=(
                "PASSED"
                if face_match
                else "FAILED"
            ),
        )


        db.add(verification)


        session.status = (
            "FACE_VERIFIED"
            if face_match
            else "FACE_FAILED"
        )


        db.commit()


        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id == session.locker_id
            )
            .first()
        )


        _audit(
            session,
            (
                locker.locker_number
                if locker
                else None
            ),
            (
                "FACE_VERIFIED"
                if face_match
                else "FACE_FAILED"
            ),
            (
                "Face verification passed."
                if face_match
                else "Face verification failed."
            ),
        )


        return get_verification(
            verification_id
        )

    finally:
        db.close()


# =========================================================
# FINALIZE VERIFICATION
# =========================================================

def finalize_verification(
    verification_id: str
):

    db: Session = get_db()

    try:

        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id
                == int(verification_id)
            )
            .first()
        )


        if not session:
            return None


        # -------------------------------------------------
        # GET ACTUAL DOCUMENT RESULT
        # -------------------------------------------------

        document = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.session_id
                == session.session_id
            )
            .order_by(
                DocumentVerification
                .document_verification_id
                .desc()
            )
            .first()
        )


        # -------------------------------------------------
        # GET ACTUAL FACE RESULT
        # -------------------------------------------------

        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id
                == session.session_id
            )
            .order_by(
                FaceVerification
                .face_verification_id
                .desc()
            )
            .first()
        )


        document_result = (
            document.result
            if document
            else None
        )


        face_result = (
            face.result
            if face
            else None
        )


        document_match = (
            document_result == "PASSED"
        )


        face_match = (
            face_result == "PASSED"
        )


        # -------------------------------------------------
        # VALIDATE ACTUAL RESULTS
        # -------------------------------------------------

        if not document_match or not face_match:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Finalization is allowed only after "
                    "document and face verification pass."
                ),
            )


        # -------------------------------------------------
        # GET RISK / SECURITY CONTEXT
        # -------------------------------------------------

        context = verification_contexts.get(
            verification_id,
            {},
        )


        risk_input = {
            "face_match": face_match,
            "document_match": document_match,
            "account_status": context.get(
                "account_status",
                "ACTIVE",
            ),
            "failed_attempts": context.get(
                "failed_attempts",
                0,
            ),
        }


        suspicious_input = {
            **risk_input,

            "access_attempts_last_hour": context.get(
                "access_attempts_last_hour",
                0,
            ),
        }


        # -------------------------------------------------
        # START RISK ASSESSMENT
        # -------------------------------------------------

        session.status = "RISK_ASSESSMENT"

        db.commit()


        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id
                == session.locker_id
            )
            .first()
        )


        locker_number = (
            locker.locker_number
            if locker
            else None
        )


        _audit(
            session,
            locker_number,
            "RISK_ASSESSMENT_STARTED",
            "Risk assessment started.",
        )


        # -------------------------------------------------
        # RISK ENGINE
        # -------------------------------------------------

        try:

            risk_result = calculate_risk_real(
                risk_input
            )

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Risk engine error: {str(error)}"
                ),
            )


        if not isinstance(
            risk_result,
            dict,
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Risk engine returned "
                    "an invalid result."
                ),
            )


        risk_score = float(
            risk_result.get(
                "risk_score",
                risk_result.get(
                    "score",
                    10.0,
                ),
            )
        )


        risk_level = str(
            risk_result.get(
                "risk_level",
                "LOW",
            )
        ).upper()


        reason = risk_result.get(
            "reason",
            (
                "Document and face verification "
                "passed."
            ),
        )


        # -------------------------------------------------
        # SUSPICIOUS ACTIVITY ENGINE
        # -------------------------------------------------

        try:

            suspicious_result = detect_suspicious_real(
                suspicious_input
            )

        except Exception as error:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Suspicious activity engine error: "
                    f"{str(error)}"
                ),
            )


        if not isinstance(
            suspicious_result,
            dict,
        ):

            suspicious_result = {}


        suspicious_severity = str(
            suspicious_result.get(
                "severity",
                suspicious_result.get(
                    "risk_level",
                    "LOW",
                ),
            )
        ).upper()


        suspicious = bool(
            suspicious_result.get(
                "suspicious",
                False,
            )
        )


        # -------------------------------------------------
        # FINAL DECISION
        # -------------------------------------------------

        if (
            suspicious_severity == "HIGH"
            or suspicious
        ):

            decision = "BLOCK"
            final_state = "BLOCKED"


        elif risk_level == "HIGH":

            decision = "BLOCK"
            final_state = "BLOCKED"


        elif risk_level == "MEDIUM":

            decision = "REVIEW"
            final_state = "REVIEW"


        else:

            decision = "APPROVE"
            final_state = "APPROVED"


        # -------------------------------------------------
        # SAVE RISK ASSESSMENT
        # -------------------------------------------------

        risk = RiskAssessment(
            session_id=session.session_id,
            risk_score=risk_score,
            risk_level=risk_level,
            reason=reason,
        )


        db.add(risk)


        # -------------------------------------------------
        # UPDATE SESSION
        # -------------------------------------------------

        session.status = final_state

        session.completed_at = datetime.now()


        db.commit()


        # -------------------------------------------------
        # AUDIT FINAL DECISION
        # -------------------------------------------------

        if final_state == "APPROVED":

            _audit(
                session,
                locker_number,
                "VERIFICATION_APPROVED",
                (
                    "Verification approved. "
                    "Locker operation is allowed."
                ),
            )


        elif final_state == "REVIEW":

            _audit(
                session,
                locker_number,
                "VERIFICATION_REVIEW",
                (
                    "Verification requires manual review. "
                    "Locker remains closed."
                ),
            )


        else:

            _audit(
                session,
                locker_number,
                "VERIFICATION_BLOCKED",
                (
                    "Verification blocked. "
                    "Locker operation is not allowed."
                ),
            )


            if suspicious_severity == "HIGH":

                _audit(
                    session,
                    locker_number,
                    "ALERT_RAISED",
                    (
                        "High-risk suspicious activity "
                        "detected. Locker operation blocked."
                    ),
                )


        # -------------------------------------------------
        # RETURN COMPLETE FINAL DATA
        # -------------------------------------------------

        return {
            "verification_id": str(
                session.session_id
            ),

            "customer_id": session.customer_id,

            "locker_id": locker_number,

            "state": final_state,

            "document_match": document_match,

            "document_match_score": (
                float(document.match_score)
                if document
                and document.match_score is not None
                else None
            ),

            "face_match": face_match,

            "face_match_score": (
                float(face.match_score)
                if face
                and face.match_score is not None
                else None
            ),

            "risk_decision": decision,

            "risk_level": risk_level,

            "risk_score": float(
                risk_score
            ),

            "reason": reason,

            "suspicious_activity": suspicious,

            "suspicious_severity": (
                suspicious_severity
            ),

            "created_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            ),

            "updated_at": (
                session.completed_at.isoformat()
                if session.completed_at
                else None
            ),
        }

    finally:
        db.close()