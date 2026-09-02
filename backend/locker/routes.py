from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .service import (
    open_locker,
    close_locker,
    get_locker_status,
    get_operations
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/locker",
    tags=["Locker Operations"]
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class LockerOperationRequest(BaseModel):

    customer_id: int = Field(
        ...,
        gt=0,
        description="Customer ID"
    )

    verification_id: str = Field(
        ...,
        min_length=1,
        description="Verification session ID"
    )

    officer_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Officer performing the operation"
    )


# ============================================================
# OPEN LOCKER
# ============================================================

@router.post("/{locker_id}/open")
def open_locker_route(
    locker_id: int,
    request: LockerOperationRequest
):
    """
    Open locker after successful verification.

    Locker can be opened only when:

    verification state = APPROVED
    """

    return open_locker(
        locker_id=locker_id,
        customer_id=request.customer_id,
        verification_id=request.verification_id,
        officer_id=request.officer_id
    )


# ============================================================
# CLOSE LOCKER
# ============================================================

@router.post("/{locker_id}/close")
def close_locker_route(
    locker_id: int,
    request: LockerOperationRequest
):
    """
    Close an opened locker.
    """

    return close_locker(
        locker_id=locker_id,
        customer_id=request.customer_id,
        verification_id=request.verification_id,
        officer_id=request.officer_id
    )


# ============================================================
# LOCKER STATUS
# ============================================================

@router.get("/{locker_id}/status")
def locker_status(locker_id: int):
    """
    Get current locker status.
    """

    return {
        "locker_id": locker_id,
        "locker_status": get_locker_status(locker_id)
    }
# ============================================================
# ALL RECENT LOCKER OPERATIONS
# ============================================================

@router.get("/operations")
def all_locker_operations():
    """
    Get recent operations across all lockers.
    """

    return {
        "operations": get_operations()
    }


# ============================================================
# LOCKER OPERATION HISTORY
# ============================================================

@router.get("/{locker_id}/operations")
def locker_operations(locker_id: int):
    """
    Get all locker operations for a specific locker.
    """

    return {
        "locker_id": locker_id,
        "operations": get_operations(locker_id)
    }