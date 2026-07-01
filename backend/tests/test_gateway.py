from __future__ import annotations

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from transitlens_gateway.app import create_app
from transitlens_gateway.clients import UpstreamClients
from transitlens_gateway.config import GatewaySettings


PROCESSED = {
    "file_id": "opaque-1",
    "time": [1.0, 2.0], "flux": [1.0, 0.9], "normalized_flux": [1.0, 0.9],
    "median_filtered_flux": [1.0, 0.95], "wavelet_flux": [1.0, 0.92], "quality": [0, 0],
    "metadata": {"pipeline_version": "2.0", "schema_version": "1", "input_samples": 2},
    "features": {"signal_to_noise_ratio": 8.4, "observation_duration": 1.0, "cadence": 0.5},
}


def upstream(request: httpx.Request) -> httpx.Response:
    path = request.url.path
    if path == "/status":
        body = {"status": "ok", "version": "2.0", "supported_missions": ["TESS"]}
    elif path == "/health":
        body = {"status": "healthy", "model_loaded": True, "model_version": "ml-1"}
    elif path == "/model":
        body = {
            "model_version": "ml-1",
            "architecture": "BaselineCNN",
            "training_timestamp": None,
            "supported_input_schema": {"time": "array"},
        }
    elif path == "/search":
        body = [{"mast_id": "42", "observation_id": "obs", "target_name": "TIC 42", "mission": "TESS", "product_type": "LC", "start_time": 1, "end_time": 2}]
    elif path == "/download":
        body = {"mast_id": "42", "product_filename": "light.fits", "data_uri": "mast:x", "path": "cache/light.fits", "from_cache": False}
    elif path == "/upload":
        body = {"file_id": "opaque-1", "media_type": "fits", "size_bytes": 8}
    elif path == "/process":
        assert json.loads(request.content)["file_id"] in {"opaque-1", "pipeline-file-42", "opaque"}
        body = PROCESSED
    elif path == "/predict":
        request_payload = json.loads(request.content)
        assert set(request_payload) == {"time", "normalized_flux", "wavelet_flux", "metadata"}
        body = {
            "prediction": 1,
            "probability": 0.92,
            "confidence": 0.84,
            "transit_depth": 120.0,
            "transit_duration": 2.5,
            "estimated_period": 3.1,
            "signal_to_noise_ratio": 8.4,
            "model_version": "ml-1",
            "inference_time": 12.5,
        }
    else:
        return httpx.Response(404, json={"detail": "missing"})
    return httpx.Response(200, json=body)


@pytest.fixture
def client() -> TestClient:
    settings = GatewaySettings(pipeline_url="http://pipeline", ml_core_url="http://ml")
    clients = UpstreamClients(settings, transport=httpx.MockTransport(upstream))
    with TestClient(create_app(settings, clients=clients)) as test_client:
        yield test_client


def test_openapi_contains_all_public_gateway_routes(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]
    required = {"/api/dashboard/summary", "/api/search", "/api/download", "/api/upload", "/api/process", "/api/analyses/{analysis_id}", "/api/analyses/{analysis_id}/prediction", "/api/analyses/{analysis_id}/results", "/api/analyses/{analysis_id}/reports"}
    assert required <= paths.keys()


def test_gateway_health(client: TestClient) -> None:
    assert client.get("/health").json() == {
        "status": "ok",
        "service": "transitlens-platform-gateway",
    }


def test_search_download_upload_process_predict_results_and_reports(client: TestClient) -> None:
    assert client.get("/api/search", params={"target": "TIC 42"}).status_code == 200
    assert client.post("/api/download", json={"mast_id": "42"}).status_code == 200
    uploaded = client.post("/api/upload", files={"file": ("local.fits", b"FITSdata", "application/fits")})
    assert uploaded.status_code == 200
    analysis_id = uploaded.json()["analysis_id"]
    assert client.get(f"/api/analyses/{analysis_id}").json()["status"] == "processed"
    prediction = client.post(f"/api/analyses/{analysis_id}/prediction")
    assert prediction.json()["model_version"] == "ml-1"
    results = client.get(f"/api/analyses/{analysis_id}/results").json()
    assert results["metrics"]["transit_depth"] == {
        "value": 120.0,
        "unit": "ppm",
        "source": "transitlens-ml-core",
    }
    for format_name, content_type in (("json", "application/json"), ("csv", "text/csv"), ("pdf", "application/pdf")):
        report = client.post(f"/api/analyses/{analysis_id}/reports", json={"format": format_name})
        assert report.status_code == 200
        assert content_type in report.headers["content-type"]
        assert report.content


