from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Brands(Base):
    __tablename__ = 'brands'
    """Основная организационная единица - бренды, для которых создаются сайты"""

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    rs_percentage = Column(Numeric(5, 2))
    ref_link = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey('users.id'))
    active = Column(Boolean)

