#!/home/a3/envpy/bin/python3

import os
import sys
from sqlalchemy.orm.properties import ColumnProperty
from sqlalchemy.orm import class_mapper

# Установка пути до корневой директории проекта
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from app.core.db import sync_engine  # Синхронный движок
from app.core.models import *
from sqlalchemy.orm import sessionmaker

# Папки для сохранения файлов
ENDPOINTS_DIR = os.path.join(project_root, "app", "api", "endpoints")
SCHEMAS_DIR = os.path.join(project_root, "app", "core", "schemas")
ROUTER_FILE = os.path.join(project_root, "app", "api", "routers.py")

# Создаём сессию для работы с базой данных
SyncSessionLocal = sessionmaker(bind=sync_engine)


def format_schema_name(model_name):
    """Формирует имя схемы для модели."""
    return f"{model_name}Schema"


def get_models():
    """Получает все модели из `app.core.models`."""
    models = {}
    for model_name, model_class in globals().items():
        if isinstance(model_class, type) and hasattr(model_class, "__tablename__"):
            models[model_name] = model_class
    return models


MODELS = get_models()

def generate_schema_file(model_name, model_class):
    """Генерация файла схемы для модели."""
    file_path = os.path.join(SCHEMAS_DIR, f"{model_class.__tablename__}.py")
    schema_name = format_schema_name(model_name)

    try:
        with open(file_path, "w") as f:
            f.write("from pydantic import BaseModel, ConfigDict\n")
            f.write("from typing import Optional\n")
            f.write("from datetime import datetime, date, time\n") 
            f.write("from decimal import Decimal\n\n")

            # Базовая схема (без id)
            f.write(f"class {schema_name}Base(BaseModel):\n")
            f.write("    model_config = ConfigDict(from_attributes=True)\n\n")

            for prop in class_mapper(model_class).iterate_properties:
                if isinstance(prop, ColumnProperty):
                    column = prop.columns[0]
                    column_name = column.name
                    column_type = getattr(column.type, "python_type", "Any").__name__
                    if column_name == "id":
                        continue  # Убираем id из базовой схемы
                    if column.nullable:
                        f.write(f"    {column_name}: Optional[{column_type}] = None\n")
                    else:
                        f.write(f"    {column_name}: {column_type}\n")

            # Схема создания (без id)
            f.write(f"\nclass {schema_name}Create({schema_name}Base):\n")
            f.write("    pass\n\n")

            # Полная схема (с id, для возврата данных)
            f.write(f"class {schema_name}({schema_name}Base):\n")
            f.write("    id: int\n")

        print(f"Схема создана: {file_path}")
    except Exception as e:
        print(f"Ошибка при создании схемы для {model_name}: {e}")

