from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.settings import Settings
from app.core.schemas.settings import SettingsSchema, SettingsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/settings', response_model=list[SettingsSchema])
def read_settings(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('settings', 'read', current_user)
    return db.query(Settings).all()

@router.get('/settings/{id}', response_model=SettingsSchema)
def read_settings_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('settings', 'read', current_user)
    result = db.query(Settings).filter(Settings.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/settings', response_model=SettingsSchema)
def create_settings(item: SettingsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('settings', 'create', current_user)
    db_item = Settings(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/settings/{id}', response_model=SettingsSchema)
def update_settings(id: int, item: SettingsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('settings', 'update', current_user)
    db_item = db.query(Settings).filter(Settings.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/settings/{id}', response_model=dict)
def delete_settings(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('settings', 'delete', current_user)
    db_item = db.query(Settings).filter(Settings.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

