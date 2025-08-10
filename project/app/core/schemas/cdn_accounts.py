from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class CdnAccountsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    brand_id: int
    provider_name: str
    api_url: str
    api_key: str
    email: Optional[str] = None
    ext_id: Optional[str] = None
    active: Optional[bool] = None
    created_at: Optional[datetime] = None

class CdnAccountsSchemaCreate(CdnAccountsSchemaBase):
    pass

class CdnAccountsSchema(CdnAccountsSchemaBase):
    id: int
