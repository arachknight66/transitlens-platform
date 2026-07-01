"""Bounded ephemeral server-side session configuration."""

import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from urllib.parse import urlsplit, urlunsplit

from fastapi import Request, Response

from .config import GatewaySettings
from .errors import GatewayError
from .models import SessionSettingsRequest, SessionSettingsResponse

COOKIE_NAME = "transitlens_session"


@dataclass(slots=True)
class SessionData:
    pipeline_url: str
    ml_core_url: str
    mast_api_token: str | None
    expires_at: datetime


def safe_service_url(value: str) -> str:
    parts = urlsplit(value)
    if parts.scheme not in {"http", "https"} or not parts.hostname or parts.username or parts.password:
        raise GatewayError(422, "invalid_service_url", "Service URLs must be credential-free HTTP(S) URLs.")
    if parts.query or parts.fragment:
        raise GatewayError(422, "invalid_service_url", "Service URLs cannot contain query strings or fragments.")
    return urlunsplit((parts.scheme, parts.netloc, parts.path.rstrip("/"), "", ""))


class SessionStore:
    def __init__(self, settings: GatewaySettings) -> None:
        self.settings = settings
        self._sessions: dict[str, SessionData] = {}

    def resolve(self, request: Request, response: Response) -> tuple[str, SessionData]:
        self._purge()
        session_id = request.cookies.get(COOKIE_NAME)
        data = self._sessions.get(session_id or "")
        if data is None:
            session_id = secrets.token_urlsafe(32)
            data = self._default()
            self._sessions[session_id] = data
            response.set_cookie(
                COOKIE_NAME, session_id, httponly=True, secure=self.settings.session_cookie_secure,
                samesite="strict", max_age=self.settings.session_ttl_seconds, path="/api",
            )
        return session_id, data

    def update(self, session_id: str, payload: SessionSettingsRequest) -> SessionData:
        current = self._sessions.get(session_id, self._default())
        current.pipeline_url = safe_service_url(str(payload.pipeline_url)) if payload.pipeline_url else current.pipeline_url
        current.ml_core_url = safe_service_url(str(payload.ml_core_url)) if payload.ml_core_url else current.ml_core_url
        current.mast_api_token = payload.mast_api_token
        current.expires_at = self._expiry()
        self._sessions[session_id] = current
        return current

    @staticmethod
    def public(data: SessionData) -> SessionSettingsResponse:
        return SessionSettingsResponse(
            pipeline_url=data.pipeline_url, ml_core_url=data.ml_core_url,
            has_mast_token=data.mast_api_token is not None, expires_at=data.expires_at,
        )

    def _default(self) -> SessionData:
        return SessionData(
            pipeline_url=safe_service_url(str(self.settings.pipeline_url)),
            ml_core_url=safe_service_url(str(self.settings.ml_core_url)),
            mast_api_token=None, expires_at=self._expiry(),
        )

    def _expiry(self) -> datetime:
        return datetime.now(UTC) + timedelta(seconds=self.settings.session_ttl_seconds)

    def _purge(self) -> None:
        now = datetime.now(UTC)
        self._sessions = {key: value for key, value in self._sessions.items() if value.expires_at > now}

