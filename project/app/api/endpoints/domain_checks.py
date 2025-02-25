from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.domain_checks import DomainChecks
from app.core.schemas.domain_checks import DomainChecksSchema, DomainChecksSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/domainchecks', response_model=list[DomainChecksSchema])
def read_domainchecks(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainchecks', 'read', current_user)
    return db.query(DomainChecks).all()

@router.get('/domainchecks/{id}', response_model=DomainChecksSchema)
def read_domainchecks_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainchecks', 'read', current_user)
    result = db.query(DomainChecks).filter(DomainChecks.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/domainchecks', response_model=DomainChecksSchema)
def create_domainchecks(item: DomainChecksSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainchecks', 'create', current_user)
    db_item = DomainChecks(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/domainchecks/{id}', response_model=DomainChecksSchema)
def update_domainchecks(id: int, item: DomainChecksSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainchecks', 'update', current_user)
    db_item = db.query(DomainChecks).filter(DomainChecks.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/domainchecks/{id}', response_model=dict)
def delete_domainchecks(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('domainchecks', 'delete', current_user)
    db_item = db.query(DomainChecks).filter(DomainChecks.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

