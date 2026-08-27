from database import Base, engine

# Import all models
from models.customer import Customer
from models.account import Account
from models.locker import Locker
from models.document import Document
from models.verification_session import VerificationSession
from models.face_verification import FaceVerification
from models.document_verification import DocumentVerification
from models.risk_assessment import RiskAssessment
from models.locker_operation import LockerOperation
from models.security_incident import SecurityIncident
from models.audit_log import AuditLog


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("All database tables created successfully!")