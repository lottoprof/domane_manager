from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Sites(Base):
    __tablename__ = 'sites'
    """Сайты - комбинация бренда и шаблона определенного языка"""

    id = Column(Integer, primary_key=True, nullable=False)
    brand_id = Column(BigInteger, ForeignKey('brands.id'), nullable=False)
    template_id = Column(Integer, ForeignKey('templates.id'))
    created_at = Column(DateTime)

