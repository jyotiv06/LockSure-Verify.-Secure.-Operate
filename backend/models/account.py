from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(BigInteger, primary_key=True, autoincrement=True)

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=False
    )

    account_number = Column(
        String(20),
        unique=True,
        nullable=False
    )

    account_type = Column(
        String(20),
        nullable=False,
        default="SAVINGS"
    )

    status = Column(
        String(20),
        nullable=False,
        default="ACTIVE"
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )