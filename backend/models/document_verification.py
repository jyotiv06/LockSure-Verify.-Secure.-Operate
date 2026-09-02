from sqlalchemy import Column, BigInteger, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class DocumentVerification(Base):
    __tablename__ = "document_verifications"

    document_verification_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )
    
    session_id = Column(
        BigInteger,
        ForeignKey("verification_sessions.session_id"),
        nullable=False
    )

    document_id = Column(
        BigInteger,
        ForeignKey("documents.document_id"),
        nullable=False
    )

    match_score = Column(
        Numeric(5, 2)
    )

    result = Column(
        String(20),
        nullable=False
    )

    verified_at = Column(
        DateTime,
        server_default=func.now()
    )