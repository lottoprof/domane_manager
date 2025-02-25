from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class DomainChecksSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    check_id: int
    domain_id: int
    keyword_id: int
    position: Optional[int] = None
    language: str
    check_datetime: datetime
    created_at: Optional[datetime] = None

class DomainChecksSchemaCreate(DomainChecksSchemaBase):
    pass

class DomainChecksSchema(DomainChecksSchemaBase):
    id: int
