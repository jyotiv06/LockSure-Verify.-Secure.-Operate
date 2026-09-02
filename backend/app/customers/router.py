from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models.user import User
from models.customer import Customer
from models.account import Account
from models.locker import Locker
from models.verification_session import VerificationSession
from models.locker_operation import LockerOperation
from ..auth.security import get_current_user

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    customer = (
        db.query(Customer)
        .filter(Customer.customer_id == user_id)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    locker = (
        db.query(Locker)
        .filter(Locker.customer_id == customer.customer_id)
        .first()
    )

    latest_verification = (
        db.query(VerificationSession)
        .filter(VerificationSession.customer_id == customer.customer_id)
        .order_by(VerificationSession.session_id.desc())
        .first()
    )

    branch = None
    if locker:
        branch = getattr(locker, "branch_name", None) or getattr(locker, "branch_code", None)

    return {
        "customer_db_id": customer.customer_id,
        "customer_id": customer.customer_number,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "account_status": customer.status,
        "account_number": getattr(customer, "account_number", None),
        "locker_id": locker.locker_id if locker else None,
        "locker_number": locker.locker_number if locker else None,
        "locker_status": locker.status if locker else None,
        "branch": branch,
        "verification_id": str(latest_verification.session_id) if latest_verification else None,
        "verification_status": latest_verification.status if latest_verification else "NOT_STARTED",
    }

@router.get("/{customer_identifier}")
def get_customer(
    customer_identifier: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.customer_number == customer_identifier.upper())
        .first()
    )

    if not customer and customer_identifier.isdigit():
        customer = (
            db.query(Customer)
            .filter(Customer.customer_id == int(customer_identifier))
            .first()
        )

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    account = (
        db.query(Account)
        .filter(Account.customer_id == customer.customer_id)
        .first()
    )

    locker = (
        db.query(Locker)
        .filter(Locker.customer_id == customer.customer_id)
        .first()
    )

    latest_verification = (
        db.query(VerificationSession)
        .filter(VerificationSession.customer_id == customer.customer_id)
        .order_by(VerificationSession.session_id.desc())
        .first()
    )

    operation_count = (
        db.query(func.count(LockerOperation.operation_id))
        .filter(LockerOperation.customer_id == customer.customer_id)
        .scalar()
    )

    branch = None
    if locker:
        branch = getattr(locker, "branch_name", None) or getattr(locker, "branch_code", None)

    return {
        "customer_db_id": customer.customer_id,
        "customer_id": customer.customer_id,
        "customer_number": customer.customer_number,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "email": customer.email,
        "customer_status": customer.status,
        "account_id": account.account_id if account else None,
        "account_number": account.account_number if account else None,
        "account_type": account.account_type if account else None,
        "account_status": account.status if account else customer.status,
        "locker_id": locker.locker_id if locker else None,
        "locker_number": locker.locker_number if locker else None,
        "locker_status": locker.status if locker else None,
        "branch": branch,
        "branch_name": branch,
        "verification_id": str(latest_verification.session_id) if latest_verification else None,
        "verification_status": latest_verification.status if latest_verification else "NOT_STARTED",
        "previous_operations": operation_count,
    }
