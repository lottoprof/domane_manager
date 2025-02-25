from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.templates import Templates
from app.core.schemas.templates import TemplatesSchema, TemplatesSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/templates', response_model=list[TemplatesSchema])
def read_templates(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('templates', 'read', current_user)
    return db.query(Templates).all()

@router.get('/templates/{id}', response_model=TemplatesSchema)
def read_templates_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('templates', 'read', current_user)
    result = db.query(Templates).filter(Templates.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/templates', response_model=TemplatesSchema)
def create_templates(item: TemplatesSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('templates', 'create', current_user)
    db_item = Templates(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/templates/{id}', response_model=TemplatesSchema)
def update_templates(id: int, item: TemplatesSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('templates', 'update', current_user)
    db_item = db.query(Templates).filter(Templates.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/templates/{id}', response_model=dict)
def delete_templates(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('templates', 'delete', current_user)
    db_item = db.query(Templates).filter(Templates.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

