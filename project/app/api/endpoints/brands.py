from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.brands import Brands
from app.core.schemas.brands import BrandsSchema, BrandsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/brands', response_model=list[BrandsSchema])
def read_brands(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('brands', 'read', current_user)
    return db.query(Brands).all()

@router.get('/brands/{id}', response_model=BrandsSchema)
def read_brands_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('brands', 'read', current_user)
    result = db.query(Brands).filter(Brands.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/brands', response_model=BrandsSchema)
def create_brands(item: BrandsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('brands', 'create', current_user)
    db_item = Brands(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/brands/{id}', response_model=BrandsSchema)
def update_brands(id: int, item: BrandsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('brands', 'update', current_user)
    db_item = db.query(Brands).filter(Brands.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/brands/{id}', response_model=dict)
def delete_brands(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('brands', 'delete', current_user)
    db_item = db.query(Brands).filter(Brands.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