def generate_endpoint_file(model_name, model_class):
    """Генерация файла эндпоинта для модели с проверкой доступа."""
    file_path = os.path.join(ENDPOINTS_DIR, f"{model_class.__tablename__}.py")
    schema_name = format_schema_name(model_name)

    try:
        with open(file_path, "w") as f:
            f.write("from fastapi import APIRouter, Depends, HTTPException\n")
            f.write("from sqlalchemy.orm import Session\n")
            f.write("from app.core.db import SyncSessionLocal\n")
            f.write("from app.core.access_control import check_access\n")
            f.write("from app.core.auth import get_current_user\n")
            f.write(f"from app.core.models.{model_class.__tablename__} import {model_name}\n")
            f.write(f"from app.core.schemas.{model_class.__tablename__} import {schema_name}, {schema_name}Create\n\n")

            f.write("router = APIRouter()\n\n")
            f.write("def get_db():\n")
            f.write("    db = SyncSessionLocal()\n")
            f.write("    try:\n")
            f.write("        yield db\n")
            f.write("    finally:\n")
            f.write("        db.close()\n\n")

            # GET - Чтение всех записей
            f.write(f"@router.get('/{model_name.lower()}', response_model=list[{schema_name}])\n")
            f.write(f"def read_{model_name.lower()}(db: Session = Depends(get_db), current_user = Depends(get_current_user)):\n")
            f.write(f"    check_access('{model_name.lower()}', 'read', current_user)\n")
            f.write(f"    return db.query({model_name}).all()\n\n")

            # GET - Чтение одной записи
            f.write(f"@router.get('/{model_name.lower()}/{{id}}', response_model={schema_name})\n")
            f.write(f"def read_{model_name.lower()}_by_id(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):\n")
            f.write(f"    check_access('{model_name.lower()}', 'read', current_user)\n")
            f.write(f"    result = db.query({model_name}).filter({model_name}.id == id).first()\n")
            f.write("    if not result:\n")
            f.write("        raise HTTPException(status_code=404, detail='Item not found')\n")
            f.write("    return result\n\n")

            # POST - Создание записи (без id)
            f.write(f"@router.post('/{model_name.lower()}', response_model={schema_name})\n")
            f.write(f"def create_{model_name.lower()}(item: {schema_name}Create, db: Session = Depends(get_db), current_user = Depends(get_current_user)):\n")
            f.write(f"    check_access('{model_name.lower()}', 'create', current_user)\n")
            f.write(f"    db_item = {model_name}(**item.dict())\n")
            f.write("    db.add(db_item)\n")
            f.write("    db.commit()\n")
            f.write("    db.refresh(db_item)\n")
            f.write("    return db_item\n\n")

            # PUT - Обновление записи
            f.write(f"@router.put('/{model_name.lower()}/{{id}}', response_model={schema_name})\n")
            f.write(f"def update_{model_name.lower()}(id: int, item: {schema_name}Create, db: Session = Depends(get_db), current_user = Depends(get_current_user)):\n")
            f.write(f"    check_access('{model_name.lower()}', 'update', current_user)\n")
            f.write(f"    db_item = db.query({model_name}).filter({model_name}.id == id).first()\n")
            f.write("    if not db_item:\n")
            f.write("        raise HTTPException(status_code=404, detail='Item not found')\n")
            f.write("    for key, value in item.dict().items():\n")
            f.write("        setattr(db_item, key, value)\n")
            f.write("    db.commit()\n")
            f.write("    db.refresh(db_item)\n")
            f.write("    return db_item\n\n")

            # DELETE - Удаление записи
            f.write(f"@router.delete('/{model_name.lower()}/{{id}}', response_model=dict)\n")
            f.write(f"def delete_{model_name.lower()}(id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):\n")
            f.write(f"    check_access('{model_name.lower()}', 'delete', current_user)\n")
            f.write(f"    db_item = db.query({model_name}).filter({model_name}.id == id).first()\n")
            f.write("    if not db_item:\n")
            f.write("        raise HTTPException(status_code=404, detail='Item not found')\n")
            f.write("    db.delete(db_item)\n")
            f.write("    db.commit()\n")
            f.write("    return {'message': 'Item deleted successfully'}\n\n")

        print(f"Эндпоинт создан: {file_path}")
    except Exception as e:
        print(f"Ошибка при создании эндпоинта для {model_name}: {e}")

def generate_router_file():
    """Генерация основного файла роутеров."""
    try:
        with open(ROUTER_FILE, "w") as f:
            f.write("from fastapi import APIRouter\n\n")

            # Импортируем роутеры для каждой модели
            for model_name, model_class in MODELS.items():
                f.write(f"from app.api.endpoints.{model_class.__tablename__} import router as {model_class.__tablename__}_router\n")
            f.write("\nrouter = APIRouter()\n\n")
            for model_name, model_class in MODELS.items():
                f.write(f"router.include_router({model_class.__tablename__}_router, prefix='/api', tags=['{model_class.__tablename__}'])\n")

        print(f"Файл роутера создан: {ROUTER_FILE}")
    except Exception as e:
        print(f"Ошибка при создании роутера: {e}")

def main():
    try:
        # Создаём директории, если их нет
        os.makedirs(ENDPOINTS_DIR, exist_ok=True)
        os.makedirs(SCHEMAS_DIR, exist_ok=True)

        # Генерируем схемы и эндпоинты для каждой модели
        for model_name, model_class in MODELS.items():
            generate_schema_file(model_name, model_class)
            generate_endpoint_file(model_name, model_class)

        # Генерируем основной роутер
        generate_router_file()

        print("Схемы, эндпоинты и роутер успешно созданы!")
    except Exception as e:
        print("Ошибка:", e)


if __name__ == "__main__":
    main()

