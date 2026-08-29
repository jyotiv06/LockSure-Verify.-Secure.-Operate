from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        nullable=False
    )

    password_hash = Column(
        Text,
        nullable=False
    )

    role = Column(
        String(20),
        nullable=False,
        default="OFFICER"
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )