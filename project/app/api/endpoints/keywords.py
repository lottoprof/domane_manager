from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.auth import get_current_user
from app.core.models.keywords import Keywords
from app.core.schemas.keywords import KeywordsSchema, KeywordsSchemaCreate

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/keywords', response_model=list[KeywordsSchema])
def read_keywords(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('keywords', 'read', current_user)
    return db.query(Keywords).all()

@router.get('/keywords/{id}', response_model=KeywordsSchema)
def read_keywords_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('keywords', 'read', current_user)
    result = db.query(Keywords).filter(Keywords.id == id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Item not found')
    return result

@router.post('/keywords', response_model=KeywordsSchema)
def create_keywords(item: KeywordsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('keywords', 'create', current_user)
    db_item = Keywords(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put('/keywords/{id}', response_model=KeywordsSchema)
def update_keywords(id: int, item: KeywordsSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('keywords', 'update', current_user)
    db_item = db.query(Keywords).filter(Keywords.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete('/keywords/{id}', response_model=dict)
def delete_keywords(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('keywords', 'delete', current_user)
    db_item = db.query(Keywords).filter(Keywords.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail='Item not found')
    db.delete(db_item)
    db.commit()
    return {'message': 'Item deleted successfully'}

