from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class Domains(Base):
    __tablename__ = 'domains'
    """Домены для сайтов с информацией об их состоянии"""

    id = Column(Integer, primary_key=True, nullable=False)
    site_id = Column(Integer, ForeignKey('sites.id'))
    cdn_account_id = Column(Integer, ForeignKey('cdn_accounts.id'))
    registrar_id = Column(Integer, ForeignKey('registrars.registrar_id'))
    ext_id = Column(String(255))
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    current_nameservers = Column(ARRAY(String))
    is_primary = Column(Boolean)
    active_until = Column(DateTime)
    created_at = Column(DateTime)

