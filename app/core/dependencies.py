# app/core/dependencies.py
"""Зависимости для проверки ролей и получения user_sub."""

from fastapi import HTTPException, Request, status


def get_user_sub(request: Request) -> str:
    """Получает user_sub из request.state."""
    user_sub = getattr(request.state, "user_sub", None)
    if not user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user_sub


def get_user_roles(request: Request) -> set[str]:
    """Получает роли пользователя из request.state."""
    return getattr(request.state, "user_roles", set())


def require_role(role: str):
    """Зависимость: у пользователя должна быть указанная роль."""

    def dependency(request: Request) -> None:
        user_roles = getattr(request.state, "user_roles", set())
        if role not in user_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Требуется роль: {role}",
            )

    return dependency


def require_any_role(roles: list[str]):
    """Зависимость: у пользователя должна быть хотя бы одна из ролей."""

    def dependency(request: Request) -> None:
        user_roles = getattr(request.state, "user_roles", set())
        if not user_roles & set(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Требуется одна из ролей: {', '.join(roles)}",
            )

    return dependency
