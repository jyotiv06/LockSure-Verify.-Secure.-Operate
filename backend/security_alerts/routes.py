from fastapi import APIRouter

from .service import get_security_alerts


router = APIRouter(
    prefix="/security-alerts",
    tags=["Security Alerts"],
)


@router.get("/")
def get_alerts():
    return get_security_alerts()