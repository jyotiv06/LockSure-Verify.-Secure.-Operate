from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import SessionLocal

from models.user import User
from models.customer import Customer
from models.locker import Locker

from ..schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
)

from .security import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def get_db():
    db = SessionLocal()

    try:
        return db
    except Exception:
        db.close()
        raise


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(data: RegisterRequest):

    db: Session = get_db()

    try:

        # ----------------------------------------------------
        # Check duplicate email
        # ----------------------------------------------------

        existing_user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )


        # ----------------------------------------------------
        # Create User
        # ----------------------------------------------------

        user = User(
            full_name=data.full_name,
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role.upper(),
            is_active=True,
        )

        db.add(user)

        # Get generated user_id
        db.flush()


        assigned_locker = None


        # ====================================================
        # CUSTOMER
        # ====================================================

        if data.role.upper() == "CUSTOMER":

            # ------------------------------------------------
            # Check duplicate customer
            # ------------------------------------------------

            existing_customer = (
                db.query(Customer)
                .filter(Customer.email == data.email)
                .first()
            )

            if existing_customer:
                raise HTTPException(
                    status_code=400,
                    detail="Customer already exists",
                )


            # ------------------------------------------------
            # Create Customer
            # ------------------------------------------------

            customer = Customer(
                customer_id=user.user_id,
                customer_number=f"CUST{user.user_id:06d}",
                full_name=data.full_name,
                phone=data.phone,
                email=data.email,
                status="ACTIVE",
            )

            db.add(customer)

            # Make sure customer exists before locker FK
            db.flush()


            # ------------------------------------------------
            # Automatically assign available locker
            # ------------------------------------------------

            locker = (
                db.query(Locker)
                .filter(
                    Locker.status == "AVAILABLE",
                    Locker.customer_id.is_(None),
                )
                .order_by(Locker.locker_id)
                .first()
            )


            if locker:

                locker.customer_id = customer.customer_id
                locker.status = "OCCUPIED"
                locker.assigned_at = datetime.utcnow()

                assigned_locker = locker


        # ====================================================
        # COMMIT
        # ====================================================

        db.commit()


        # ====================================================
        # RESPONSE
        # ====================================================

        response = {
            "message": "User registered successfully",
            "user_id": user.user_id,
            "role": user.role,
        }


        # Include locker information if assigned
        if assigned_locker:

            response["locker"] = {
                "locker_id": assigned_locker.locker_id,
                "locker_number": assigned_locker.locker_number,
                "branch": assigned_locker.branch_name,
                "status": assigned_locker.status,
            }

        else:

            response["locker"] = None
            response["locker_message"] = (
                "No locker is currently available. "
                "Locker assignment is pending."
            )


        return response


    except HTTPException:
        db.rollback()
        raise


    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


    finally:
        db.close()


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(data: LoginRequest):

    db: Session = get_db()

    try:

        # ----------------------------------------------------
        # Find user
        # ----------------------------------------------------

        user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )


        # ----------------------------------------------------
        # Check active status
        # ----------------------------------------------------

        if not user.is_active:

            raise HTTPException(
                status_code=403,
                detail="User account is inactive",
            )


        # ----------------------------------------------------
        # Verify password
        # ----------------------------------------------------

        if not verify_password(
            data.password,
            user.password_hash,
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )


        # ----------------------------------------------------
        # Create JWT
        # ----------------------------------------------------

        token = create_access_token(
            user_id=str(user.user_id),
            role=user.role,
        )


        return {
            "access_token": token,
            "token_type": "bearer",
        }


    finally:
        db.close()