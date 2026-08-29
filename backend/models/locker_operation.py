from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class LockerOperation(Base):
    __tablename__ = "locker_operations"

    operation_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    locker_id = Column(
        BigInteger,
        ForeignKey("lockers.locker_id"),
        nullable=False
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=False
    )

    session_id = Column(
        BigInteger,
        ForeignKey("verification_sessions.session_id"),
        nullable=True
    )

    officer_id = Column(
        BigInteger,
        ForeignKey("users.user_id"),
        nullable=True
    )

    operation_type = Column(
        String(30),
        nullable=False
    )

    operation_status = Column(
        String(20),
        nullable=False
    )

    operated_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )