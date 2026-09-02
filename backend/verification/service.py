from datetime import datetime

from database import SessionLocal

from models.customer import Customer
from models.locker import Locker
from models.document import Document
from models.verification_session import VerificationSession
from models.document_verification import DocumentVerification
from models.face_verification import FaceVerification
from models.risk_assessment import RiskAssessment
from models.locker_operation import LockerOperation


def start_verification(customer_id: int, locker_id: int):
    db = SessionLocal()

    try:
        customer = db.get(Customer, customer_id)

        if not customer:
            return None

        locker = db.get(Locker, locker_id)

        if not locker:
            return None

        if locker.status != "AVAILABLE":
            return None

        if locker.assigned_customer_id is not None:
            return None

        session = VerificationSession(
            customer_id=customer_id,
            locker_id=locker_id,
            status="IN_PROGRESS"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return {
            "verification_id": session.session_id,
            "customer_id": session.customer_id,
            "locker_id": session.locker_id,
            "state": session.status,
            "created_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            )
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_verification(verification_id: int):
    db = SessionLocal()

    try:
        session = db.get(
            VerificationSession,
            verification_id
        )

        if not session:
            return None

        document = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.session_id == verification_id
            )
            .order_by(
                DocumentVerification.document_verification_id.desc()
            )
            .first()
        )

        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id == verification_id
            )
            .order_by(
                FaceVerification.face_verification_id.desc()
            )
            .first()
        )

        risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.session_id == verification_id
            )
            .order_by(
                RiskAssessment.risk_assessment_id.desc()
            )
            .first()
        )

        return {
            "verification_id": session.session_id,
            "customer_id": session.customer_id,
            "locker_id": session.locker_id,
            "state": session.status,

            "document_match": (
                document.result == "PASS"
                if document
                else None
            ),

            "face_match": (
                face.result == "PASS"
                if face
                else None
            ),

            "risk_level": (
                risk.risk_level
                if risk
                else None
            ),

            "risk_decision": (
                risk.decision
                if risk
                else None
            ),

            "created_at": (
                session.started_at.isoformat()
                if session.started_at
                else None
            ),

            "completed_at": (
                session.completed_at.isoformat()
                if session.completed_at
                else None
            )
        }

    finally:
        db.close()


def process_document(
    verification_id: int,
    document_id: int,
    document_match: bool
):
    db = SessionLocal()

    try:
        session = db.get(
            VerificationSession,
            verification_id
        )

        if not session:
            return None

        document = db.get(
            Document,
            document_id
        )

        if not document:
            return None

        # Make sure the document belongs to the same customer
        if document.customer_id != session.customer_id:
            return None

        # PostgreSQL accepts PASS / FAIL / REVIEW
        result = "PASS" if document_match else "FAIL"

        document_verification = DocumentVerification(
            session_id=verification_id,
            document_id=document_id,
            match_score=1 if document_match else 0,
            result=result
        )

        db.add(document_verification)

        document.verified = document_match

        if document_match:
            # Document passed.
            # Keep verification session active for face verification.
            session.status = "IN_PROGRESS"

        else:
            # Document failed.
            session.status = "FAILED"
            session.completed_at = datetime.now()

        db.commit()

        return get_verification(verification_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def process_face(
    verification_id: int,
    face_match: bool
):
    db = SessionLocal()

    try:
        session = db.get(
            VerificationSession,
            verification_id
        )

        if not session:
            return None

        # PostgreSQL accepts PASS / FAIL / REVIEW
        result = "PASS" if face_match else "FAIL"

        face_verification = FaceVerification(
            session_id=verification_id,
            reference_id=None,
            similarity_score=1 if face_match else 0,
            liveness_score=1 if face_match else 0,
            result=result
        )

        db.add(face_verification)

        if face_match:
            # Face passed.
            # Keep session active until finalization.
            session.status = "IN_PROGRESS"

        else:
            # Face failed.
            session.status = "FAILED"
            session.completed_at = datetime.now()

        db.commit()

        return get_verification(verification_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def finalize_verification(verification_id: int):
    db = SessionLocal()

    try:
        session = db.get(
            VerificationSession,
            verification_id
        )

        if not session:
            return None

        document = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.session_id == verification_id
            )
            .order_by(
                DocumentVerification.document_verification_id.desc()
            )
            .first()
        )

        face = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.session_id == verification_id
            )
            .order_by(
                FaceVerification.face_verification_id.desc()
            )
            .first()
        )

        # Document verification result
        document_match = (
            document is not None
            and document.result == "PASS"
        )

        # Face verification result
        face_match = (
            face is not None
            and face.result == "PASS"
        )

        # Both verifications passed
        if document_match and face_match:

            risk_score = 10
            risk_level = "LOW"
            decision = "APPROVE"

            # Check selected locker
            locker = db.get(
                Locker,
                session.locker_id
            )

            if not locker:
                return None

            if locker.status != "AVAILABLE":
                return None

            if locker.assigned_customer_id is not None:
                return None

            # Assign locker to customer
            locker.status = "OCCUPIED"
            locker.assigned_customer_id = session.customer_id

            # Record locker assignment
            locker_operation = LockerOperation(
                locker_id=locker.locker_id,
                customer_id=session.customer_id,
                session_id=session.session_id,
                officer_id=session.officer_id,
                operation_type="ACCESS_ATTEMPT",
                operation_status="SUCCESS"
            )

            db.add(locker_operation)

            session.status = "COMPLETED"

        # Either document or face failed
        elif (
            document is not None
            and document.result == "FAIL"
        ) or (
            face is not None
            and face.result == "FAIL"
        ):

            risk_score = 90
            risk_level = "HIGH"
            decision = "REJECT"

            session.status = "FAILED"

        # Verification is incomplete
        else:

            risk_score = 50
            risk_level = "MEDIUM"
            decision = "REVIEW"

            session.status = "CANCELLED"

        risk = RiskAssessment(
            session_id=verification_id,
            risk_score=risk_score,
            risk_level=risk_level,
            decision=decision,
            reason=decision
        )

        db.add(risk)

        session.completed_at = datetime.now()

        db.commit()

        return get_verification(verification_id)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()