import jwt as pyjwt
from fastapi import Depends, HTTPException, status

from .rbac import extract_token
from .security import decode_jwt


async def get_current_user(token: str = Depends(extract_token)) -> dict:
    """Декодированный payload JWT текущего пользователя (sub, preferred_username, ...)."""
    try:
        return decode_jwt(token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc


async def get_current_roles(token: str = Depends(extract_token)) -> set[str]:
    """Множество ролей текущего пользователя (пустое, если ролей нет)."""
    user = await get_current_user(token)
    return set(user.get("realm_access", {}).get("roles", []))
