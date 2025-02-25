from fastapi import APIRouter

from app.api.endpoints.brands import router as brands_router
from app.api.endpoints.cdn_accounts import router as cdn_accounts_router
from app.api.endpoints.settings import router as settings_router
from app.api.endpoints.templates import router as templates_router
from app.api.endpoints.keywords import router as keywords_router
from app.api.endpoints.domain_checks import router as domain_checks_router
from app.api.endpoints.users import router as users_router
from app.api.endpoints.registrars import router as registrars_router
from app.api.endpoints.sites import router as sites_router
from app.api.endpoints.domain_status import router as domain_status_router
from app.api.endpoints.domain_redirect_history import router as domain_redirect_history_router
from app.api.endpoints.domains import router as domains_router

router = APIRouter()

router.include_router(brands_router, prefix='/api', tags=['brands'])
router.include_router(cdn_accounts_router, prefix='/api', tags=['cdn_accounts'])
router.include_router(settings_router, prefix='/api', tags=['settings'])
router.include_router(templates_router, prefix='/api', tags=['templates'])
router.include_router(keywords_router, prefix='/api', tags=['keywords'])
router.include_router(domain_checks_router, prefix='/api', tags=['domain_checks'])
router.include_router(users_router, prefix='/api', tags=['users'])
router.include_router(registrars_router, prefix='/api', tags=['registrars'])
router.include_router(sites_router, prefix='/api', tags=['sites'])
router.include_router(domain_status_router, prefix='/api', tags=['domain_status'])
router.include_router(domain_redirect_history_router, prefix='/api', tags=['domain_redirect_history'])
router.include_router(domains_router, prefix='/api', tags=['domains'])
