from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import SyncSessionLocal
from app.core.access_control import check_access
from app.core.models.users import Users
from app.core.schemas.users import UsersSchema, UsersSchemaCreate
from passlib.context import CryptContext
from app.core.auth import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

@router.get('/users', response_model=list[UsersSchema])
def read_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('users', 'read', current_user)
    return db.query(Users).all()

@router.get('/users/{id}', response_model=UsersSchema)
def read_user(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('users', 'read', current_user)
    user = db.query(Users).filter(Users.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post('/users', response_model=UsersSchema)
def create_user(user: UsersSchemaCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('users', 'create', current_user)

    if db.query(Users).filter(Users.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(Users).filter(Users.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password_hash)

    new_user = Users(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put('/users/{id}', response_model=UsersSchema)
def update_user(id: int, user_update: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('users', 'update', current_user)

    db_user = db.query(Users).filter(Users.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if "password_hash" in user_update and user_update["password_hash"]:
        db_user.password_hash = hash_password(user_update["password_hash"])
    if "role" in user_update:
        db_user.role = user_update["role"]
    if "active" in user_update:
        db_user.active = user_update["active"]

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete('/users/{id}', response_model=dict)
def delete_user(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_access('users', 'delete', current_user)

    db_user = db.query(Users).filter(Users.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