def test_process_route_accepts_opaque_reference(client: TestClient) -> None:
    response = client.post("/api/process", json={"source_reference": "pipeline-file-42", "filename": "light.fits"})
    assert response.status_code == 200
    assert response.json()["source"]["filename"] == "light.fits"


def test_dashboard_uses_real_ml_health_and_model_routes(client: TestClient) -> None:
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["modelVersion"] == "ml-1"
    assert {service["id"]: service["state"] for service in payload["services"]} == {
        "pipeline": "operational",
        "ml-core": "operational",
    }


def test_invalid_upload_has_stable_friendly_error(client: TestClient) -> None:
    response = client.post("/api/upload", files={"file": ("notes.txt", b"bad", "text/plain")})
    assert response.status_code == 422
    assert response.json()["code"] == "invalid_upload"


def test_report_requires_prediction(client: TestClient) -> None:
    analysis_id = client.post("/api/process", json={"source_reference": "opaque"}).json()["analysis_id"]
    response = client.post(f"/api/analyses/{analysis_id}/reports", json={"format": "json"})
    assert response.status_code == 409
    assert response.json()["code"] == "prediction_required"


def test_session_never_returns_token(client: TestClient) -> None:
    response = client.put("/api/settings/session", json={"mast_api_token": "secret", "pipeline_url": "http://pipeline", "ml_core_url": "http://ml"})
    assert response.status_code == 200
    assert response.json()["has_mast_token"] is True
    assert "secret" not in json.dumps(response.json())


def test_unavailable_pipeline_is_translated() -> None:
    def fail(_: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("offline")
    settings = GatewaySettings(pipeline_url="http://pipeline")
    clients = UpstreamClients(settings, transport=httpx.MockTransport(fail))
    with TestClient(create_app(settings, clients=clients), raise_server_exceptions=False) as client:
        response = client.get("/api/search", params={"target": "x"})
    assert response.status_code == 503
    assert response.json()["code"] == "pipeline_unavailable"


@pytest.mark.parametrize(
    ("failure", "expected_status", "expected_code"),
    [
        (httpx.ReadTimeout("slow"), 504, "upstream_timeout"),
        (httpx.ConnectError("offline"), 503, "ml_service_unavailable"),
    ],
)
def test_ml_network_failures_are_translated(failure: httpx.HTTPError, expected_status: int, expected_code: str) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/process":
            return httpx.Response(200, json=PROCESSED)
        if request.url.path == "/predict":
            raise failure
        return httpx.Response(200, json={"status": "ok"})
    settings = GatewaySettings(pipeline_url="http://pipeline", ml_core_url="http://ml")
    clients = UpstreamClients(settings, transport=httpx.MockTransport(handler))
    with TestClient(create_app(settings, clients=clients), raise_server_exceptions=False) as client:
        analysis_id = client.post("/api/process", json={"source_reference": "opaque"}).json()["analysis_id"]
        response = client.post(f"/api/analyses/{analysis_id}/prediction")
    assert response.status_code == expected_status
    assert response.json()["code"] == expected_code


def test_authentication_failure_is_translated() -> None:
    transport = httpx.MockTransport(lambda _: httpx.Response(401, json={"detail": "bad token"}))
    settings = GatewaySettings(pipeline_url="http://pipeline")
    with TestClient(create_app(settings, clients=UpstreamClients(settings, transport=transport)), raise_server_exceptions=False) as client:
        response = client.get("/api/search", params={"target": "x"})
    assert response.status_code == 401
    assert response.json()["code"] == "authentication_failed"


def test_malformed_search_response_is_rejected() -> None:
    transport = httpx.MockTransport(lambda _: httpx.Response(200, json={"not": "a list"}))
    settings = GatewaySettings(pipeline_url="http://pipeline")
    with TestClient(create_app(settings, clients=UpstreamClients(settings, transport=transport)), raise_server_exceptions=False) as client:
        response = client.get("/api/search", params={"target": "x"})
    assert response.status_code == 502
    assert response.json()["code"] == "invalid_response"
