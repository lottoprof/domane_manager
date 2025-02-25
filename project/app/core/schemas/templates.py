from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class TemplatesSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    brand_id: int
    name: str
    description: Optional[str] = None
    language: str
    git_repository_url: Optional[str] = None
    active: Optional[bool] = None
    created_at: Optional[datetime] = None

class TemplatesSchemaCreate(TemplatesSchemaBase):
    pass

class TemplatesSchema(TemplatesSchemaBase):
    id: int
