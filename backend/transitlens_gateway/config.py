"""Gateway environment configuration."""

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class GatewaySettings(BaseSettings):
    """Validated process-level defaults and safety limits."""

    model_config = SettingsConfigDict(env_prefix="TRANSITLENS_", extra="ignore")

    pipeline_url: AnyHttpUrl = "http://localhost:8001"
    ml_core_url: AnyHttpUrl = "http://localhost:8002"
    request_timeout_seconds: float = Field(default=30.0, gt=0, le=300)
    connect_timeout_seconds: float = Field(default=5.0, gt=0, le=60)
    max_upload_bytes: int = Field(default=250 * 1024 * 1024, gt=0)
    session_ttl_seconds: int = Field(default=8 * 60 * 60, ge=300, le=7 * 24 * 60 * 60)
    allowed_origins: str = "http://localhost:5173"
    session_cookie_secure: bool = False

    @property
    def cors_origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

