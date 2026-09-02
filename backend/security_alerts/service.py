from database import SessionLocal

from models.risk_assessment import RiskAssessment
from models.verification_session import VerificationSession
from models.customer import Customer
from models.locker import Locker


def get_security_alerts():

    db = SessionLocal()

    try:

        results = (
            db.query(
                RiskAssessment,
                VerificationSession,
                Customer,
                Locker,
            )
            .join(
                VerificationSession,
                RiskAssessment.session_id
                == VerificationSession.session_id,
            )
            .join(
                Customer,
                VerificationSession.customer_id
                == Customer.customer_id,
            )
            .outerjoin(
                Locker,
                VerificationSession.locker_id
                == Locker.locker_id,
            )
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

        for risk, session, customer, locker in results:

            if risk.risk_level == "HIGH":
                recommended_action = "BLOCK"

            else:
                recommended_action = "REVIEW"

            alert = {
                "alert_id": f"ALT-{risk.risk_id}",

                "customer_id": customer.customer_id,

                "customer_name": customer.full_name,

                "locker_id": (
                    locker.locker_id
                    if locker else None
                ),

                "locker_number": (
                    locker.locker_number
                    if locker else None
                ),

                "incident_reason": (
                    risk.reason
                    or "Suspicious verification activity detected"
                ),

                "severity": risk.risk_level,

                "recommended_action": recommended_action,

                "timestamp": (
                    risk.created_at.isoformat()
                    if risk.created_at else None
                ),

                "verification_id": session.session_id,
            }

            alerts.append(alert)

        return alerts

    finally:

        db.close()