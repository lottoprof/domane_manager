from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Keywords(Base):
    __tablename__ = 'keywords'
    """Ключевые слова для продвижения брендов"""

    keyword_id = Column(Integer, primary_key=True, nullable=False)
    brand_id = Column(BigInteger, ForeignKey('brands.id'), nullable=False)
    keyword = Column(Text, nullable=False)
    language = Column(String(10))
    created_at = Column(DateTime)

