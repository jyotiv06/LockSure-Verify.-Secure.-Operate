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

    locker_id = Column(
        BigInteger,
        ForeignKey("lockers.locker_id"),
        nullable=False
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.user_id"),
        nullable=True
    )

    operation_type = Column(
        String(20),
        nullable=False
    )

    operation_time = Column(
        DateTime,
        server_default=func.now()
    )

    status = Column(
        String(20),
        nullable=False
    )