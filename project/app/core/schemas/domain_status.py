from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class DomainStatusSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    domain_id: Optional[int] = None
    cdn_status: Optional[bool] = None
    yandex_index: Optional[bool] = None
    google_index: Optional[bool] = None
    block_cdn: Optional[bool] = None
    block_registrar: Optional[bool] = None
    block_dns: Optional[bool] = None
    block_gov: Optional[bool] = None
    cdn_ns: Optional[list] = None
    updated_at: Optional[datetime] = None

class DomainStatusSchemaCreate(DomainStatusSchemaBase):
    pass

class DomainStatusSchema(DomainStatusSchemaBase):
    id: int
