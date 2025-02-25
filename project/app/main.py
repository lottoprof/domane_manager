#!/home/a3/envpy/bin/python3

# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api.routers import router
from app.core.auth import auth_router

app = FastAPI(
    title="Domain Manager API",
    description="API для управления доменами и их мониторинга.",
    version="1.0.0",
    contact={
        "name": "Support Team",
        "email": "support@domainmanager.com",
    },
    license_info={
        "name": "MIT License",
    },
)

# Настройка CORS
origins = [
    "https://q-use.ru",  # Разрешенный домен
    "http://localhost",  # Для локальной разработки (если нужно)
    "http://127.0.0.1:8000"  # Локальный сервер
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Разрешенные источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешены все HTTP-методы
    allow_headers=["*"],  # Разрешены все заголовки
)

# Подключение роутеров
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(router)

# Обработка ошибок
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"message": str(exc)},
    )

# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

# Реализация аутентификации с JWT
# 1. Регистрация: /api/auth/register
# 2. Вход: /api/auth/login
# 3. Проверка токена: /api/auth/me

# TODO: Добавить эндпоинты регистрации и логина в auth.py
# Реализация регистрации и аутентификации будет в auth.py

