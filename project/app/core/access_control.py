ACCESS_CONTROL = {
    "users": {
        "admin": ["create", "read", "update", "delete"],
        "editor": [],
        "user": []
    },
    "brands": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["create", "read", "update"],
        "user": ["read"]
    },
    "cdnaccounts": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["create", "read", "update", "delete"],
        "user": []
    },
    "cdn_domain_details": {
        "admin": ["read"],
        "editor": ["read"],
        "user": ["read"]
    },
    "domain_checks_proxy": {
        "admin": [],
        "editor": [],
        "user": []
    },
    "domain_checks": {
        "admin": ["read"],
        "editor": ["read"],
        "user": ["read"]
    },
    "domain_monitoring_log": {
        "admin": ["read"],
        "editor": ["read"],
        "user": ["read"]
    },
    "domains": {
        "admin": ["read"],
        "editor": ["read"],
        "user": ["read"]
    },
    "keywords": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["create", "read", "update"],
        "user": ["read"]
    },
    "logs": {
        "admin": ["read"],
        "editor": [],
        "user": []
    },
    "registrars": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["create", "read", "update"],
        "user": ["read"]
    },
    "registration_requests": {
        "admin": ["read", "update", "delete"],
        "editor": ["read"],
        "user": []
    },
    "schema_versions": {
        "admin": ["read"],
        "editor": [],
        "user": []
    },
    "settings": {
        "admin": ["create", "read", "update", "delete"],
        "editor": [],
        "user": []
    },
    "templates": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["create", "read", "update"],
        "user": ["read"]
    },
    "blocked_numbers": {
        "admin": ["create", "read", "update", "delete"],
        "editor": [],
        "user": []
    },
    "blocked_domain_log": {
        "admin": ["create", "read", "update", "delete"],
        "editor": ["read"],
        "user": []
    }
}

from fastapi import HTTPException, status
from app.core.models.users import Users  # Импортируем модель пользователей

# Проверка доступа на основе роли пользователя
def check_access(resource: str, action: str, current_user: Users):
    """
    Проверяет, есть ли у пользователя право на выполнение действия (action) на данном ресурсе (resource).
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authenticated"
        )

    user_role = current_user.role  # Получаем роль пользователя

    if resource not in ACCESS_CONTROL:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{resource}' not found in access control list"
        )

    allowed_actions = ACCESS_CONTROL[resource].get(user_role, [])

    if action not in allowed_actions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{user_role}' has no permission for '{action}' on '{resource}'"
        )

