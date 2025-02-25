from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class SitesSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    brand_id: int
    template_id: Optional[int] = None
    created_at: Optional[datetime] = None

class SitesSchemaCreate(SitesSchemaBase):
    pass

class SitesSchema(SitesSchemaBase):
    id: int
