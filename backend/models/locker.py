from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Locker(Base):
    __tablename__ = "lockers"

    locker_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    locker_number = Column(
        String(20),
        unique=True,
        nullable=False
    )

    branch_code = Column(
        String(20),
        nullable=False
    )

    locker_size = Column(
        String(20),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="AVAILABLE"
    )

    assigned_customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )