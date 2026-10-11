# app/routers/__init__.py
from .admin import router as admin_router
from .candidate import router as candidate_router
from .employer import router as employer_router

__all__ = ["candidate_router", "employer_router", "admin_router"]
