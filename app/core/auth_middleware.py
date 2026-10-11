# app/core/auth_middleware.py
"""Middleware для автоматической инъекции user_sub и ролей в request.state."""

import jwt
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class AuthMiddleware(BaseHTTPMiddleware):
    """Автоматически извлекает user_sub и роли из JWT."""

    PUBLIC_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)

        authorization = request.headers.get("authorization")
        if not authorization:
            return Response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content='{"detail": "Missing Authorization header"}',
                media_type="application/json",
            )

        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return Response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content='{"detail": "Invalid Authorization header"}',
                media_type="application/json",
            )

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=["RS256", "HS256"],
            )
        except Exception as exc:
            return Response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content=f'{{"detail": "Invalid token: {exc}"}}',
                media_type="application/json",
            )

        user_sub = payload.get("sub")
        if not user_sub:
            return Response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content='{"detail": "Token missing \'sub\' claim"}',
                media_type="application/json",
            )

        # Сохраняем в request.state
        request.state.user_sub = user_sub

        # Извлекаем роли из realm_access.roles
        realm_access = payload.get("realm_access", {})
        roles = realm_access.get("roles", [])
        request.state.user_roles = set(roles)

        return await call_next(request)
