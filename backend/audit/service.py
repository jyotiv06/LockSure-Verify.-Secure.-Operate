from database import SessionLocal
from models.audit_log import AuditLog


def create_audit_log(
    customer_id: int,
    locker_id: int,
    action: str,
    details: str = ""
):
    db = SessionLocal()

    try:
        audit = AuditLog(
            action=action,
            entity_type="CUSTOMER_LOCKER",
            entity_id=customer_id,
            details={
                "customer_id": customer_id,
                "locker_id": locker_id,
                "details": details
            }
        )

        db.add(audit)
        db.commit()
        db.refresh(audit)

        return {
            "customer_id": customer_id,
            "locker_id": locker_id,
            "action": audit.action,
            "details": details,
            "timestamp": audit.created_at.isoformat()
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_customer_logs(customer_id: int):
    db = SessionLocal()

    try:
        logs = (
            db.query(AuditLog)
            .filter(
                AuditLog.entity_type == "CUSTOMER_LOCKER",
                AuditLog.entity_id == customer_id
            )
            .order_by(AuditLog.created_at.desc())
            .all()
        )

        return [
            {
                "customer_id": log.details.get("customer_id"),
                "locker_id": log.details.get("locker_id"),
                "action": log.action,
                "details": log.details.get("details", ""),
                "timestamp": log.created_at.isoformat()
            }
            for log in logs
        ]

    finally:
        db.close()


def get_locker_logs(locker_id: int):
    db = SessionLocal()

    try:
        logs = (
            db.query(AuditLog)
            .filter(
                AuditLog.entity_type == "CUSTOMER_LOCKER"
            )
            .order_by(AuditLog.created_at.desc())
            .all()
        )

        return [
            {
                "customer_id": log.details.get("customer_id"),
                "locker_id": log.details.get("locker_id"),
                "action": log.action,
                "details": log.details.get("details", ""),
                "timestamp": log.created_at.isoformat()
            }
            for log in logs
            if log.details
            and log.details.get("locker_id") == locker_id
        ]

    finally:
        db.close()