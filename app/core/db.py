import os

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://admin:password@localhost:5432/csh_db"
)

# Синхронный engine – нужен Alembic и некоторые скрипты CLI
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Асинхронный engine – для FastAPI эндпоинтов
async_engine = create_async_engine(
    DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://"),
    echo=False,
    future=True,
)
AsyncSessionLocal = sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
)


def get_sync_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_async_session():
    async def _generator():
        async with AsyncSessionLocal() as session:
            yield session

    return _generator()
