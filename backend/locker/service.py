from datetime import datetime, timezone
from threading import Lock
from uuid import uuid4

from fastapi import HTTPException

from audit.service import create_audit_log
from verification.service import verification_sessions


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

# Stores every successful/failed locker operation
_locker_operations: list[dict] = []


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def _now() -> str:
    """Return current UTC time."""
    return datetime.now(timezone.utc).isoformat()


def _get_verification_session(verification_id: str) -> dict:
    """
    Find verification session.

    Locker operation is allowed only when a valid
    verification session exists.
    """

    session = verification_sessions.get(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification session not found"
        )

    return session


def _validate_customer_and_locker(
    session: dict,
    customer_id: int,
    locker_id: int
) -> None:
    """
    Make sure the customer and locker belong to
    the verification session.
    """

    if session["customer_id"] != customer_id:
        raise HTTPException(
            status_code=403,
            detail="Customer does not match verification session"
        )

    if session["locker_id"] != locker_id:
        raise HTTPException(
            status_code=403,
            detail="Locker does not match verification session"
        )


def get_locker_status(locker_id: int) -> str:
    """
    Return current locker status.

    New lockers are considered CLOSED.
    """

    return _locker_states.get(locker_id, "CLOSED")


def _record_operation(
    locker_id: int,
    customer_id: int,
    verification_id: str,
    operation_type: str,
    operation_status: str,
    officer_id: int | None = None
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
        "operated_at": _now()
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
    officer_id: int | None = None
) -> dict:
    """
    Open locker only when verification is APPROVED.

    Rules:
    1. Verification must exist.
    2. Customer must match.
    3. Locker must match.
    4. Verification must be APPROVED.
    5. Locker must not already be OPEN.
    """

    session = _get_verification_session(verification_id)

    _validate_customer_and_locker(
        session,
        customer_id,
        locker_id
    )

    # --------------------------------------------------------
    # APPROVAL CHECK
    # --------------------------------------------------------

    if session["state"] != "APPROVED":

        create_audit_log(
            customer_id=customer_id,
            locker_id=locker_id,
            action="LOCKER_OPEN_DENIED",
            details=(
                "Locker opening denied. "
                f"Verification state is {session['state']}."
            ),
            verification_id=verification_id
        )

        raise HTTPException(
            status_code=403,
            detail=(
                "Locker cannot be opened. "
                "Verification must be APPROVED. "
                f"Current state: {session['state']}"
            )
        )

    # --------------------------------------------------------
    # LOCKER STATE CHECK
    # --------------------------------------------------------

    with _locker_lock:

        current_status = get_locker_status(locker_id)

        if current_status == "OPEN":

            create_audit_log(
                customer_id=customer_id,
                locker_id=locker_id,
                action="LOCKER_OPEN_DUPLICATE_DENIED",
                details="Locker is already open.",
                verification_id=verification_id
            )

            raise HTTPException(
                status_code=409,
                detail="Locker is already open"
            )

        # ----------------------------------------------------
        # OPEN LOCKER
        # ----------------------------------------------------

        _locker_states[locker_id] = "OPEN"

        operation = _record_operation(
            locker_id=locker_id,
            customer_id=customer_id,
            verification_id=verification_id,
            operation_type="OPEN",
            operation_status="SUCCESS",
            officer_id=officer_id
        )

    # --------------------------------------------------------
    # AUDIT
    # --------------------------------------------------------

    create_audit_log(
        customer_id=customer_id,
        locker_id=locker_id,
        action="LOCKER_OPENED",
        details="Locker opened after APPROVED verification.",
        verification_id=verification_id
    )

    return {
        "message": "Locker opened successfully",
        "locker_id": locker_id,
        "customer_id": customer_id,
        "verification_id": verification_id,
        "verification_state": "APPROVED",
        "locker_status": "OPEN",
        "operation": operation
    }


# ============================================================
# CLOSE LOCKER
# ============================================================

def close_locker(
    locker_id: int,
    customer_id: int,
    verification_id: str,
    officer_id: int | None = None
) -> dict:
    """
    Close an opened locker.

    Rules:
    1. Verification must exist.
    2. Customer must match.
    3. Locker must match.
    4. Locker must currently be OPEN.
    5. Duplicate CLOSE is rejected.
    """

    session = _get_verification_session(verification_id)

    _validate_customer_and_locker(
        session,
        customer_id,
        locker_id
    )

    # --------------------------------------------------------
    # LOCKER STATE CHECK
    # --------------------------------------------------------

    with _locker_lock:

        current_status = get_locker_status(locker_id)

        if current_status != "OPEN":

            create_audit_log(
                customer_id=customer_id,
                locker_id=locker_id,
                action="LOCKER_CLOSE_DENIED",
                details=(
                    "Locker close denied. "
                    f"Current locker status is {current_status}."
                ),
                verification_id=verification_id
            )

            raise HTTPException(
                status_code=409,
                detail=(
                    "Locker is not open. "
                    f"Current status: {current_status}"
                )
            )

        # ----------------------------------------------------
        # CLOSE LOCKER
        # ----------------------------------------------------

        _locker_states[locker_id] = "CLOSED"

        operation = _record_operation(
            locker_id=locker_id,
            customer_id=customer_id,
            verification_id=verification_id,
            operation_type="CLOSE",
            operation_status="SUCCESS",
            officer_id=officer_id
        )

    # --------------------------------------------------------
    # AUDIT
    # --------------------------------------------------------

    create_audit_log(
        customer_id=customer_id,
        locker_id=locker_id,
        action="LOCKER_CLOSED",
        details="Locker closed successfully.",
        verification_id=verification_id
    )

    # --------------------------------------------------------
    # COMPLETE VERIFICATION WORKFLOW
    # --------------------------------------------------------

    session["state"] = "COMPLETED"
    session["updated_at"] = _now()
    session["completed_at"] = _now()

    create_audit_log(
        customer_id=customer_id,
        locker_id=locker_id,
        action="VERIFICATION_COMPLETED",
        details=(
            "Verification, risk assessment and "
            "approved locker operation completed."
        ),
        verification_id=verification_id
    )

    return {
        "message": "Locker closed successfully",
        "locker_id": locker_id,
        "customer_id": customer_id,
        "verification_id": verification_id,
        "verification_state": "COMPLETED",
        "locker_status": "CLOSED",
        "operation": operation
    }


# ============================================================
# GET LOCKER OPERATIONS
# ============================================================

def get_operations(locker_id: int) -> list[dict]:
    """
    Return operation history for a locker.
    """

    return [
        operation
        for operation in _locker_operations
        if operation["locker_id"] == locker_id
    ]