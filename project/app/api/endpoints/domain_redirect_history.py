from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.domain_redirect_history import DomainRedirectHistory
from app.core.schemas.domain_redirect_history import DomainRedirectHistorySchema, DomainRedirectHistorySchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/domainredirecthistory', response_model=list[DomainRedirectHistorySchema])
def read_domainredirecthistory(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainredirecthistory', 'read', current_user)
    return db.query(DomainRedirectHistory).all()

@router.get('/domainredirecthistory/{id}', response_model=DomainRedirectHistorySchema)
def read_domainredirecthistory_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainredirecthistory', 'read', current_user)
    result = db.query(DomainRedirectHistory).filter(DomainRedirectHistory.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/domainredirecthistory', response_model=DomainRedirectHistorySchema)
def create_domainredirecthistory(item: DomainRedirectHistorySchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainredirecthistory', 'create', current_user)
    db_item = DomainRedirectHistory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/domainredirecthistory/{id}', response_model=DomainRedirectHistorySchema)
def update_domainredirecthistory(id: int, item: DomainRedirectHistorySchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainredirecthistory', 'update', current_user)
    db_item = db.query(DomainRedirectHistory).filter(DomainRedirectHistory.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/domainredirecthistory/{id}', response_model=dict)
def delete_domainredirecthistory(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainredirecthistory', 'delete', current_user)
    db_item = db.query(DomainRedirectHistory).filter(DomainRedirectHistory.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

