from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.customer import Customer

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


@router.post("/register")
def register(data: RegisterRequest):

    db: Session = get_db()

    try:
        # Check whether email already exists
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

        # Create User
        user = User(
            full_name=data.full_name,
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role.upper(),
            is_active=True,
        )

        db.add(user)
        db.flush()

        # Create Customer record for CUSTOMER role
        if data.role.upper() == "CUSTOMER":

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

            customer = Customer(
                customer_id=user.user_id,
                customer_number=f"CUST{user.user_id:06d}",
                full_name=data.full_name,
                phone=data.phone,
                email=data.email,
                status="ACTIVE",
            )

            db.add(customer)

        db.commit()

        return {
            "message": "User registered successfully",
            "user_id": user.user_id,
            "role": user.role,
        }

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


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):

    db: Session = get_db()

    try:
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

        if not user.is_active:
            raise HTTPException(
                status_code=403,
                detail="User account is inactive",
            )

        if not verify_password(
            data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

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