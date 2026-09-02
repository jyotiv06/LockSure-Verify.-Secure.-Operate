from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import SessionLocal

from models.user import User
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


# =====================================
# DATABASE DEPENDENCY
# =====================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =====================================
# CURRENT CUSTOMER PROFILE
# =====================================

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
        .filter(Locker.customer_id == customer.customer_id)
        .first()
    )

    return {
        "customer_db_id": customer.customer_id,
        "customer_id": customer.customer_number,
        "customer_number": customer.customer_number,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "account_status": customer.status,

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

        "branch": (
            locker.branch_name
            if locker else None
        ),

        "verification_status": "NOT_STARTED",
    }


# =====================================
# GET CUSTOMER BY CUSTOMER NUMBER / ID
# =====================================

@router.get("/{customer_identifier}")
def get_customer(
    customer_identifier: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    # Search using customer number
    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_number
            == customer_identifier.upper()
        )
        .first()
    )

    # If customer is not found,
    # try numeric customer ID
    if (
        not customer
        and customer_identifier.isdigit()
    ):

        customer = (
            db.query(Customer)
            .filter(
                Customer.customer_id
                == int(customer_identifier)
            )
            .first()
        )

    if not customer:

        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    # =====================================
    # ACCOUNT
    # =====================================

    account = (
        db.query(Account)
        .filter(
            Account.customer_id
            == customer.customer_id
        )
        .first()
    )

    # =====================================
    # LOCKER
    # =====================================

    locker = (
        db.query(Locker)
        .filter(
            Locker.customer_id
            == customer.customer_id
        )
        .first()
    )

    # =====================================
    # LATEST VERIFICATION
    # =====================================

    latest_verification = (
        db.query(VerificationSession)
        .filter(
            VerificationSession.customer_id
            == customer.customer_id
        )
        .order_by(
            desc(
                VerificationSession.started_at
            )
        )
        .first()
    )

    # =====================================
    # PREVIOUS OPERATIONS
    # =====================================

    operation_count = (
        db.query(
            func.count(
                LockerOperation.operation_id
            )
        )
        .filter(
            LockerOperation.customer_id
            == customer.customer_id
        )
        .scalar()
    )

    # =====================================
    # COMPLETE CUSTOMER RESPONSE
    # =====================================

    return {

        # Customer
        "customer_id": customer.customer_id,

        "customer_number":
            customer.customer_number,

        "full_name":
            customer.full_name,

        "phone":
            customer.phone,

        "email":
            customer.email,

        "customer_status":
            customer.status,


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
            if latest_verification
            else "NOT_STARTED"
        ),


        # Operation History
        "previous_operations":
            operation_count,
    }