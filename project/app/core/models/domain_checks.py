from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class DomainChecks(Base):
    __tablename__ = 'domain_checks'
    """Партиционированная таблица проверок доменов в поисковой выдаче"""

    check_id = Column(Integer, primary_key=True, nullable=False)
    domain_id = Column(BigInteger, ForeignKey('domains.id'), nullable=False)
    keyword_id = Column(BigInteger, ForeignKey('keywords.keyword_id'), nullable=False)
    position = Column(Integer)
    language = Column(String(10), nullable=False)
    check_datetime = Column(DateTime, primary_key=True, nullable=False)
    created_at = Column(DateTime)
    __table_args__ = (PrimaryKeyConstraint("check_id", "check_datetime"),)

