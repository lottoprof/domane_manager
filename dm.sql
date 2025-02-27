-- Создание пользовательских типов
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE setting_key AS ENUM (
   'redirect1',
   'redirect2',
   'api_key1',
   'api_key2',
   'api_url1',
   'api_url2'
);

-- Независимые таблицы
-- Пользователи
CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   username TEXT NOT NULL,
   password_hash TEXT NOT NULL,
   role user_role NOT NULL,
   email TEXT,
   telegram_id BIGINT,
   telegram_username TEXT,
   phone TEXT,
   telegram_2fa_enabled BOOLEAN DEFAULT false,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   created_by INTEGER REFERENCES users(id),
   last_login TIMESTAMP,
   active BOOLEAN DEFAULT true
);

COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON COLUMN users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN users.username IS 'Имя пользователя для входа';
COMMENT ON COLUMN users.password_hash IS 'Хэш пароля';
COMMENT ON COLUMN users.role IS 'Роль пользователя в системе';
COMMENT ON COLUMN users.email IS 'Email пользователя';
COMMENT ON COLUMN users.telegram_id IS 'ID пользователя в Telegram';
COMMENT ON COLUMN users.telegram_username IS 'Имя пользователя в Telegram';
COMMENT ON COLUMN users.phone IS 'Номер телефона';
COMMENT ON COLUMN users.telegram_2fa_enabled IS 'Включена ли двухфакторная аутентификация через Telegram';
COMMENT ON COLUMN users.created_at IS 'Дата и время создания пользователя';
COMMENT ON COLUMN users.created_by IS 'ID пользователя, создавшего запись';
COMMENT ON COLUMN users.last_login IS 'Время последнего входа в систему';
COMMENT ON COLUMN users.active IS 'Активен ли пользователь';

-- Регистраторы доменных имен
CREATE TABLE registrars (
   registrar_id SERIAL PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   api_url TEXT NOT NULL,
   api_key TEXT NOT NULL,
   contact_email VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   active BOOLEAN DEFAULT true
);

COMMENT ON TABLE registrars IS 'Регистраторы доменных имен для управления DNS записями';
COMMENT ON COLUMN registrars.registrar_id IS 'Уникальный идентификатор регистратора';
COMMENT ON COLUMN registrars.name IS 'Название регистратора';
COMMENT ON COLUMN registrars.api_url IS 'URL API регистратора';
COMMENT ON COLUMN registrars.api_key IS 'Ключ доступа к API';
COMMENT ON COLUMN registrars.contact_email IS 'Контактный email';
COMMENT ON COLUMN registrars.active IS 'Флаг активности регистратора';
COMMENT ON COLUMN registrars.created_at IS 'Дата и время создания записи';

-- Первый уровень зависимостей
-- Бренды
CREATE TABLE brands (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   description TEXT,
   rs_percentage NUMERIC(5,2),
   ref_link TEXT,
   start_date DATE,
   end_date DATE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   created_by INTEGER REFERENCES users(id),
   active BOOLEAN DEFAULT true
);

COMMENT ON TABLE brands IS 'Основная организационная единица - бренды, для которых создаются сайты';
COMMENT ON COLUMN brands.id IS 'Уникальный идентификатор бренда';
COMMENT ON COLUMN brands.name IS 'Название бренда';
COMMENT ON COLUMN brands.description IS 'Описание бренда';
COMMENT ON COLUMN brands.rs_percentage IS 'Процент Revenue Share';
COMMENT ON COLUMN brands.ref_link IS 'Реферальная ссылка';
COMMENT ON COLUMN brands.start_date IS 'Дата начала работы с брендом';
COMMENT ON COLUMN brands.end_date IS 'Дата окончания работы с брендом';
COMMENT ON COLUMN brands.created_at IS 'Дата и время создания записи';
COMMENT ON COLUMN brands.created_by IS 'ID пользователя, создавшего запись';
COMMENT ON COLUMN brands.active IS 'Активен ли бренд';

