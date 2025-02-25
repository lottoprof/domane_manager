from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class BrandsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: Optional[str] = None
    rs_percentage: Optional[Decimal] = None
    ref_link: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: Optional[datetime] = None
    created_by: Optional[int] = None
    active: Optional[bool] = None

class BrandsSchemaCreate(BrandsSchemaBase):
    pass

class BrandsSchema(BrandsSchemaBase):
    id: int
