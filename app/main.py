"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from core.auth_middleware import AuthMiddleware

app = FastAPI(
    title="Cyber Sport Hunter API",
    version="0.1.0",
    description="API для платформы Cyber Sport Hunter",
)

# Добавляем middleware для автоматической авторизации
app.add_middleware(AuthMiddleware)

# CORS для разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://web.localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Настраиваем OpenAPI схему с security scheme для Swagger UI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Добавляем security scheme для Bearer JWT
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT токен из Keycloak. Получите его через POST /realms/csh/protocol/openid-connect/token",
        }
    }

    # Применяем security ко всем endpoints (кроме публичных)
    for path, methods in openapi_schema["paths"].items():
        if path not in ["/health", "/docs", "/openapi.json", "/redoc"]:
            for method in methods.values():
                if isinstance(method, dict) and "security" not in method:
                    method["security"] = [{"bearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# Health check (без авторизации)
@app.get("/health", tags=["technical"])
def health_check():
    return {"status": "ok"}


# Импорт роутеров
from routers import admin_router, candidate_router, employer_router

app.include_router(candidate_router, prefix="/api", tags=["candidate"])
app.include_router(employer_router, prefix="/api", tags=["employer"])
app.include_router(admin_router, prefix="/api", tags=["admin"])
