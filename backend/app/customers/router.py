from fastapi import APIRouter, Depends

from ..auth.security import get_current_user

router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user),
):
    return {
        "email": current_user.get("user_id"),
        "customer_id": "CUST1001",
        "full_name": "Nirali Purkar",
        "account_status": "ACTIVE",
    }


@router.get("/{customer_id}")
def get_customer(
    customer_id: str,
    current_user=Depends(get_current_user),
):
    return {
        "customer_id": customer_id,
        "full_name": "Demo Customer",
        "account_status": "ACTIVE",
    }