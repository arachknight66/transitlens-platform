"""HTTP-only clients for TransitLens upstream services."""

import asyncio
from typing import Any, BinaryIO

import httpx
from pydantic import ValidationError

from .config import GatewaySettings
from .errors import GatewayError, upstream_error
from .models import DownloadResponse, UpstreamUploadResponse


class UpstreamClients:
    def __init__(self, settings: GatewaySettings, transport: httpx.AsyncBaseTransport | None = None) -> None:
        timeout = httpx.Timeout(settings.request_timeout_seconds, connect=settings.connect_timeout_seconds)
        self.http = httpx.AsyncClient(timeout=timeout, transport=transport)

    async def close(self) -> None:
        await self.http.aclose()

    async def request(
        self, service: str, method: str, base_url: str, path: str, *, retry: bool = False, **kwargs: Any,
    ) -> httpx.Response:
        attempts = 2 if retry else 1
        for attempt in range(attempts):
            try:
                response = await self.http.request(method, f"{base_url.rstrip('/')}{path}", **kwargs)
                response.raise_for_status()
                return response
            except httpx.HTTPError as exc:
                if attempt + 1 < attempts and isinstance(exc, (httpx.ConnectError, httpx.TimeoutException)):
                    await asyncio.sleep(0.1)
                    continue
                raise upstream_error(service, exc) from exc
        raise AssertionError("request attempts exhausted")

    async def pipeline_json(self, method: str, base_url: str, path: str, **kwargs: Any) -> Any:
        response = await self.request("pipeline", method, base_url, path, retry=method == "GET", **kwargs)
        try:
            return response.json()
        except ValueError as exc:
            raise GatewayError(502, "invalid_response", "Data pipeline returned an invalid response.") from exc

    async def ml_json(self, method: str, base_url: str, path: str, **kwargs: Any) -> Any:
        response = await self.request("ml", method, base_url, path, retry=method == "GET", **kwargs)
        try:
            return response.json()
        except ValueError as exc:
            raise GatewayError(502, "invalid_response", "ML service returned an invalid response.") from exc

    async def download(self, base_url: str, mast_id: str, token: str | None) -> DownloadResponse:
        payload = await self.pipeline_json(
            "POST", base_url, "/download", json={"mast_id": mast_id}, headers=_auth(token),
        )
        return _validate(DownloadResponse, payload, "Data pipeline returned an invalid download response.")

    async def upload(self, base_url: str, filename: str, content: BinaryIO, content_type: str, token: str | None) -> UpstreamUploadResponse:
        response = await self.request(
            "pipeline", "POST", base_url, "/upload",
            files={"file": (filename, content, content_type)}, headers=_auth(token),
        )
        try:
            return _validate(UpstreamUploadResponse, response.json(), "Data pipeline returned an invalid upload response.")
        except ValueError as exc:
            raise GatewayError(502, "invalid_response", "Data pipeline returned an invalid upload response.") from exc


def _auth(token: str | None) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"} if token else {}


def _validate(model: type[Any], payload: Any, message: str) -> Any:
    try:
        return model.model_validate(payload)
    except ValidationError as exc:
        raise GatewayError(502, "invalid_response", message) from exc
