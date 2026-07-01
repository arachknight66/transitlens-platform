"""Stable gateway errors and FastAPI handlers."""

import logging
from typing import Any

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("transitlens.gateway")


class GatewayError(Exception):
    def __init__(self, status_code: int, code: str, detail: str, *, context: Any = None) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.code = code
        self.detail = detail
        self.context = context


def upstream_error(service: str, exc: httpx.HTTPError) -> GatewayError:
    label = "Data pipeline" if service == "pipeline" else "ML service"
    if isinstance(exc, httpx.TimeoutException):
        return GatewayError(504, "upstream_timeout", f"{label} timed out. Please try again.")
    if isinstance(exc, httpx.ConnectError):
        code = "pipeline_unavailable" if service == "pipeline" else "ml_service_unavailable"
        return GatewayError(503, code, f"{label} is currently unavailable.")
    if isinstance(exc, httpx.HTTPStatusError):
        status = exc.response.status_code
        if status in (401, 403):
            return GatewayError(401, "authentication_failed", "Authentication was rejected by the upstream service.")
        if status == 404:
            return GatewayError(404, "upstream_not_found", f"{label} could not find the requested resource.")
        if status == 422:
            return GatewayError(422, "upstream_validation_failed", f"{label} rejected the request.")
        return GatewayError(502, "upstream_failure", f"{label} returned an unexpected error.")
    return GatewayError(502, "network_failure", f"Communication with {label.lower()} failed.")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(GatewayError)
    async def handle_gateway_error(request: Request, exc: GatewayError) -> JSONResponse:
        logger.warning("gateway_error", extra={"code": exc.code, "path": request.url.path})
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "detail": exc.detail, "request_id": getattr(request.state, "request_id", None)},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"code": "invalid_request", "detail": "The request is invalid.", "errors": exc.errors(), "request_id": getattr(request.state, "request_id", None)},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_gateway_error", extra={"path": request.url.path})
        return JSONResponse(
            status_code=500,
            content={"code": "internal_error", "detail": "The gateway could not complete the request.", "request_id": getattr(request.state, "request_id", None)},
        )

