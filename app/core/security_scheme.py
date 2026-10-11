"""Security schemes for OpenAPI/Swagger documentation."""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Схема Bearer токена для Swagger UI
bearer_scheme = HTTPBearer(
    scheme_name="JWT Bearer",
    description="Введите JWT токен из Keycloak (без префикса 'Bearer ')",
    auto_error=True,
)


def get_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Извлекает токен из заголовка Authorization: Bearer <token>."""
    return credentials.credentials
