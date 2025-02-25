from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class CdnAccounts(Base):
    __tablename__ = 'cdn_accounts'
    """Аккаунты в системах доставки контента (CDN), через которые обслуживаются домены"""

    id = Column(Integer, primary_key=True, nullable=False)
    brand_id = Column(BigInteger, ForeignKey('brands.id'), nullable=False)
    provider_name = Column(String(50), nullable=False)
    api_url = Column(Text, nullable=False)
    api_key = Column(Text, nullable=False)
    email = Column(String(255))
    active = Column(Boolean)
    created_at = Column(DateTime)

