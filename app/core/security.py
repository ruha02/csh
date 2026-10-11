import time

import jwt
import jwt as pyjwt
import requests
from fastapi import Depends, HTTPException, status

from .config import settings

_JWKS_TTL_SECONDS = 300
_jwks_cache: dict = {"keys": None, "fetched_at": 0.0}


def _realm_url() -> str | None:
    return (
        settings.keycloak_realm_url.rstrip("/")
        if settings.keycloak_realm_url
        else None
    )


def _fetch_jwks() -> dict:
    realm_url = _realm_url()
    if not realm_url:
        raise RuntimeError("KEYCLOAK_REALM_URL is not configured")

    now = time.monotonic()
    if (
        _jwks_cache["keys"] is not None
        and now - _jwks_cache["fetched_at"] < _JWKS_TTL_SECONDS
    ):
        return _jwks_cache["keys"]

    resp = requests.get(f"{realm_url}/protocol/openid-connect/certs", timeout=5)
    resp.raise_for_status()
    _jwks_cache["keys"] = resp.json()
    _jwks_cache["fetched_at"] = now
    return _jwks_cache["keys"]


def _get_public_key(kid: str):
    jwks = _fetch_jwks()
    for key in jwks["keys"]:
        if key.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    # ключ мог ротироваться – сбрасываем кеш и пробуем ещё раз
    _jwks_cache["keys"] = None
    jwks = _fetch_jwks()
    for key in jwks["keys"]:
        if key.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    raise RuntimeError(f"Unable to find public key for kid={kid}")


def decode_jwt(token: str) -> dict:
    """Декодирует и проверяет JWT через публичный ключ Keycloak."""
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise jwt.InvalidTokenError("Missing 'kid' in token header")

    public_key = _get_public_key(kid)
    return jwt.decode(
        token,
        key=public_key,
        algorithms=[header.get("alg", "RS256")],
        issuer=_realm_url(),
        audience=settings.keycloak_client_id,
        options={"verify_aud": False},
    )


def get_user_roles(token: str) -> set[str]:
    """Роли из claim `realm_access.roles` (Keycloak realm roles)."""
    payload = decode_jwt(token)
    return set(payload.get("realm_access", {}).get("roles", []))


