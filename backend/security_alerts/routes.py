from fastapi import APIRouter, HTTPException

from .service import (
    get_security_alerts,
    resolve_security_alert,
    dismiss_security_alert,
)


router = APIRouter(
    prefix="/security-alerts",
    tags=["Security Alerts"],
)


# ============================================================
# GET ACTIVE ALERTS
# ============================================================

@router.get("/")
def get_alerts():

    return get_security_alerts()


# ============================================================
# RESOLVE ALERT
# ============================================================

@router.post("/{risk_id}/resolve")
def resolve_alert(risk_id: int):

    result = resolve_security_alert(risk_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Security alert not found",
        )

    return result


# ============================================================
# DISMISS ALERT
# ============================================================

@router.post("/{risk_id}/dismiss")
def dismiss_alert(risk_id: int):

    result = dismiss_security_alert(risk_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Security alert not found",
        )

    return result