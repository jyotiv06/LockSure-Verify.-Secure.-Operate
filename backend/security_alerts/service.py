from database import SessionLocal

from models.risk_assessment import RiskAssessment
from models.verification_session import VerificationSession
from models.customer import Customer
from models.locker import Locker


# ============================================================
# GET ACTIVE SECURITY ALERTS
# ============================================================

def get_security_alerts():

    db = SessionLocal()

    try:

        # Get only active risk alerts
        risks = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.risk_level.in_(
                    ["HIGH", "MEDIUM"]
                )
            )
            .order_by(
                RiskAssessment.created_at.desc()
            )
            .all()
        )

        alerts = []

        for risk in risks:

            # Get verification session
            session = (
                db.query(VerificationSession)
                .filter(
                    VerificationSession.session_id
                    == risk.session_id
                )
                .first()
            )

            # Skip broken/deleted sessions safely
            if not session:
                continue

            # Get customer
            customer = (
                db.query(Customer)
                .filter(
                    Customer.customer_id
                    == session.customer_id
                )
                .first()
            )

            # Get locker
            locker = (
                db.query(Locker)
                .filter(
                    Locker.locker_id
                    == session.locker_id
                )
                .first()
            )

            alerts.append({

                "risk_id": int(risk.risk_id),

                "alert_id":
                    f"ALT-{risk.risk_id}",

                "customer_id":
                    session.customer_id,

                "customer_name":
                    customer.full_name
                    if customer
                    else f"Customer #{session.customer_id}",

                "locker_id":
                    locker.locker_id
                    if locker
                    else session.locker_id,

                "locker_number":
                    locker.locker_number
                    if locker
                    else None,

                "incident_reason":
                    risk.reason
                    or "Suspicious verification activity detected",

                "severity":
                    str(risk.risk_level).upper(),

                "recommended_action":
                    (
                        "BLOCK"
                        if str(risk.risk_level).upper() == "HIGH"
                        else "REVIEW"
                    ),

                "timestamp":
                    risk.created_at.isoformat()
                    if risk.created_at
                    else None,

                "verification_id":
                    str(session.session_id),

            })

        return alerts

    finally:

        db.close()


# ============================================================
# RESOLVE SECURITY ALERT
# ============================================================

def resolve_security_alert(risk_id: int):

    db = SessionLocal()

    try:

        risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.risk_id == risk_id
            )
            .first()
        )

        if not risk:
            return None

        risk.risk_level = "RESOLVED"

        db.commit()

        return {
            "message":
                "Security alert resolved successfully",

            "risk_id":
                risk_id,

            "status":
                "RESOLVED",
        }

    except Exception:

        db.rollback()
        raise

    finally:

        db.close()


# ============================================================
# DISMISS SECURITY ALERT
# ============================================================

def dismiss_security_alert(risk_id: int):

    db = SessionLocal()

    try:

        risk = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.risk_id == risk_id
            )
            .first()
        )

        if not risk:
            return None

        risk.risk_level = "DISMISSED"

        db.commit()

        return {
            "message":
                "Security alert dismissed successfully",

            "risk_id":
                risk_id,

            "status":
                "DISMISSED",
        }

    except Exception:

        db.rollback()
        raise

    finally:

        db.close()