-- Настройки
CREATE TABLE settings (
   setting_id SERIAL PRIMARY KEY,
   key setting_key NOT NULL,
   value TEXT NOT NULL,
   description TEXT,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE settings IS 'Служебная таблица для хранения настроек системы';
COMMENT ON COLUMN settings.setting_id IS 'Уникальный идентификатор настройки';
COMMENT ON COLUMN settings.key IS 'Ключ настройки (фиксированный список значений)';
COMMENT ON COLUMN settings.value IS 'Значение настройки';
COMMENT ON COLUMN settings.description IS 'Описание настройки';
COMMENT ON COLUMN settings.updated_at IS 'Время последнего обновления';

-- Второй уровень зависимостей
-- CDN аккаунты
CREATE TABLE cdn_accounts (
   id SERIAL PRIMARY KEY,
   brand_id BIGINT NOT NULL REFERENCES brands(id),
   provider_name VARCHAR(50) NOT NULL,
   api_url TEXT NOT NULL,
   api_key TEXT NOT NULL,
   email VARCHAR(255),
   ext_id VARCHAR(255),
   active BOOLEAN DEFAULT true,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cdn_accounts IS 'Аккаунты в системах доставки контента (CDN), через которые обслуживаются домены';
COMMENT ON COLUMN cdn_accounts.id IS 'Уникальный идентификатор CDN аккаунта';
COMMENT ON COLUMN cdn_accounts.brand_id IS 'Ссылка на бренд';
COMMENT ON COLUMN cdn_accounts.provider_name IS 'Название провайдера CDN (например, Cloudflare)';
COMMENT ON COLUMN cdn_accounts.api_url IS 'URL API провайдера';
COMMENT ON COLUMN cdn_accounts.api_key IS 'Ключ доступа к API';
COMMENT ON COLUMN cdn_accounts.email IS 'Email для идентификации аккаунта';
COMMENT ON COLUMN cdn_accounts.ext_id IS 'Идентификатор аккаунта в системе CDN';
COMMENT ON COLUMN cdn_accounts.active IS 'Флаг активности аккаунта';
COMMENT ON COLUMN cdn_accounts.created_at IS 'Дата и время создания записи';

-- Шаблоны
CREATE TABLE templates (
   id SERIAL PRIMARY KEY,
   brand_id BIGINT NOT NULL REFERENCES brands(id),
   name TEXT NOT NULL,
   description TEXT,
   language VARCHAR(10) NOT NULL,
   git_repository_url TEXT,
   active BOOLEAN DEFAULT true,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE(brand_id, language)
);

COMMENT ON TABLE templates IS 'Шаблоны сайтов для разных языковых версий';
COMMENT ON COLUMN templates.id IS 'Уникальный идентификатор шаблона';
COMMENT ON COLUMN templates.brand_id IS 'Ссылка на бренд';
COMMENT ON COLUMN templates.name IS 'Название шаблона';
COMMENT ON COLUMN templates.description IS 'Описание шаблона';
COMMENT ON COLUMN templates.language IS 'Код языка (например, ru_RU)';
COMMENT ON COLUMN templates.git_repository_url IS 'URL репозитория с шаблоном';
COMMENT ON COLUMN templates.active IS 'Флаг активности шаблона';
COMMENT ON COLUMN templates.created_at IS 'Дата и время создания записи';

-- Ключевые слова
CREATE TABLE keywords (
   keyword_id SERIAL PRIMARY KEY,
   brand_id BIGINT NOT NULL REFERENCES brands(id),
   keyword TEXT NOT NULL,
   language VARCHAR(10),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE keywords IS 'Ключевые слова для продвижения брендов';
COMMENT ON COLUMN keywords.keyword_id IS 'Уникальный идентификатор ключевого слова';
COMMENT ON COLUMN keywords.brand_id IS 'Связь с брендом';
COMMENT ON COLUMN keywords.keyword IS 'Ключевое слово';
COMMENT ON COLUMN keywords.language IS 'Язык ключевого слова (например, ru, en)';
COMMENT ON COLUMN keywords.created_at IS 'Дата создания записи';

-- Третий уровень зависимостей
-- Сайты
CREATE TABLE sites (
   id SERIAL PRIMARY KEY,
   brand_id BIGINT NOT NULL REFERENCES brands(id),
   template_id INTEGER REFERENCES templates(id),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE(brand_id, template_id)
);

COMMENT ON TABLE sites IS 'Сайты - комбинация бренда и шаблона определенного языка';
COMMENT ON COLUMN sites.id IS 'Уникальный идентификатор сайта';
COMMENT ON COLUMN sites.brand_id IS 'Ссылка на бренд';
COMMENT ON COLUMN sites.template_id IS 'Ссылка на шаблон';
COMMENT ON COLUMN sites.created_at IS 'Дата и время создания записи';

-- Множественные зависимости
-- Домены
CREATE TABLE domains (
   id SERIAL PRIMARY KEY,
   site_id INTEGER REFERENCES sites(id),
   cdn_account_id INTEGER REFERENCES cdn_accounts(id),
   registrar_id INTEGER REFERENCES registrars(registrar_id),
   ext_id VARCHAR(255),
   name VARCHAR(255) NOT NULL,
   status VARCHAR(50) NOT NULL,
   current_nameservers TEXT[],
   is_primary BOOLEAN DEFAULT false,
   active_until TIMESTAMP,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE domains IS 'Домены для сайтов с информацией об их состоянии';
COMMENT ON COLUMN domains.id IS 'Уникальный идентификатор домена';
COMMENT ON COLUMN domains.site_id IS 'Ссылка на сайт';
COMMENT ON COLUMN domains.cdn_account_id IS 'Ссылка на CDN аккаунт';
COMMENT ON COLUMN domains.registrar_id IS 'Ссылка на регистратора';
COMMENT ON COLUMN domains.ext_id IS 'Внешний идентификатор в системе CDN';
COMMENT ON COLUMN domains.name IS 'Доменное имя';
COMMENT ON COLUMN domains.status IS 'Статус домена';
COMMENT ON COLUMN domains.current_nameservers IS 'Текущие NS записи';
COMMENT ON COLUMN domains.is_primary IS 'Флаг основного домена';
COMMENT ON COLUMN domains.active_until IS 'Активен до';
COMMENT ON COLUMN domains.created_at IS 'Дата и время создания записи';

CREATE INDEX idx_domains_cdn ON domains(cdn_account_id);
CREATE INDEX idx_domains_site ON domains(site_id);
CREATE UNIQUE INDEX idx_domains_name ON domains(name);

-- Статусы доменов
CREATE TABLE domain_status (
   id SERIAL PRIMARY KEY,
   domain_id INTEGER REFERENCES domains(id),
   cdn_status BOOLEAN,
   yandex_index BOOLEAN,
   google_index BOOLEAN,
   block_cdn BOOLEAN DEFAULT false,
   block_registrar BOOLEAN DEFAULT false,
   block_dns BOOLEAN DEFAULT false,
   block_gov BOOLEAN DEFAULT false,
   cdn_ns TEXT[],
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE domain_status IS 'Текущие статусы доменов, обновляемые при проверках';
COMMENT ON COLUMN domain_status.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN domain_status.domain_id IS 'Ссылка на домен';
COMMENT ON COLUMN domain_status.cdn_status IS 'Статус в CDN';
COMMENT ON COLUMN domain_status.yandex_index IS 'Индексация в Яндекс';
COMMENT ON COLUMN domain_status.google_index IS 'Индексация в Google';
COMMENT ON COLUMN domain_status.block_cdn IS 'Блокировка на уровне CDN';
COMMENT ON COLUMN domain_status.block_registrar IS 'Блокировка регистратором';
COMMENT ON COLUMN domain_status.block_dns IS 'Блокировка на уровне DNS';
COMMENT ON COLUMN domain_status.block_gov IS 'Блокировка государственными органами';
COMMENT ON COLUMN domain_status.cdn_ns IS 'NS записи от CDN';
COMMENT ON COLUMN domain_status.updated_at IS 'Дата и время последнего обновления';

-- История редиректов
CREATE TABLE domain_redirect_history (
   id SERIAL PRIMARY KEY,
   cdn_account_id INTEGER REFERENCES cdn_accounts(id),
   active_domain_id INTEGER REFERENCES domains(id),
   blocked_domain_id INTEGER REFERENCES domains(id),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE domain_redirect_history IS 'История редиректов доменов при блокировках';
COMMENT ON COLUMN domain_redirect_history.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN domain_redirect_history.cdn_account_id IS 'Ссылка на CDN аккаунт';
COMMENT ON COLUMN domain_redirect_history.active_domain_id IS 'Ссылка на новый активный домен';
COMMENT ON COLUMN domain_redirect_history.blocked_domain_id IS 'Ссылка на заблокированный домен';
COMMENT ON COLUMN domain_redirect_history.created_at IS 'Дата и время создания редиректа';

CREATE INDEX idx_redirect_blocked ON domain_redirect_history(blocked_domain_id);
CREATE INDEX idx_redirect_active ON domain_redirect_history(active_domain_id);

-- Проверки доменов
CREATE TABLE domain_checks (
   check_id SERIAL,
   domain_id BIGINT NOT NULL REFERENCES domains(id),
   keyword_id BIGINT NOT NULL REFERENCES keywords(keyword_id),
   position INT,
   language VARCHAR(10) NOT NULL,
   check_datetime TIMESTAMP NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (check_id, check_datetime)
) PARTITION BY RANGE (check_datetime);

COMMENT ON TABLE domain_checks IS 'Партиционированная таблица проверок доменов в поисковой выдаче';
COMMENT ON COLUMN domain_checks.check_id IS 'Уникальный идентификатор проверки';
COMMENT ON COLUMN domain_checks.domain_id IS 'Ссылка на домен';
COMMENT ON COLUMN domain_checks.keyword_id IS 'Ссылка на ключевое слово';
COMMENT ON COLUMN domain_checks.position IS 'Позиция домена в выдаче (или NULL, если отсутствует)';
COMMENT ON COLUMN domain_checks.language IS 'Язык проверки (например, ru, en)';
COMMENT ON COLUMN domain_checks.check_datetime IS 'Дата проверки (используется для партиционирования)';
COMMENT ON COLUMN domain_checks.created_at IS 'Время записи данных';

-- Прокси-таблица для партиционирования
CREATE TABLE domain_checks_proxy (
   check_id SERIAL,
   domain_id BIGINT NOT NULL,
   keyword_id BIGINT NOT NULL,
   position INT,
   language VARCHAR(10) NOT NULL,
   check_datetime DATE NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE domain_checks_proxy IS 'Прокси-таблица для автоматического партиционирования domain_checks';

-- Функция для партиционирования
CREATE OR REPLACE FUNCTION proxy_insert_to_partition()
RETURNS TRIGGER AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := DATE_TRUNC('month', NEW.check_datetime);
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'domain_checks_' || TO_CHAR(start_date, 'YYYY_MM');

    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = partition_name
    ) THEN
        EXECUTE FORMAT('
            CREATE TABLE %I PARTITION OF domain_checks
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date);
    END IF;

    EXECUTE FORMAT('INSERT INTO domain_checks VALUES (%L, %L, %L, %L, %L, %L, %L)',
        NEW.check_id, NEW.domain_id, NEW.keyword_id, NEW.position,
        NEW.language, NEW.check_datetime, NEW.created_at);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Триггер для вставки через прокси-таблицу
CREATE TRIGGER insert_to_partition
BEFORE INSERT ON domain_checks_proxy
FOR EACH ROW
EXECUTE FUNCTION proxy_insert_to_partition();
