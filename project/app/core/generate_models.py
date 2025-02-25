#!/home/a3/envpy/bin/python3

import os
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import declarative_base

# URL для подключения к базе данных
DATABASE_URL = "postgresql+psycopg2://a3@/dm?host=/var/run/postgresql"

# Директория для сохранения моделей
OUTPUT_DIR = "models"

def get_table_comment(conn, table_name):
    """Получение комментария для таблицы"""
    query = text("""
        SELECT obj_description(oid, 'pg_class') AS comment
        FROM pg_class
        WHERE relname = :table_name
    """)
    result = conn.execute(query, {"table_name": table_name}).mappings().first()
    return result["comment"] if result and result["comment"] else None


def map_column_type(column_type):
    """Преобразование типов из базы данных в SQLAlchemy"""
    type_mapping = {
        "INTEGER": "Integer",
        "BIGINT": "BigInteger",
        "SMALLINT": "SmallInteger",
        "NUMERIC": "Numeric",
        "DECIMAL": "Numeric",
        "REAL": "Float",
        "DOUBLE PRECISION": "Float",
        "CHARACTER VARYING": "String",
        "VARCHAR": "String",
        "CHARACTER": "String",
        "CHAR": "String",
        "TEXT": "Text",
        "DATE": "Date",
        "TIMESTAMP": "DateTime",
        "TIMESTAMP WITH TIME ZONE": "DateTime(timezone=True)",
        "TIMESTAMP WITHOUT TIME ZONE": "DateTime",
        "TIME": "Time",
        "TIME WITH TIME ZONE": "Time(timezone=True)",
        "TIME WITHOUT TIME ZONE": "Time",
        "BOOLEAN": "Boolean",
        "UUID": "String",
        "BYTEA": "LargeBinary",
        "JSON": "JSON",
        "JSONB": "JSON",
    }

    column_type_str = str(column_type).upper()
    
    # Обработка ARRAY
    if column_type_str.startswith('ARRAY'):
        # Извлекаем тип элементов массива
        inner_type = column_type_str[6:-1]  # Убираем 'ARRAY(' и ')'
        base_type = inner_type.split('(')[0].strip()
        if base_type in type_mapping:
            return f"ARRAY({type_mapping[base_type]})"
        return f"ARRAY(String)"  # По умолчанию массив строк
    
    # Проверка на наличие параметров типа данных
    if "(" in column_type_str:
        base_type = column_type_str.split("(")[0].strip()
        if base_type in type_mapping:
            return f"{type_mapping[base_type]}{column_type_str[len(base_type):]}"
    
    return type_mapping.get(column_type_str, "String")

def generate_model_file(table_name, table, output_dir, table_comment):
    """Генерация Python-файла для модели."""
    
    # Получаем составной PRIMARY KEY, если он есть
    primary_keys = [c.name for c in table.primary_key.columns]
    
    # Проверяем, есть ли PRIMARY KEY
    if not primary_keys:
        print(f"⚠️ Таблица {table_name} не имеет PRIMARY KEY, модель не создается")
        return  # Пропускаем создание модели
    
    base_class = "Base"  # SQLAlchemy-модель
    
    class_name = "".join(word.capitalize() for word in table_name.split("_"))
    model_file = os.path.join(output_dir, f"{table_name}.py")

    with open(model_file, "w") as f:
        # Заголовок файла
        f.write("from sqlalchemy import Column, Integer, String, Text, Boolean, BigInteger, Float, DateTime, ForeignKey, Numeric, Date, Time, LargeBinary, JSON, PrimaryKeyConstraint\n")
        f.write("from sqlalchemy.dialects.postgresql import ARRAY\n")
        f.write("from sqlalchemy.orm import relationship\n")
        f.write("from app.core.db import Base\n\n")

        # Генерация класса модели
        f.write(f"class {class_name}({base_class}):\n")
        f.write(f"    __tablename__ = '{table_name}'\n")
        if table_comment:
            f.write(f"    \"\"\"{table_comment}\"\"\"\n\n")

        # Добавление колонок
        for column in table.columns:
            column_type = map_column_type(str(column.type))  # Преобразование типа
            column_code = f"    {column.name} = Column({column_type}"

            # Добавляем ForeignKey, если есть
            if column.foreign_keys:
                for fk in column.foreign_keys:
                    column_code += f", ForeignKey('{fk.column.table.name}.{fk.column.name}')"

            # Добавляем другие параметры
            if column.name in primary_keys:
                column_code += ", primary_key=True"
            if not column.nullable:
                column_code += ", nullable=False"
            if column.default is not None:
                column_code += f", default={column.default}"

            column_code += ")"
            f.write(column_code + "\n")
        
        # Если составной ключ, добавляем PrimaryKeyConstraint
        if len(primary_keys) > 1:
            primary_key_str = ", ".join(f'"{pk}"' for pk in primary_keys)
            f.write(f"    __table_args__ = (PrimaryKeyConstraint({primary_key_str}),)\n")
        
        f.write("\n")
    print(f"Модель для таблицы {table_name} создана: {model_file}")


def generate_init_file(output_dir):
    """Генерация __init__.py с импортами всех моделей"""
    init_file = os.path.join(output_dir, "__init__.py")
    files = [f for f in os.listdir(output_dir) if f.endswith(".py") and f != "__init__.py"]
    with open(init_file, "w") as f:
        f.write("# Импорты всех моделей\n")
        for file in files:
            module_name = file[:-3]
            f.write(f"from .{module_name} import *\n")
    print(f"Файл {init_file} создан.")

def main():
    try:
        # Создаем подключение к базе данных
        engine = create_engine(DATABASE_URL)
        metadata = MetaData()

        # Отражаем структуру базы данных
        metadata.reflect(bind=engine)
        Base = declarative_base(metadata=metadata)

        # Создаем директорию для моделей, если она не существует
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        with engine.connect() as conn:
            # Генерация моделей
            for table_name, table in metadata.tables.items():
                table_comment = get_table_comment(conn, table_name)
                generate_model_file(table_name, table, OUTPUT_DIR, table_comment)

        # Генерация __init__.py
        generate_init_file(OUTPUT_DIR)

        print(f"Все модели сгенерированы и сохранены в папке {OUTPUT_DIR}")

    except Exception as e:
        print("Ошибка:", e)

if __name__ == "__main__":
    main()

