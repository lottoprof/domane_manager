from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class DomainRedirectHistorySchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cdn_account_id: Optional[int] = None
    active_domain_id: Optional[int] = None
    blocked_domain_id: Optional[int] = None
    created_at: Optional[datetime] = None

class DomainRedirectHistorySchemaCreate(DomainRedirectHistorySchemaBase):
    pass

class DomainRedirectHistorySchema(DomainRedirectHistorySchemaBase):
    id: int
