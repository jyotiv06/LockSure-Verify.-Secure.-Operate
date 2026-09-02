from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class VerificationSession(Base):
    __tablename__ = "verification_sessions"

    session_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=False
    )

    locker_id = Column(
        BigInteger,
        ForeignKey("lockers.locker_id"),
        nullable=True
    )

    officer_id = Column(
        BigInteger,
        ForeignKey("users.user_id"),
        nullable=True
    )

    started_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    status = Column(
        String(20),
        nullable=False,
        default="IN_PROGRESS"
    )