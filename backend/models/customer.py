from sqlalchemy import Column, BigInteger, String, Date, DateTime
from sqlalchemy.sql import func

from database import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(BigInteger, primary_key=True)

    customer_number = Column(
        String(30),
        unique=True,
        nullable=False
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    date_of_birth = Column(Date)

    phone = Column(
        String(15),
        unique=True,
        nullable=False
    )

    email = Column(String(150))

    address = Column(String)

    status = Column(
        String(20),
        nullable=False,
        default="ACTIVE"
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )