from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://admin:password@localhost:5432/csh_db"
    redis_url: str = "redis://localhost:6379/0"

    keycloak_realm_url: str | None = None
    keycloak_client_id: str | None = None


settings = Settings()
