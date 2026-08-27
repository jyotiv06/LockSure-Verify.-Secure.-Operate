from sqlalchemy import Column, BigInteger, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class FaceVerification(Base):
    __tablename__ = "face_verifications"

    face_verification_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    session_id = Column(
        BigInteger,
        ForeignKey("verification_sessions.session_id"),
        nullable=False
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
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