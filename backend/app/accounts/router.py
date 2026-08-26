from fastapi import APIRouter, Depends

from ..auth.security import require_role

router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"],
)


@router.get("/{customer_id}")
def get_account(
    customer_id: str,
    current_user=Depends(
        require_role("CUSTOMER", "OFFICER", "ADMIN")
    ),
):
    return {
        "customer_id": customer_id,
        "account_status": "ACTIVE",
    }