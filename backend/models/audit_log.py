from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(
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

    table_name = Column(
        String(100)
    )

    record_id = Column(BigInteger)

    ip_address = Column(
        String(45)
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )