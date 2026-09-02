from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Numeric,
    Text,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    risk_assessment_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    session_id = Column(
        BigInteger,
        ForeignKey("verification_sessions.session_id"),
        nullable=False
    )

    risk_score = Column(
        Numeric(5, 2),
        nullable=False
    )

    risk_level = Column(
        String(20),
        nullable=False
    )

    decision = Column(
        String(30),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=True
    )

    assessed_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )