from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Templates(Base):
    __tablename__ = 'templates'
    """Шаблоны сайтов для разных языковых версий"""

    id = Column(Integer, primary_key=True, nullable=False)
    brand_id = Column(BigInteger, ForeignKey('brands.id'), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    language = Column(String(10), nullable=False)
    git_repository_url = Column(Text)
    active = Column(Boolean)
    created_at = Column(DateTime)

