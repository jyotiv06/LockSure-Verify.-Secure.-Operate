from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Document(Base):
    __tablename__ = "documents"

    document_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    customer_id = Column(
        BigInteger,
        ForeignKey("customers.customer_id"),
        nullable=False
    )

    document_type = Column(
        String(30),
        nullable=False
    )

    document_number = Column(
        String(100),
        nullable=False
    )

    document_reference = Column(
        String(255)
    )

    verified = Column(
        Boolean,
        default=False,
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        server_default=func.now()
    )