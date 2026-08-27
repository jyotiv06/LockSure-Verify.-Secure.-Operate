from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    incident_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    session_id = Column(
        BigInteger,
        ForeignKey("verification_sessions.session_id"),
        nullable=True
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=True
    )

    incident_type = Column(
        String(50),
        nullable=False
    )

    description = Column(Text)

    severity = Column(
        String(20),
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )