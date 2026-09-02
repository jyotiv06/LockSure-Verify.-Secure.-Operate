from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import SessionLocal

from models.customer import Customer
from models.account import Account
from models.locker import Locker
from models.verification_session import VerificationSession
from models.locker_operation import LockerOperation

from ..auth.security import get_current_user


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


# Database dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user),
):
    return {
        "message": "Customer profile endpoint",
        "user": current_user,
    }


@router.get("/{customer_identifier}")
def get_customer(
    customer_identifier: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    # Search using customer number
    customer = db.query(Customer).filter(
        Customer.customer_number == customer_identifier.upper()
    ).first()

    # If customer not found, try numeric customer_id
    if not customer and customer_identifier.isdigit():

        customer = db.query(Customer).filter(
            Customer.customer_id == int(customer_identifier)
        ).first()

    # Customer not found
    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Get customer's account
    account = db.query(Account).filter(
        Account.customer_id == customer.customer_id
    ).first()

    # Get customer's assigned locker
    locker = db.query(Locker).filter(
        Locker.customer_id == customer.customer_id
    ).first()

    # Get latest verification session
    latest_verification = db.query(
        VerificationSession
    ).filter(
        VerificationSession.customer_id == customer.customer_id
    ).order_by(
        desc(VerificationSession.started_at)
    ).first()

    # Count previous locker operations
    operation_count = db.query(
        func.count(LockerOperation.operation_id)
    ).filter(
        LockerOperation.customer_id == customer.customer_id
    ).scalar()

    # Return complete customer information
    return {
        # Customer
        "customer_id": customer.customer_id,
        "customer_number": customer.customer_number,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "email": customer.email,
        "customer_status": customer.status,

        # Account
        "account_id": (
            account.account_id
            if account else None
        ),
        "account_number": (
            account.account_number
            if account else None
        ),
        "account_type": (
            account.account_type
            if account else None
        ),
        "account_status": (
            account.status
            if account else None
        ),

        # Locker
        "locker_id": (
            locker.locker_id
            if locker else None
        ),
        "locker_number": (
            locker.locker_number
            if locker else None
        ),
        "locker_status": (
            locker.status
            if locker else None
        ),
        "branch_name": (
            locker.branch_name
            if locker else None
        ),

        # Verification
        "verification_status": (
            latest_verification.status
            if latest_verification else "NOT_STARTED"
        ),

        # Operation history
        "previous_operations": operation_count,
    }