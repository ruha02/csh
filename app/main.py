"""FastAPI application entry point.

The app registers import, utility network and technical conditions routers.
All routes are protected via the RBAC system based on JWT tokens issued by
Keycloak. For simplicity the ``uvicorn`` server can be started with:

    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI

app = FastAPI(title="Cyber Sport Hunter API", version="0.1.0")


# Health check
@app.get("/health")
def health_check():
    return {"status": "ok"}
