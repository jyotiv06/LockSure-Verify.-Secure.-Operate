from sqlalchemy import Column, BigInteger, Date, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class CustomerKYC(Base):
    __tablename__ = "customer_kyc"

    kyc_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    date_of_birth = Column(
        Date,
        nullable=False
    )

    address = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )