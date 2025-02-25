from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.cdn_accounts import CdnAccounts
from app.core.schemas.cdn_accounts import CdnAccountsSchema, CdnAccountsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/cdnaccounts', response_model=list[CdnAccountsSchema])
def read_cdnaccounts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('cdnaccounts', 'read', current_user)
    return db.query(CdnAccounts).all()

@router.get('/cdnaccounts/{id}', response_model=CdnAccountsSchema)
def read_cdnaccounts_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('cdnaccounts', 'read', current_user)
    result = db.query(CdnAccounts).filter(CdnAccounts.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/cdnaccounts', response_model=CdnAccountsSchema)
def create_cdnaccounts(item: CdnAccountsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('cdnaccounts', 'create', current_user)
    db_item = CdnAccounts(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/cdnaccounts/{id}', response_model=CdnAccountsSchema)
def update_cdnaccounts(id: int, item: CdnAccountsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('cdnaccounts', 'update', current_user)
    db_item = db.query(CdnAccounts).filter(CdnAccounts.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/cdnaccounts/{id}', response_model=dict)
def delete_cdnaccounts(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('cdnaccounts', 'delete', current_user)
    db_item = db.query(CdnAccounts).filter(CdnAccounts.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

