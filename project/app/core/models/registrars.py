from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Registrars(Base):
    __tablename__ = 'registrars'
    """Регистраторы доменных имен для управления DNS записями"""

    registrar_id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(255), nullable=False)
    api_url = Column(Text, nullable=False)
    api_key = Column(Text, nullable=False)
    contact_email = Column(String(255))
    created_at = Column(DateTime)
    active = Column(Boolean)

