from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .service import (
    start_verification,
    get_verification,
    process_document,
    process_face,
    finalize_verification
)


router = APIRouter(
    prefix="/verification",
    tags=["Verification"]
)


class VerificationStartRequest(BaseModel):
    customer_id: int
    locker_id: int


class DocumentResultRequest(BaseModel):
    document_id: int
    document_match: bool


class FaceResultRequest(BaseModel):
    face_match: bool


@router.post("/start")
def start(request: VerificationStartRequest):
    session = start_verification(
        request.customer_id,
        request.locker_id
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Customer not found or locker is unavailable"
        )

    return session


@router.get("/{verification_id}")
def get_session(verification_id: int):
    session = get_verification(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification not found"
        )

    return session


@router.post("/{verification_id}/document")
def document_result(
    verification_id: int,
    request: DocumentResultRequest
):
    session = process_document(
        verification_id,
        request.document_id,
        request.document_match
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification or document not found"
        )

    return session


@router.post("/{verification_id}/face")
def face_result(
    verification_id: int,
    request: FaceResultRequest
):
    session = process_face(
        verification_id,
        request.face_match
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification not found"
        )

    return session


@router.post("/{verification_id}/finalize")
def finalize(verification_id: int):
    session = finalize_verification(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification not found"
        )

    return session