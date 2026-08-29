from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.sql import func

from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id"),
        nullable=True
    )

    action = Column(
        String(100),
        nullable=False
    )

    entity_type = Column(
        String(50),
        nullable=True
    )

    entity_id = Column(
        BigInteger,
        nullable=True
    )

    ip_address = Column(
        INET,
        nullable=True
    )

    details = Column(
        JSON,
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )