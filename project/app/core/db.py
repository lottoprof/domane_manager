#!/home/a3/envpy/bin/python3

# db.py
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker

# Параметры подключения к БД
DB_NAME = "dm"
DB_USER = "a3"
DB_HOST = "/var/run/postgresql"

# Синхронный движок
SYNC_DATABASE_URL = f"postgresql+psycopg2://{DB_USER}@/{DB_NAME}?host={DB_HOST}"
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)

# Асинхронный движок
ASYNC_DATABASE_URL = f"postgresql+asyncpg://{DB_USER}@/{DB_NAME}?host={DB_HOST}"
engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)

# Асинхронная сессия для приложения
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Синхронная сессия для генерации данных и тестирования
SyncSessionLocal = sessionmaker(bind=sync_engine)

# Базовая модель для SQLAlchemy
Base = declarative_base()

# Зависимость для получения асинхронной сессии
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

