from fastapi import APIRouter, HTTPException

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

users = {}


@router.post("/register")
def register(data: RegisterRequest):

    if data.email in users:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    users[data.email] = {
        "password_hash": hash_password(data.password),
        "role": data.role,
    }

    return {
        "message": "User registered successfully",
    }


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):

    user = users.get(data.email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        user_id=data.email,
        role=user["role"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }