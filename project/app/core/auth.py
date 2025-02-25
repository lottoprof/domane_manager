from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from app.core.db import SyncSessionLocal  # Используем SyncSessionLocal
from app.core.models.users import Users

# Конфигурация токенов
SECRET_KEY = "your-secret-key"  # Замените на случайно сгенерированный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Инициализация для работы с хешированием паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Роутер для аутентификации
auth_router = APIRouter()

# Схемы
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserAuth(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"  # Значение по умолчанию

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Хеширование пароля
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Проверка пароля
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Генерация токена доступа
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Функция для получения синхронной сессии БД
def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Получение текущего пользователя
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded payload:", payload)  # Логируем payload
        username: str = payload.get("sub")
        if username is None:
            print("Username not found in token")  # Логируем ошибку
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError as e:
        print("JWTError:", str(e))  # Логируем ошибку JWT
        raise credentials_exception
    user = db.query(Users).filter(Users.username == token_data.username).first()
    if user is None:
        print("User not found in database")  # Логируем, если пользователь не найден
        raise credentials_exception
    print("Authenticated user:", user.username)  # Логируем успешный поиск
    return user

# Регистрация пользователя
@auth_router.post("/register", response_model=Token)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, что пользователя с таким именем или email нет
    if db.query(Users).filter(Users.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(Users).filter(Users.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Создаем нового пользователя
    hashed_password = hash_password(user.password)
    new_user = Users(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role  # Убедимся, что role передается
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Генерируем токен
    access_token = create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Логин пользователя
@auth_router.post("/login", response_model=Token)
def login_user(user: UserAuth, db: Session = Depends(get_db)):
    db_user = db.query(Users).filter(Users.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Проверка текущего пользователя
@auth_router.get("/me")
def read_users_me(current_user: Users = Depends(get_current_user)):
    # Формируем безопасный ответ без конфиденциальных данных
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "telegram_id": current_user.telegram_id,
        "phone": current_user.phone,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login,
        "telegram_username": current_user.telegram_username,
        "telegram_2fa_enabled": current_user.telegram_2fa_enabled,
        "created_by": current_user.created_by,
        "active": current_user.active,
    }


