from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.domains import Domains
from app.core.schemas.domains import DomainsSchema, DomainsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/domains', response_model=list[DomainsSchema])
def read_domains(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domains', 'read', current_user)
    return db.query(Domains).all()

@router.get('/domains/{id}', response_model=DomainsSchema)
def read_domains_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domains', 'read', current_user)
    result = db.query(Domains).filter(Domains.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/domains', response_model=DomainsSchema)
def create_domains(item: DomainsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domains', 'create', current_user)
    db_item = Domains(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/domains/{id}', response_model=DomainsSchema)
def update_domains(id: int, item: DomainsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domains', 'update', current_user)
    db_item = db.query(Domains).filter(Domains.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/domains/{id}', response_model=dict)
def delete_domains(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domains', 'delete', current_user)
    db_item = db.query(Domains).filter(Domains.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

