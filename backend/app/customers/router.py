from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
<<<<<<< HEAD
from sqlalchemy import desc, func
=======
from sqlalchemy import func
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4

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


<<<<<<< HEAD
# =====================================
# DATABASE DEPENDENCY
# =====================================
=======
# ============================================================
# DATABASE DEPENDENCY
# ============================================================
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


<<<<<<< HEAD
# =====================================
# CURRENT CUSTOMER PROFILE
# =====================================
=======
# ============================================================
# CURRENT LOGGED-IN CUSTOMER
# ============================================================
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4

@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    user_id = int(current_user["user_id"])

    # --------------------------------------------------------
    # USER
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # CUSTOMER
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # LOCKER
    # --------------------------------------------------------

    locker = (
        db.query(Locker)
<<<<<<< HEAD
        .filter(Locker.customer_id == customer.customer_id)
=======
        .filter(
            Locker.customer_id == customer.customer_id
        )
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        .first()
    )

    # --------------------------------------------------------
    # LATEST VERIFICATION
    # --------------------------------------------------------

    latest_verification = (
        db.query(VerificationSession)
        .filter(
            VerificationSession.customer_id
            == customer.customer_id
        )
        .order_by(
            VerificationSession.session_id.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # BRANCH
    # --------------------------------------------------------

    branch = None

    if locker:
        branch = getattr(
            locker,
            "branch_name",
            None,
        )

        if not branch:
            branch = getattr(
                locker,
                "branch_code",
                None,
            )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
<<<<<<< HEAD
=======
        # Customer
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        "customer_db_id": customer.customer_id,
        "customer_id": customer.customer_number,
        "customer_number": customer.customer_number,
        "full_name": customer.full_name,
        "email": customer.email,
        "phone": customer.phone,
        "account_status": customer.status,

<<<<<<< HEAD
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
=======
        # Account
        "account_number": getattr(
            customer,
            "account_number",
            None,
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        ),


        # Locker
        "locker_id": (
            locker.locker_id
            if locker
            else None
        ),

        "locker_number": (
            locker.locker_number
            if locker
            else None
        ),

        "locker_status": (
            locker.status
<<<<<<< HEAD
            if locker else None
        ),

        "branch_name": (
            locker.branch_name
            if locker else None
=======
            if locker
            else None
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
        ),
        "branch": branch,


        # Verification
        "verification_id": (
            str(latest_verification.session_id)
            if latest_verification
            else None
        ),
        "verification_status": (
            latest_verification.status
            if latest_verification
            else "NOT_STARTED"
        ),
    }


# ============================================================
# CUSTOMER SEARCH
# Used by Officer Dashboard
# ============================================================

@router.get("/{customer_identifier}")
def get_customer(
    customer_identifier: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # SEARCH BY CUSTOMER NUMBER
    # Example: CUST000012
    # --------------------------------------------------------

<<<<<<< HEAD

        # Operation History
        "previous_operations":
            operation_count,
=======
    customer = (
        db.query(Customer)
        .filter(
            Customer.customer_number
            == customer_identifier.upper()
        )
        .first()
    )

    # --------------------------------------------------------
    # SEARCH BY NUMERIC CUSTOMER DB ID
    # Example: 12
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # NOT FOUND
    # --------------------------------------------------------

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    # --------------------------------------------------------
    # ACCOUNT
    # --------------------------------------------------------

    account = (
        db.query(Account)
        .filter(
            Account.customer_id
            == customer.customer_id
        )
        .first()
    )

    # --------------------------------------------------------
    # LOCKER
    # --------------------------------------------------------

    locker = (
        db.query(Locker)
        .filter(
            Locker.customer_id
            == customer.customer_id
        )
        .first()
    )

    # --------------------------------------------------------
    # LATEST VERIFICATION
    # --------------------------------------------------------

    latest_verification = (
        db.query(VerificationSession)
        .filter(
            VerificationSession.customer_id
            == customer.customer_id
        )
        .order_by(
            VerificationSession.session_id.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # PREVIOUS LOCKER OPERATIONS
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # BRANCH
    # --------------------------------------------------------

    branch = None

    if locker:
        branch = getattr(
            locker,
            "branch_name",
            None,
        )

        if not branch:
            branch = getattr(
                locker,
                "branch_code",
                None,
            )

    # --------------------------------------------------------
    # RETURN COMPLETE CUSTOMER INFORMATION
    # --------------------------------------------------------

    return {
        # ----------------------------------------------------
        # Customer
        # ----------------------------------------------------

        "customer_db_id": customer.customer_id,

        "customer_id": customer.customer_id,

        "customer_number": customer.customer_number,

        "full_name": customer.full_name,

        "phone": customer.phone,

        "email": customer.email,

        "customer_status": customer.status,

        # ----------------------------------------------------
        # Account
        # ----------------------------------------------------

        "account_id": (
            account.account_id
            if account
            else None
        ),

        "account_number": (
            account.account_number
            if account
            else None
        ),

        "account_type": (
            account.account_type
            if account
            else None
        ),

        "account_status": (
            account.status
            if account
            else customer.status
        ),

        # ----------------------------------------------------
        # Locker
        # ----------------------------------------------------

        "locker_id": (
            locker.locker_id
            if locker
            else None
        ),

        "locker_number": (
            locker.locker_number
            if locker
            else None
        ),

        "locker_status": (
            locker.status
            if locker
            else None
        ),

        "branch": branch,

        "branch_name": branch,

        # ----------------------------------------------------
        # Verification
        # ----------------------------------------------------

        "verification_id": (
            str(latest_verification.session_id)
            if latest_verification
            else None
        ),

        "verification_status": (
            latest_verification.status
            if latest_verification
            else "NOT_STARTED"
        ),

        # ----------------------------------------------------
        # Operation History
        # ----------------------------------------------------

        "previous_operations": operation_count,
>>>>>>> 00feda13bc4bdedbdb0187fd2279060c751501b4
    }