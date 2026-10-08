from collections.abc import Iterable

import jwt as pyjwt
from fastapi import Depends, Header, HTTPException, status

from .security import get_user_roles


def extract_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header",
        )
    return parts[1]


def require_roles(required_roles: Iterable[str]):
    """Зависимость: у пользователя должна быть хотя бы одна из ролей.
    Доступные роли (из realm.json Keycloak):
        - admins      (Администраторы)
        - employers   (Работодатели)
        - candidats   (Кандидаты)
    Usage::
        @router.get("/admin")
        def admin_endpoint(roles: Set[str] = Depends(require_roles(["admins"]))):
            ...
        @router.get("/candidate")
        def candidate_endpoint(roles: Set[str] = Depends(require_roles(["candidats"]))):
            ...
        @router.get("/mixed")
        def mixed_endpoint(roles: Set[str] = Depends(require_roles(["admins", "employers"]))):
            ...
    """
    required = set(required_roles)

    async def dependency(token: str = Depends(extract_token)) -> set[str]:
        try:
            user_roles = get_user_roles(token)
        except pyjwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {exc}",
            ) from exc

        if not user_roles & required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user_roles

    return dependency
