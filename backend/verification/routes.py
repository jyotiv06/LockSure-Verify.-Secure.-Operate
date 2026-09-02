from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from .service import (
    start_verification,
    get_verification,
    process_document,
    process_face,
    finalize_verification,
)


router = APIRouter(
    prefix="/verification",
    tags=["Verification"],
)


# =====================================
# REQUEST MODELS
# =====================================

class VerificationStartRequest(BaseModel):
    customer_id: int
    locker_id: str
    account_status: str = "ACTIVE"
    failed_attempts: int = Field(default=0, ge=0)
    access_attempts_last_hour: int = Field(default=0, ge=0)
    customer_data: Optional[dict] = None


class DocumentResultRequest(BaseModel):
    document_match: Optional[bool] = None
    image_path: Optional[str] = None
    customer_data: Optional[dict] = None


class FaceResultRequest(BaseModel):
    face_match: Optional[bool] = None
    reference_image: Optional[str] = None
    live_image: Optional[str] = None


# =====================================
# START VERIFICATION
# =====================================

@router.post("/start")
def start(request: VerificationStartRequest):

    result = start_verification(
        customer_id=request.customer_id,
        locker_id=request.locker_id,
        account_status=request.account_status,
        failed_attempts=request.failed_attempts,
        access_attempts_last_hour=request.access_attempts_last_hour,
        customer_data=request.customer_data,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Customer or locker not found",
        )

    return result


# =====================================
# GET VERIFICATION SESSION
# =====================================

@router.get("/{verification_id}")
def get_session(verification_id: str):

    session = get_verification(
        verification_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return session


# =====================================
# PROCESS DOCUMENT VERIFICATION
# =====================================

@router.post("/{verification_id}/document")
def document_result(
    verification_id: str,
    request: DocumentResultRequest,
):

    session = process_document(
        verification_id=verification_id,
        document_match=request.document_match,
        image_path=request.image_path,
        customer_data=request.customer_data,
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Verification not found or document not found",
        )

    return session


# =====================================
# PROCESS FACE VERIFICATION
# =====================================

@router.post("/{verification_id}/face")
def face_result(
    verification_id: str,
    request: FaceResultRequest,
):

    session = process_face(
        verification_id=verification_id,
        face_match=request.face_match,
        reference_image=request.reference_image,
        live_image=request.live_image,
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return session


# =====================================
# FINALIZE VERIFICATION
# =====================================

@router.post("/{verification_id}/finalize")
def finalize(verification_id: str):

    session = finalize_verification(
        verification_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return session