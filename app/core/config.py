from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://admin:password@localhost:5432/csh_db"
    redis_url: str = "redis://localhost:6379/0"
    keycloak_realm_url: str = "http://kc.localhost:8081/realms/csh"
    keycloak_realm: str = "csh"
    keycloak_client_id: str = "api"

    class Config:
        env_file = ".env"


settings = Settings()
