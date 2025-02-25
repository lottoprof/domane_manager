from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Settings(Base):
    __tablename__ = 'settings'
    """Служебная таблица для хранения настроек системы"""

    setting_id = Column(Integer, primary_key=True, nullable=False)
    key = Column(String(9), nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime)

