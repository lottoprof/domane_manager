from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.registrars import Registrars
from app.core.schemas.registrars import RegistrarsSchema, RegistrarsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/registrars', response_model=list[RegistrarsSchema])
def read_registrars(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('registrars', 'read', current_user)
    return db.query(Registrars).all()

@router.get('/registrars/{id}', response_model=RegistrarsSchema)
def read_registrars_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('registrars', 'read', current_user)
    result = db.query(Registrars).filter(Registrars.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/registrars', response_model=RegistrarsSchema)
def create_registrars(item: RegistrarsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('registrars', 'create', current_user)
    db_item = Registrars(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/registrars/{id}', response_model=RegistrarsSchema)
def update_registrars(id: int, item: RegistrarsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('registrars', 'update', current_user)
    db_item = db.query(Registrars).filter(Registrars.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/registrars/{id}', response_model=dict)
def delete_registrars(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('registrars', 'delete', current_user)
    db_item = db.query(Registrars).filter(Registrars.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

