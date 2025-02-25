from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class DomainRedirectHistory(Base):
    __tablename__ = 'domain_redirect_history'
    """История редиректов доменов при блокировках"""

    id = Column(Integer, primary_key=True, nullable=False)
    cdn_account_id = Column(Integer, ForeignKey('cdn_accounts.id'))
    active_domain_id = Column(Integer, ForeignKey('domains.id'))
    blocked_domain_id = Column(Integer, ForeignKey('domains.id'))
    created_at = Column(DateTime)

