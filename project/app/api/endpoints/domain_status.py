from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.domain_status import DomainStatus
from app.core.schemas.domain_status import DomainStatusSchema, DomainStatusSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/domainstatus', response_model=list[DomainStatusSchema])
def read_domainstatus(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainstatus', 'read', current_user)
    return db.query(DomainStatus).all()

@router.get('/domainstatus/{id}', response_model=DomainStatusSchema)
def read_domainstatus_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainstatus', 'read', current_user)
    result = db.query(DomainStatus).filter(DomainStatus.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/domainstatus', response_model=DomainStatusSchema)
def create_domainstatus(item: DomainStatusSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainstatus', 'create', current_user)
    db_item = DomainStatus(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/domainstatus/{id}', response_model=DomainStatusSchema)
def update_domainstatus(id: int, item: DomainStatusSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainstatus', 'update', current_user)
    db_item = db.query(DomainStatus).filter(DomainStatus.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/domainstatus/{id}', response_model=dict)
def delete_domainstatus(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainstatus', 'delete', current_user)
    db_item = db.query(DomainStatus).filter(DomainStatus.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

