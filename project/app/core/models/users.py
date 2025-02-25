from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Users(Base):
    __tablename__ = 'users'
    """Пользователи системы"""

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(Text, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(6), nullable=False)
    email = Column(Text)
    telegram_id = Column(BigInteger)
    telegram_username = Column(Text)
    phone = Column(Text)
    telegram_2fa_enabled = Column(Boolean)
    created_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'))
    last_login = Column(DateTime)
    active = Column(Boolean)

