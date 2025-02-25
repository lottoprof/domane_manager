from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class SettingsSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    setting_id: int
    key: str
    value: str
    description: Optional[str] = None
    updated_at: Optional[datetime] = None

class SettingsSchemaCreate(SettingsSchemaBase):
    pass

class SettingsSchema(SettingsSchemaBase):
    id: int
