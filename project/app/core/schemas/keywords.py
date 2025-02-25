from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class KeywordsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    keyword_id: int
    brand_id: int
    keyword: str
    language: Optional[str] = None
    created_at: Optional[datetime] = None

class KeywordsSchemaCreate(KeywordsSchemaBase):
    pass

class KeywordsSchema(KeywordsSchemaBase):
    id: int
