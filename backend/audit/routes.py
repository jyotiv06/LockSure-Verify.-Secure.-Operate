from fastapi import APIRouter
from pydantic import BaseModel

from .service import create_audit_log, get_customer_logs, get_locker_logs

router = APIRouter(prefix="/audit", tags=["Audit"])


class AuditLogRequest(BaseModel):
    customer_id: int
    locker_id: int
    action: str
    details: str = ""
    verification_id: str | None = None


@router.post("/log")
def log_action(request: AuditLogRequest):
    return create_audit_log(
        customer_id=request.customer_id,
        locker_id=request.locker_id,
        action=request.action,
        details=request.details,
        verification_id=request.verification_id,
    )


@router.get("/customer/{customer_id}")
def customer_audit(customer_id: int):
    return get_customer_logs(customer_id)


@router.get("/locker/{locker_id}")
def locker_audit(locker_id: int):
    return get_locker_logs(locker_id)
