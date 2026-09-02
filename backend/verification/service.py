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
from models.customer import Customer

from audit.service import create_audit_log

from integration.ai_services import (
    verify_document_real,
    verify_face_real,
    calculate_risk_real,
    detect_suspicious_real,
)
from pathlib import Path

from database import get_db


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
            "document_match": (
                document.result == "PASSED"
                if document
                else None
            ),
            "document_score": (
                float(document.match_score)
                if document and document.match_score is not None
                else None
            ),
            "face_match": (
                face.result == "PASSED"
                if face
                else None
            ),
            "face_score": (
                float(face.match_score)
                if face and face.match_score is not None
                else None
            ),
            "risk_decision": (
                risk.risk_level
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

        # ------------------------------------------------------------
        # BUILD CUSTOMER VERIFICATION DATA FROM THE DATABASE
        # ------------------------------------------------------------
        # The frontend may send partial customer_data (for example only
        # name/email/phone). Do NOT use that partial payload as the
        # verification source of truth. Always load the logged-in
        # customer's database record and merge any explicitly supplied
        # values on top only when present.
        #
        # Current Customer schema provides:
        #   full_name       -> name
        #   date_of_birth   -> dob
        #   customer_number -> id_number (demo identity number)
        #   address         -> address
        # ------------------------------------------------------------

        context_data = context.get("customer_data", {}) or {}
        supplied_data = customer_data or {}

        customer = (
            db.query(Customer)
            .filter(
                Customer.customer_id == session.customer_id
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer record not found for verification."
            )

        data = {
            "name": customer.full_name,
            "dob": (
                customer.date_of_birth.isoformat()
                if customer.date_of_birth
                else None
            ),
            "id_number": customer.customer_number,
            "address": customer.address,
            "email": customer.email,
            "phone": customer.phone,
        }

        # Preserve any explicitly supplied non-empty fields, while the
        # database remains the source of truth for missing values.
        for key, value in {**context_data, **supplied_data}.items():
            if value is not None and str(value).strip():
                data[key] = value

        # Normalize common API field names before sending data to OCR.
        if not data.get("dob") and data.get("date_of_birth"):
            data["dob"] = data["date_of_birth"]

        if not data.get("name") and data.get("full_name"):
            data["name"] = data["full_name"]

        if not data.get("id_number") and data.get("customer_number"):
            data["id_number"] = data["customer_number"]

        # -------------------------------
        # REAL OCR MODE
        # -------------------------------

        if image_path:

            # The upload endpoint supplies the registered customer
            # details that are available in the current schema.
            # The OCR module is responsible for extracting and
            # validating the document fields it supports.
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

        # -------------------------------
        # MANUAL TEST MODE
        # -------------------------------

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

        # -------------------------------
        # -------------------------------
        # FIND OR CREATE CUSTOMER DOCUMENT
        # -------------------------------

        document = (
            db.query(Document)
            .filter(Document.customer_id == session.customer_id)
            .order_by(Document.document_id.desc())
            .first()
        )

        # Fresh customers may not have a document row yet.
        # Create a document record automatically for this verification.
        if not document:
            document = Document(
                customer_id=session.customer_id,
                document_type="IDENTITY_DOCUMENT",
                document_number=f"VERIFICATION-{session.session_id}",
                document_reference=image_path,
                verified=False,
            )
            db.add(document)
            db.flush()

        # -------------------------------
        # SAVE DOCUMENT VERIFICATION
        # -------------------------------

        # Keep OCR diagnostics in the in-memory result for API callers.
        # These do not affect the verification decision.
        if isinstance(result, dict):
            result.setdefault("customer_data_used", {
                "name": data.get("name"),
                "dob": data.get("dob"),
                "id_number": data.get("id_number"),
                "address": data.get("address"),
            })

        document_score = 100.00 if document_match else 0.00
        if isinstance(result, dict):
            for key in (
                "match_score",
                "confidence",
                "score",
                "similarity",
            ):
                value = result.get(key)
                if isinstance(value, (int, float)):
                    document_score = float(value)
                    if document_score <= 1:
                        document_score *= 100
                    document_score = max(
                        0.0,
                        min(100.0, document_score),
                    )
                    break

        verification = DocumentVerification(
            session_id=session.session_id,
            document_id=document.document_id,
            match_score=document_score,
            result="PASSED" if document_match else "FAILED",
        )

        db.add(verification)
        document.verified = bool(document_match)

        session.status = (
            "DOCUMENT_VERIFIED"
            if document_match
            else "DOCUMENT_FAILED"
        )

        db.commit()

        locker = (
            db.query(Locker)
            .filter(Locker.locker_id == session.locker_id)
            .first()
        )

        _audit(
            session,
            locker.locker_number if locker else None,
            "DOCUMENT_VERIFIED" if document_match else "DOCUMENT_FAILED",
            "Document verification passed."
            if document_match
            else "Document verification failed.",
        )

        return get_verification(verification_id)

    finally:
        db.close()

def process_face(
    verification_id: str,
    face_match: bool | None = None,
    reference_image: str | None = None,
    live_image: str | None = None,
):
    """Run real DeepFace verification using the verified document image.

    DeepFace receives the original verified document image and the live
    webcam image. DeepFace performs face detection internally, so no
    separate OCR/photo-extraction pipeline is required here.
    """

    db: Session = get_db()

    try:
        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id == int(verification_id)
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

        result = None

        # Real browser flow: only live_image is supplied.
        # Automatically obtain the reference photo from the verified document.
        if live_image:
            if not reference_image:
                document_verification = (
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

                if not document_verification:
                    raise HTTPException(
                        status_code=400,
                        detail="No verified document found for face verification.",
                    )

                document = (
                    db.query(Document)
                    .filter(
                        Document.document_id
                        == document_verification.document_id
                    )
                    .first()
                )

                if not document or not document.document_reference:
                    raise HTTPException(
                        status_code=400,
                        detail="Reference document image is unavailable.",
                    )

                document_path = document.document_reference

                if not Path(document_path).exists():
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Reference document image does not exist: "
                            f"{document_path}"
                        ),
                    )

                # Use the original verified document image as the DeepFace
                # reference. DeepFace performs its own face detection, so
                # there is no need to crop the document photo beforehand.
                # This avoids the PaddleOCR pipeline being initialized during
                # face verification and preserves the full document image.
                reference_image = document_path

            if not Path(reference_image).exists():
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Reference face image does not exist: "
                        f"{reference_image}"
                    ),
                )

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
                    detail="Face verification returned an invalid result.",
                )

            face_match = bool(result.get("matched", False))

        # Explicit backend-only test mode.
        elif face_match is not None:
            result = {
                "matched": bool(face_match),
                "source": "manual_test_input",
            }

        else:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Provide live_image for real face AI "
                    "or face_match for testing."
                ),
            )

        face_score = 100.00 if face_match else 0.00

        if isinstance(result, dict):
            for key in (
                "confidence",
                "match_score",
                "similarity",
                "score",
            ):
                value = result.get(key)

                if isinstance(value, (int, float)):
                    face_score = float(value)

                    if face_score <= 1:
                        face_score *= 100

                    face_score = max(
                        0.0,
                        min(100.0, face_score),
                    )
                    break

        verification = FaceVerification(
            session_id=session.session_id,
            customer_id=session.customer_id,
            match_score=face_score,
            result="PASSED" if face_match else "FAILED",
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
            locker.locker_number if locker else None,
            "FACE_VERIFIED" if face_match else "FACE_FAILED",
            (
                "Face verification passed."
                if face_match
                else "Face verification failed."
            ),
        )

        response = get_verification(verification_id)

        if isinstance(response, dict):
            response["face_score"] = face_score

            if isinstance(result, dict):
                response["face_ai"] = {
                    key: value
                    for key, value in result.items()
                    if key in (
                        "matched",
                        "confidence",
                        "distance",
                        "threshold",
                        "model",
                        "detector_backend",
                        "similarity_metric",
                        "status",
                    )
                }

        return response

    finally:
        db.close()

