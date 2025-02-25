from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class RegistrarsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    registrar_id: int
    name: str
    api_url: str
    api_key: str
    contact_email: Optional[str] = None
    created_at: Optional[datetime] = None
    active: Optional[bool] = None

class RegistrarsSchemaCreate(RegistrarsSchemaBase):
    pass

class RegistrarsSchema(RegistrarsSchemaBase):
    id: int
