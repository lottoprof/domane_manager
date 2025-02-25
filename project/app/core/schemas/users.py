from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date, time
from decimal import Decimal

class UsersSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str
    password_hash: str
    role: str
    email: Optional[str] = None
    telegram_id: Optional[int] = None
    telegram_username: Optional[str] = None
    phone: Optional[str] = None
    telegram_2fa_enabled: Optional[bool] = None
    created_at: Optional[datetime] = None
    created_by: Optional[int] = None
    last_login: Optional[datetime] = None
    active: Optional[bool] = None

class UsersSchemaCreate(UsersSchemaBase):
    pass

class UsersSchema(UsersSchemaBase):
    id: int
