from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class DomainsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    site_id: Optional[int] = None
    cdn_account_id: Optional[int] = None
    registrar_id: Optional[int] = None
    ext_id: Optional[str] = None
    name: str
    status: str
    current_nameservers: Optional[list] = None
    is_primary: Optional[bool] = None
    active_until: Optional[datetime] = None
    created_at: Optional[datetime] = None

class DomainsSchemaCreate(DomainsSchemaBase):
    pass

class DomainsSchema(DomainsSchemaBase):
    id: int
