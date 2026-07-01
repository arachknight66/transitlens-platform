"""FastAPI application factory."""

import json
import logging
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .clients import UpstreamClients
from .config import GatewaySettings
from .errors import register_error_handlers
from .routes import router
from .sessions import SessionStore
from .store import GatewayStore


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps({"timestamp": time.time(), "level": record.levelname, "message": record.getMessage()})


def create_app(settings: GatewaySettings | None = None, *, clients: UpstreamClients | None = None) -> FastAPI:
    config = settings or GatewaySettings()
    owned_clients = clients is None
    upstream = clients or UpstreamClients(config)
    gateway_logger = logging.getLogger("transitlens.gateway")
    if not gateway_logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        gateway_logger.addHandler(handler)
        gateway_logger.setLevel(logging.INFO)
        gateway_logger.propagate = False

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        yield
        if owned_clients:
            await upstream.close()

    app = FastAPI(
        title="TransitLens Platform Gateway", version=__version__,
        description="Orchestration gateway for TransitLens Data Pipeline and ML Core. No scientific processing is performed here.",
        lifespan=lifespan,
    )
    app.state.settings = config
    app.state.clients = upstream
    app.state.sessions = SessionStore(config)
    app.state.store = GatewayStore()
    app.add_middleware(
        CORSMiddleware, allow_origins=config.cors_origins, allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "OPTIONS"], allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    @app.middleware("http")
    async def request_context(request: Request, call_next):
        request.state.request_id = request.headers.get("X-Request-ID", str(uuid4()))[:128]
        started = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        logging.getLogger("transitlens.gateway").info(
            "request_complete", extra={"path": request.url.path, "status": response.status_code, "duration_ms": round((time.perf_counter() - started) * 1000, 2)},
        )
        return response

    register_error_handlers(app)
    app.include_router(router)
    return app


app = create_app()
