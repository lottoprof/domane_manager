erDiagram
    users ||--o{ settings : "creates"
    users ||--o{ brands : "creates"
    brands ||--o{ cdn_accounts : "has"
    brands ||--o{ templates : "has"
    brands ||--o{ keywords : "has"
    brands ||--o{ sites : "has"
    templates ||--o{ sites : "used_in"
    registrars ||--o{ domains : "manages"
    sites ||--o{ domains : "contains"
    cdn_accounts ||--o{ domains : "manages"
    domains ||--o{ domain_status : "has"
    domains ||--o{ domain_redirect_history : "has"
    domains ||--o{ domain_checks : "monitored_in"
    keywords ||--o{ domain_checks : "used_in"
    domain_checks ||--o{ domain_checks_proxy : "proxied_by"

    users {
        id SERIAL PK
        username TEXT
        password_hash TEXT
        role user_role
        email TEXT
        telegram_id BIGINT
        telegram_username TEXT
        phone TEXT
        telegram_2fa_enabled BOOLEAN
        created_at TIMESTAMP
        created_by INTEGER FK
        last_login TIMESTAMP
        active BOOLEAN
    }
    
    brands {
        id SERIAL PK
        name TEXT
        description TEXT
        rs_percentage NUMERIC
        ref_link TEXT
        start_date DATE
        end_date DATE
        created_at TIMESTAMP
        created_by INTEGER FK
        active BOOLEAN
    }
    
    registrars {
        registrar_id SERIAL PK
        name VARCHAR(255)
        api_url TEXT
        api_key TEXT
        contact_email VARCHAR(255)
        created_at TIMESTAMP
        active BOOLEAN
    }
    
    settings {
        setting_id SERIAL PK
        key setting_key
        value TEXT
        description TEXT
        updated_at TIMESTAMP
    }
    
    cdn_accounts {
        id SERIAL PK
        brand_id BIGINT FK
        provider_name VARCHAR(50)
        api_url TEXT
        api_key TEXT
        email VARCHAR(255)
        active BOOLEAN
        created_at TIMESTAMP
    }
    
    templates {
        id SERIAL PK
        brand_id BIGINT FK
        name TEXT
        description TEXT
        language VARCHAR(10)
        git_repository_url TEXT
        active BOOLEAN
        created_at TIMESTAMP
    }
    
    keywords {
        keyword_id SERIAL PK
        brand_id BIGINT FK
        keyword TEXT
        language VARCHAR(10)
        created_at TIMESTAMP
    }
    
    sites {
        id SERIAL PK
        brand_id BIGINT FK
        template_id INTEGER FK
        created_at TIMESTAMP
    }
    
    domains {
        id SERIAL PK
        site_id INTEGER FK
        cdn_account_id INTEGER FK
        registrar_id INTEGER FK
        ext_id VARCHAR(255)
        name VARCHAR(255)
        status VARCHAR(50)
        current_nameservers TEXT[]
        is_primary BOOLEAN
        active_until TIMESTAMP
        created_at TIMESTAMP
    }
    
    domain_status {
        id SERIAL PK
        domain_id INTEGER FK
        cdn_status BOOLEAN
        yandex_index BOOLEAN
        google_index BOOLEAN
        block_cdn BOOLEAN
        block_registrar BOOLEAN
        block_dns BOOLEAN
        block_gov BOOLEAN
        cdn_ns TEXT[]
        updated_at TIMESTAMP
    }
    
    domain_redirect_history {
        id SERIAL PK
        cdn_account_id INTEGER FK
        active_domain_id INTEGER FK
        blocked_domain_id INTEGER FK
        created_at TIMESTAMP
    }
    
    domain_checks {
        check_id SERIAL PK
        domain_id BIGINT FK
        keyword_id BIGINT FK
        position INT
        language VARCHAR(10)
        check_datetime TIMESTAMP
        created_at TIMESTAMP
    }
    
    domain_checks_proxy {
        check_id SERIAL PK
        domain_id BIGINT
        keyword_id BIGINT
        position INT
        language VARCHAR(10)
        check_datetime TIMESTAMP
        created_at TIMESTAMP
    }
