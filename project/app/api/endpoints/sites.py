from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.sites import Sites
from app.core.schemas.sites import SitesSchema, SitesSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/sites', response_model=list[SitesSchema])
def read_sites(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('sites', 'read', current_user)
    return db.query(Sites).all()

@router.get('/sites/{id}', response_model=SitesSchema)
def read_sites_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('sites', 'read', current_user)
    result = db.query(Sites).filter(Sites.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/sites', response_model=SitesSchema)
def create_sites(item: SitesSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('sites', 'create', current_user)
    db_item = Sites(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/sites/{id}', response_model=SitesSchema)
def update_sites(id: int, item: SitesSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('sites', 'update', current_user)
    db_item = db.query(Sites).filter(Sites.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/sites/{id}', response_model=dict)
def delete_sites(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('sites', 'delete', current_user)
    db_item = db.query(Sites).filter(Sites.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

