from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.customer import Customer
from models.locker import Locker

from ..auth.security import get_current_user

router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


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

    user = (
        db.query(User)
        .filter(User.user_id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    customer = (
        db.query(Customer)
        .filter(Customer.customer_id == user_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer profile not found",
        )

    locker = (
        db.query(Locker)
        .filter(Locker.customer_id == user_id)
        .first()
    )

    return {
        # Actual logged-in user
        "customer_db_id": user_id,
        "customer_id": customer.customer_number,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "account_status": customer.status,

        # Locker information
        "locker_id": locker.locker_id if locker else None,
        "locker_number": locker.locker_number if locker else None,
        "locker_status": locker.status if locker else None,
        "branch": locker.branch_name if locker else None,

        "verification_status": "NOT_STARTED",
    }


@router.get("/{customer_id}")
def get_customer(
    customer_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.customer_number == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return {
        "customer_id": customer.customer_number,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "account_status": customer.status,
    }