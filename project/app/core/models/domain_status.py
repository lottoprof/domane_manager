from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.db import Base

class DomainStatus(Base):
    __tablename__ = 'domain_status'
    """Текущие статусы доменов, обновляемые при проверках"""

    id = Column(Integer, primary_key=True, nullable=False)
    domain_id = Column(Integer, ForeignKey('domains.id'))
    cdn_status = Column(Boolean)
    yandex_index = Column(Boolean)
    google_index = Column(Boolean)
    block_cdn = Column(Boolean)
    block_registrar = Column(Boolean)
    block_dns = Column(Boolean)
    block_gov = Column(Boolean)
    cdn_ns = Column(ARRAY(String))
    updated_at = Column(DateTime)

