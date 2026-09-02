from datetime import datetime

from sqlalchemy.orm import Session

from database import SessionLocal

from models.verification_session import VerificationSession
from models.locker import Locker
from models.document import Document
from models.document_verification import DocumentVerification
from models.face_verification import FaceVerification
from models.risk_assessment import RiskAssessment


def get_db():
    return SessionLocal()


def start_verification(customer_id: int, locker_id: str):

    db: Session = get_db()

    try:
        # locker_id from the API is the business locker number,
        # for example "L001".
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
        session = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.session_id == int(verification_id)
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
                DocumentVerification.session_id == session.session_id
            )
            .order_by(
                DocumentVerification.document_verification_id.desc()
            )
            .first()
        )

        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id == session.session_id
            )
            .order_by(
                FaceVerification.face_verification_id.desc()
            )
            .first()
        )

        risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.session_id == session.session_id
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
            "state": session.status,
            "document_match": (
                document.result == "PASSED"
                if document
                else None
            ),
            "face_match": (
                face.result == "PASSED"
                if face
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
    document_match: bool
):

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

        document = (
            db.query(Document)
            .filter(
                Document.customer_id == session.customer_id
            )
            .order_by(Document.document_id.desc())
            .first()
        )

        if not document:
            return None

        result = "PASSED" if document_match else "FAILED"

        verification = DocumentVerification(
            session_id=session.session_id,
            document_id=document.document_id,
            match_score=100.00 if document_match else 0.00,
            result=result,
        )

        db.add(verification)

        session.status = (
            "DOCUMENT_VERIFIED"
            if document_match
            else "DOCUMENT_FAILED"
        )

        document.verified = document_match

        db.commit()

        return get_verification(verification_id)

    finally:
        db.close()


def process_face(
    verification_id: str,
    face_match: bool
):

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

        result = "PASSED" if face_match else "FAILED"

        verification = FaceVerification(
            session_id=session.session_id,
            customer_id=session.customer_id,
            match_score=100.00 if face_match else 0.00,
            result=result,
        )

        db.add(verification)

        session.status = (
            "FACE_VERIFIED"
            if face_match
            else "FACE_FAILED"
        )

        db.commit()

        return get_verification(verification_id)

    finally:
        db.close()


def finalize_verification(verification_id: str):

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

        document = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.session_id == session.session_id
            )
            .order_by(
                DocumentVerification.document_verification_id.desc()
            )
            .first()
        )

        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id == session.session_id
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

        if document_match and face_match:
            decision = "APPROVE"
            state = "APPROVED"
            risk_level = "LOW"
            risk_score = 10.00
            reason = "Document and face verification passed."

        elif not document_match or not face_match:
            decision = "BLOCK"
            state = "BLOCKED"
            risk_level = "HIGH"
            risk_score = 90.00
            reason = "One or more verification checks failed."

        else:
            decision = "REVIEW"
            state = "REVIEW"
            risk_level = "MEDIUM"
            risk_score = 50.00
            reason = "Verification requires manual review."

        risk = RiskAssessment(
            session_id=session.session_id,
            risk_score=risk_score,
            risk_level=risk_level,
            reason=reason,
        )

        db.add(risk)

        session.status = state

        if state in ["APPROVED", "BLOCKED", "REVIEW"]:
            session.completed_at = datetime.now()

        db.commit()

        locker = (
            db.query(Locker)
            .filter(
                Locker.locker_id == session.locker_id
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
            "state": state,
            "document_match": document_match,
            "face_match": face_match,
            "risk_decision": decision,
            "risk_level": risk_level,
            "risk_score": float(risk_score),
            "reason": reason,
        }

    finally:
        db.close()