def finalize_verification(verification_id: str):

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

        if session.status != "FACE_VERIFIED":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Finalization is allowed only after "
                    "document and face verification."
                ),
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

        document_match = (
            document is not None
            and document.result == "PASSED"
        )

        face_match = (
            face is not None
            and face.result == "PASSED"
        )

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

        session.status = "RISK_ASSESSMENT"
        db.commit()

        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id == session.locker_id
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

        # -------------------------------
        # RISK ENGINE
        # -------------------------------

        try:
            risk_result = calculate_risk_real(
                risk_input
            )
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Risk engine error: {str(error)}",
            )

        if not isinstance(risk_result, dict):
            raise HTTPException(
                status_code=500,
                detail="Risk engine returned an invalid result.",
            )

        # -------------------------------
        # SUSPICIOUS ACTIVITY ENGINE
        # -------------------------------

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

        if not isinstance(suspicious_result, dict):
            suspicious_result = {
                "severity": "LOW"
            }

        risk_score = float(
            risk_result.get(
                "risk_score",
                50.00,
            )
        )

        risk_level = str(
            risk_result.get(
                "risk_level",
                "MEDIUM",
            )
        ).upper()

        decision = str(
            risk_result.get(
                "decision",
                "REVIEW",
            )
        ).upper()

        suspicious_severity = str(
            suspicious_result.get(
                "severity",
                "LOW",
            )
        ).upper()

        # High suspicious activity always blocks.
        if suspicious_severity == "HIGH":
            decision = "BLOCK"

        if decision == "APPROVE":
            state = "APPROVED"
            reason = (
                "Verification approved by risk assessment."
            )

        elif decision == "BLOCK":
            state = "BLOCKED"
            reason = (
                "Verification blocked by risk assessment."
            )

        else:
            decision = "REVIEW"
            state = "REVIEW"
            reason = (
                "Verification requires manual review."
            )

        # -------------------------------
        # SAVE RISK RESULT
        # -------------------------------

        risk = RiskAssessment(
            session_id=session.session_id,
            risk_score=risk_score,
            risk_level=risk_level,
            reason=reason,
        )

        db.add(risk)

        session.status = state
        session.completed_at = datetime.now()

        db.commit()

        _audit(
            session,
            locker_number,
            "RISK_CALCULATED",
            (
                f"Risk score={risk_score}, "
                f"level={risk_level}, "
                f"decision={decision}, "
                f"suspicious severity={suspicious_severity}."
            ),
        )

        if state == "APPROVED":

            _audit(
                session,
                locker_number,
                "VERIFICATION_APPROVED",
                "Verification approved. Locker operation is allowed.",
            )

        elif state == "REVIEW":

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
                        "High-risk suspicious activity detected. "
                        "Locker operation blocked."
                    ),
                )

        return {
            "verification_id": str(session.session_id),
            "customer_id": session.customer_id,
            "locker_id": locker_number,
            "state": state,
            "document_match": document_match,
            "face_match": face_match,
            "risk_decision": decision,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "reason": reason,
            "suspicious_activity": suspicious_result,
        }

    finally:
        db.close()