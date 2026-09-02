from datetime import datetime, timezone
from threading import Lock
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal

from models.verification_session import VerificationSession

from audit.service import create_audit_log


# ============================================================
# IN-MEMORY LOCKER STATE
# ============================================================

_locker_lock = Lock()

# Example:
# {
#     101: "OPEN",
#     102: "CLOSED"
# }
_locker_states: dict[int, str] = {}

# Stores locker operation history
_locker_operations: list[dict] = []


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        return db

    except Exception:
        db.close()
        raise


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def _now() -> str:
    """Return current UTC time."""
    return datetime.now(timezone.utc).isoformat()


def _get_verification_session(
    verification_id: str,
    db: Session,
):
    """
    Get verification session from PostgreSQL.
    """

    if not verification_id.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Invalid verification ID",
        )

    session = (
        db.query(VerificationSession)
        .filter(
            VerificationSession.session_id
            == int(verification_id)
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification session not found",
        )

    return session


def _validate_customer_and_locker(
    session,
    customer_id: int,
    locker_id: int,
) -> None:
    """
    Make sure the customer and locker belong
    to the verification session.
    """

    if session.customer_id != customer_id:
        raise HTTPException(
            status_code=403,
            detail="Customer does not match verification session",
        )

    if session.locker_id != locker_id:
        raise HTTPException(
            status_code=403,
            detail="Locker does not match verification session",
        )


def get_locker_status(locker_id: int) -> str:
    """
    Return current locker status.

    New lockers are considered CLOSED.
    """

    return _locker_states.get(
        locker_id,
        "CLOSED",
    )


def _record_operation(
    locker_id: int,
    customer_id: int,
    verification_id: str,
    operation_type: str,
    operation_status: str,
    officer_id: int | None = None,
) -> dict:
    """
    Store locker operation history.
    """

    operation = {
        "operation_id": str(uuid4()),
        "locker_id": locker_id,
        "customer_id": customer_id,
        "verification_id": verification_id,
        "officer_id": officer_id,
        "operation_type": operation_type,
        "operation_status": operation_status,
        "operated_at": _now(),
    }

    _locker_operations.append(operation)

    return operation


# ============================================================
# OPEN LOCKER
# ============================================================

def open_locker(
    locker_id: int,
    customer_id: int,
    verification_id: str,
    officer_id: int | None = None,
) -> dict:

    db = get_db()

    try:

        # ----------------------------------------------------
        # GET DATABASE VERIFICATION SESSION
        # ----------------------------------------------------

        session = _get_verification_session(
            verification_id,
            db,
        )

        _validate_customer_and_locker(
            session,
            customer_id,
            locker_id,
        )

        # ----------------------------------------------------
        # APPROVAL CHECK
        # ----------------------------------------------------

        if session.status != "APPROVED":

            create_audit_log(
                customer_id=customer_id,
                locker_id=locker_id,
                action="LOCKER_OPEN_DENIED",
                details=(
                    "Locker opening denied. "
                    f"Verification status is {session.status}."
                ),
                verification_id=verification_id,
            )

            raise HTTPException(
                status_code=403,
                detail=(
                    "Locker cannot be opened. "
                    "Verification must be APPROVED. "
                    f"Current status: {session.status}"
                ),
            )

        # ----------------------------------------------------
        # LOCKER STATE CHECK
        # ----------------------------------------------------

        with _locker_lock:

            current_status = get_locker_status(
                locker_id
            )

            if current_status == "OPEN":

                create_audit_log(
                    customer_id=customer_id,
                    locker_id=locker_id,
                    action="LOCKER_OPEN_DUPLICATE_DENIED",
                    details="Locker is already open.",
                    verification_id=verification_id,
                )

                raise HTTPException(
                    status_code=409,
                    detail="Locker is already open",
                )

            # ------------------------------------------------
            # OPEN LOCKER
            # ------------------------------------------------

            _locker_states[locker_id] = "OPEN"

            operation = _record_operation(
                locker_id=locker_id,
                customer_id=customer_id,
                verification_id=verification_id,
                operation_type="OPEN",
                operation_status="SUCCESS",
                officer_id=officer_id,
            )

        # ----------------------------------------------------
        # AUDIT
        # ----------------------------------------------------

        create_audit_log(
            customer_id=customer_id,
            locker_id=locker_id,
            action="LOCKER_OPENED",
            details=(
                "Locker opened after "
                "APPROVED verification."
            ),
            verification_id=verification_id,
        )

        return {
            "message": "Locker opened successfully",
            "locker_id": locker_id,
            "customer_id": customer_id,
            "verification_id": verification_id,
            "verification_state": "APPROVED",
            "locker_status": "OPEN",
            "operation": operation,
        }

    finally:
        db.close()


# ============================================================
# CLOSE LOCKER
# ============================================================

def close_locker(
    locker_id: int,
    customer_id: int,
    verification_id: str,
    officer_id: int | None = None,
) -> dict:

    db = get_db()

    try:

        # ----------------------------------------------------
        # GET DATABASE VERIFICATION SESSION
        # ----------------------------------------------------

        session = _get_verification_session(
            verification_id,
            db,
        )

        _validate_customer_and_locker(
            session,
            customer_id,
            locker_id,
        )

        # ----------------------------------------------------
        # LOCKER STATE CHECK
        # ----------------------------------------------------

        with _locker_lock:

            current_status = get_locker_status(
                locker_id
            )

            if current_status != "OPEN":

                create_audit_log(
                    customer_id=customer_id,
                    locker_id=locker_id,
                    action="LOCKER_CLOSE_DENIED",
                    details=(
                        "Locker close denied. "
                        f"Current locker status "
                        f"is {current_status}."
                    ),
                    verification_id=verification_id,
                )

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Locker is not open. "
                        f"Current status: "
                        f"{current_status}"
                    ),
                )

            # ------------------------------------------------
            # CLOSE LOCKER
            # ------------------------------------------------

            _locker_states[locker_id] = "CLOSED"

            operation = _record_operation(
                locker_id=locker_id,
                customer_id=customer_id,
                verification_id=verification_id,
                operation_type="CLOSE",
                operation_status="SUCCESS",
                officer_id=officer_id,
            )

        # ----------------------------------------------------
        # AUDIT
        # ----------------------------------------------------

        create_audit_log(
            customer_id=customer_id,
            locker_id=locker_id,
            action="LOCKER_CLOSED",
            details="Locker closed successfully.",
            verification_id=verification_id,
        )

        # ----------------------------------------------------
        # COMPLETE VERIFICATION WORKFLOW
        # ----------------------------------------------------

        session.status = "COMPLETED"

        session.completed_at = datetime.now()

        db.commit()

        create_audit_log(
            customer_id=customer_id,
            locker_id=locker_id,
            action="VERIFICATION_COMPLETED",
            details=(
                "Verification and approved "
                "locker operation completed."
            ),
            verification_id=verification_id,
        )

        return {
            "message": "Locker closed successfully",
            "locker_id": locker_id,
            "customer_id": customer_id,
            "verification_id": verification_id,
            "verification_state": "COMPLETED",
            "locker_status": "CLOSED",
            "operation": operation,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# GET LOCKER OPERATIONS
# ============================================================

def get_operations(
    locker_id: int | None = None,
    limit: int = 10,
) -> list[dict]:

    operations = _locker_operations.copy()

    if locker_id is not None:

        operations = [
            operation
            for operation in operations
            if operation["locker_id"] == locker_id
        ]

    operations.sort(
        key=lambda operation: operation[
            "operated_at"
        ],
        reverse=True,
    )

    return operations[:limit]