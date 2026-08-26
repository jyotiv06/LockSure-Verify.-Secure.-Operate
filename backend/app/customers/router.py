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
        "message": "Customer profile endpoint",
        "user": current_user,
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