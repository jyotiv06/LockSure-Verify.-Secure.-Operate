from fastapi import FastAPI

# Import models first so SQLAlchemy knows about all tables
from models.user import User
from models.customer import Customer
from models.account import Account
from models.locker import Locker
from models.document import Document
from models.verification_session import VerificationSession
from models.document_verification import DocumentVerification
from models.face_verification import FaceVerification
from models.risk_assessment import RiskAssessment
from models.locker_operation import LockerOperation
from models.security_incident import SecurityIncident
from models.audit_log import AuditLog
from models.customer_kyc import CustomerKYC

from verification.routes import router as verification_router
from audit.routes import router as audit_router


app = FastAPI(
    title="LockSure Backend",
    description="Verification and Audit APIs",
    version="1.0.0"
)


app.include_router(verification_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "LockSure Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }