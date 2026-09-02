from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional

from database import SessionLocal
from models.verification_session import VerificationSession
from models.document_verification import DocumentVerification
from models.face_verification import FaceVerification

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

UPLOAD_ROOT = Path("uploads") / "verification"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def _save_upload(
    verification_id: str,
    uploaded_file: UploadFile,
    prefix: str,
) -> str:
    if not uploaded_file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no filename.",
        )

    content_type = uploaded_file.content_type or ""

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    }

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use JPG, PNG, WEBP, or PDF."
            ),
        )

    extension = Path(uploaded_file.filename).suffix.lower()

    if not extension:
        extension = ".bin"

    session_dir = UPLOAD_ROOT / str(verification_id)
    session_dir.mkdir(parents=True, exist_ok=True)

    path = session_dir / f"{prefix}_{uuid4().hex}{extension}"

    try:
        with path.open("wb") as output:
            while True:
                chunk = uploaded_file.file.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)
    except Exception as error:
        if path.exists():
            path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save uploaded file: {str(error)}",
        )

    return str(path)


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


# IMPORTANT:
# This must stay ABOVE /{verification_id}.
# FastAPI will therefore match /verification/overview here
# instead of treating "overview" as a verification_id.
@router.get("/overview")
def verification_overview():
    """
    Dashboard-wide verification statistics.

    Returns:
      - total verification sessions
      - identity/final approval success rate
      - document verification success rate
      - face match success rate
      - corresponding success counts
    """
    db = SessionLocal()

    try:
        total_verifications = (
            db.query(VerificationSession).count()
        )

        identity_approved = (
            db.query(VerificationSession)
            .filter(
                VerificationSession.status == "APPROVED"
            )
            .count()
        )

        total_documents = (
            db.query(DocumentVerification).count()
        )

        documents_verified = (
            db.query(DocumentVerification)
            .filter(
                DocumentVerification.result == "VERIFIED"
            )
            .count()
        )

        total_faces = (
            db.query(FaceVerification).count()
        )

        faces_verified = (
            db.query(FaceVerification)
            .filter(
                FaceVerification.result == "VERIFIED"
            )
            .count()
        )

        identity_success_rate = (
            round(
                (identity_approved / total_verifications) * 100,
                2,
            )
            if total_verifications > 0
            else 0.0
        )

        document_success_rate = (
            round(
                (documents_verified / total_documents) * 100,
                2,
            )
            if total_documents > 0
            else 0.0
        )

        face_success_rate = (
            round(
                (faces_verified / total_faces) * 100,
                2,
            )
            if total_faces > 0
            else 0.0
        )

        return {
            "total_verifications": total_verifications,
            "identity_verification_success_rate": identity_success_rate,
            "document_verification_success_rate": document_success_rate,
            "face_match_success_rate": face_success_rate,
            "identity_approved": identity_approved,
            "documents_verified": documents_verified,
            "faces_verified": faces_verified,
        }

    finally:
        db.close()


@router.get("/{verification_id}")
def get_session(verification_id: str):
    session = get_verification(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return session


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
            detail="Verification not found",
        )

    return session


@router.post("/{verification_id}/document/upload")
async def document_upload(
    verification_id: str,
    file: UploadFile = File(...),
):
    """
    Real document-verification endpoint.

    Browser file
        -> FastAPI upload
        -> local verification file
        -> Samiksha OCR through verify_document_real()
        -> persisted verification result
    """

    saved_path = _save_upload(
        verification_id,
        file,
        "document",
    )

    # Do not pass fake document_match=True.
    # The service executes the real OCR path.
    result = process_document(
        verification_id=verification_id,
        image_path=saved_path,
        customer_data=None,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return result


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


@router.post("/{verification_id}/face/upload")
async def face_upload(
    verification_id: str,
    file: UploadFile = File(...),
):
    """
    Real face-verification endpoint.

    Browser camera image
        -> FastAPI upload
        -> previously uploaded identity document
        -> extract reference face
        -> Dhanashree DeepFace
        -> actual matched/confidence result
    """

    saved_path = _save_upload(
        verification_id,
        file,
        "live_face",
    )

    result = process_face(
        verification_id=verification_id,
        live_image=saved_path,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return result


@router.post("/{verification_id}/finalize")
def finalize(verification_id: str):
    session = finalize_verification(verification_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Verification not found",
        )

    return session
