"""Platform gateway HTTP routes."""

from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Query, Request, Response, UploadFile
from fastapi.responses import Response as BinaryResponse
from pydantic import ValidationError

from .errors import GatewayError
from .models import (
    AnalysisSource, DownloadRequest, DownloadResponse, Observation, PredictionResult, ProcessedAnalysis,
    ProcessRequest, ReportRequest, SessionSettingsRequest, SessionSettingsResponse, UploadReceipt,
)
from .reports import report_document, serialize_report
from .sessions import SessionData

router = APIRouter(prefix="/api")


def context(request: Request, response: Response) -> tuple[str, SessionData]:
    return request.app.state.sessions.resolve(request, response)


@router.get("/settings/session", response_model=SessionSettingsResponse)
def get_session_settings(session: Annotated[tuple[str, SessionData], Depends(context)]) -> SessionSettingsResponse:
    return SessionSettingsResponse(
        pipeline_url=session[1].pipeline_url, ml_core_url=session[1].ml_core_url,
        has_mast_token=session[1].mast_api_token is not None, expires_at=session[1].expires_at,
    )


@router.put("/settings/session", response_model=SessionSettingsResponse)
def update_session_settings(
    payload: SessionSettingsRequest, request: Request,
    session: Annotated[tuple[str, SessionData], Depends(context)],
) -> SessionSettingsResponse:
    return request.app.state.sessions.public(request.app.state.sessions.update(session[0], payload))


@router.get("/search", response_model=list[Observation])
async def search(
    request: Request, response: Response, target: Annotated[str, Query(min_length=1)],
    missions: Annotated[list[str] | None, Query()] = None,
    radius_deg: Annotated[float, Query(gt=0, le=5)] = 0.001,
    limit: Annotated[int, Query(ge=1, le=1000)] = 100,
) -> list[Observation]:
    _, session = context(request, response)
    params: list[tuple[str, str]] = [("target", target), ("radius_deg", str(radius_deg)), ("limit", str(limit))]
    params.extend(("missions", mission) for mission in missions or [])
    payload = await request.app.state.clients.pipeline_json(
        "GET", session.pipeline_url, "/search", params=params,
        headers={"Authorization": f"Bearer {session.mast_api_token}"} if session.mast_api_token else {},
    )
    try:
        return [Observation.model_validate(item) for item in payload]
    except (ValidationError, TypeError) as exc:
        raise GatewayError(502, "invalid_response", "Data pipeline returned invalid search results.") from exc


@router.post("/download", response_model=DownloadResponse)
async def download(
    payload: DownloadRequest, request: Request, response: Response,
) -> DownloadResponse:
    _, session = context(request, response)
    result = await request.app.state.clients.download(session.pipeline_url, payload.mast_id, session.mast_api_token)
    request.app.state.store.remember_download({
        "id": payload.mast_id, "filename": result.product_filename, "target": payload.mast_id,
        "sizeBytes": 0,
    })
    return result


async def _upload(file: UploadFile, request: Request, response: Response) -> UploadReceipt:
    _, session = context(request, response)
    filename = Path(file.filename or "").name
    suffix = Path(filename).suffix.lower()
    if suffix not in {".fits", ".fit", ".csv"}:
        raise GatewayError(422, "invalid_upload", "Upload a FITS, FIT, or CSV file.")
    size = 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > request.app.state.settings.max_upload_bytes:
            raise GatewayError(413, "upload_too_large", "The uploaded file exceeds the 250 MB limit.")
    if size == 0:
        raise GatewayError(422, "invalid_upload", "The uploaded file is empty.")
    await file.seek(0)
    uploaded = await request.app.state.clients.upload(
        session.pipeline_url, filename, file.file, file.content_type or "application/octet-stream", session.mast_api_token,
    )
    analysis = await _process_reference(
        ProcessRequest(source_reference=uploaded.file_id, filename=filename), request, session,
    )
    display_format = "csv" if uploaded.media_type == "csv" else "fits"
    return UploadReceipt(
        upload_id=uploaded.file_id, analysis_id=analysis.analysis_id, filename=filename,
        format=display_format, size_bytes=uploaded.size_bytes, status="processed",
    )


@router.post("/upload", response_model=UploadReceipt)
async def upload(file: Annotated[UploadFile, File()], request: Request, response: Response) -> UploadReceipt:
    return await _upload(file, request, response)


@router.post("/uploads", response_model=UploadReceipt, include_in_schema=False)
async def uploads_compat(file: Annotated[UploadFile, File()], request: Request, response: Response) -> UploadReceipt:
    return await _upload(file, request, response)


async def _process_reference(payload: ProcessRequest, request: Request, session: SessionData) -> ProcessedAnalysis:
    upstream = await request.app.state.clients.pipeline_json(
        "POST", session.pipeline_url, "/process",
        json={"file_id": payload.source_reference, "mission": payload.mission},
    )
    analysis_id = f"analysis-{uuid4().hex}"
    try:
        analysis = ProcessedAnalysis.model_validate({
            **upstream, "analysis_id": analysis_id, "status": "processed",
            "source": {"filename": payload.filename or payload.source_reference, "target": payload.target, "mission": payload.mission},
        })
    except (ValidationError, TypeError) as exc:
        raise GatewayError(502, "invalid_response", "Data pipeline returned invalid processed data.") from exc
    request.app.state.store.analyses[analysis_id] = analysis
    return analysis


@router.post("/process", response_model=ProcessedAnalysis)
async def process(payload: ProcessRequest, request: Request, response: Response) -> ProcessedAnalysis:
    _, session = context(request, response)
    return await _process_reference(payload, request, session)


def _analysis(request: Request, analysis_id: str) -> ProcessedAnalysis:
    analysis = request.app.state.store.analyses.get(analysis_id)
    if analysis is None:
        raise GatewayError(404, "analysis_not_found", "The requested analysis was not found.")
    return analysis


@router.get("/analyses/{analysis_id}", response_model=ProcessedAnalysis)
def get_analysis(analysis_id: str, request: Request) -> ProcessedAnalysis:
    return _analysis(request, analysis_id)


@router.post("/analyses/{analysis_id}/prediction", response_model=PredictionResult)
async def predict(analysis_id: str, request: Request, response: Response) -> PredictionResult:
    analysis = _analysis(request, analysis_id)
    _, session = context(request, response)
    metadata = {**analysis.metadata, "features": analysis.features}
    payload = await request.app.state.clients.ml_json(
        "POST", session.ml_core_url, "/predict",
        json={
            "time": analysis.time,
            "normalized_flux": analysis.normalized_flux,
            "wavelet_flux": analysis.wavelet_flux,
            "metadata": metadata,
        },
    )
    try:
        predicted_class = payload.get("predicted_class", payload.get("prediction"))
        prediction = PredictionResult.model_validate({
            "probability": payload.get("probability"),
            "confidence": payload.get("confidence"),
            "predicted_class": predicted_class,
            "transit_depth": payload.get("transit_depth"),
            "transit_duration": payload.get("transit_duration"),
            "estimated_period": payload.get("estimated_period"),
            "signal_to_noise_ratio": payload.get("signal_to_noise_ratio"),
            "model_version": payload.get("model_version"),
            "inference_time": payload.get("inference_time"),
            "prediction_id": payload.get("prediction_id", f"prediction-{uuid4().hex}"),
            "analysis_id": analysis_id, "created_at": payload.get("created_at", datetime.now(UTC)),
        })
    except (ValidationError, TypeError, AttributeError) as exc:
        raise GatewayError(502, "invalid_response", "ML service returned an invalid prediction.") from exc
    request.app.state.store.predictions[analysis_id] = prediction
    return prediction


def _metric(
    features: dict[str, Any], prediction: PredictionResult | None, key: str, unit: str,
) -> dict[str, Any]:
    statistics = features.get("statistics")
    value = statistics.get(key) if isinstance(statistics, dict) and key in statistics else features.get(key)
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return {"value": value, "unit": unit, "source": "transitlens-data-pipeline"}
    predicted_value = getattr(prediction, key, None) if prediction is not None else None
    if isinstance(predicted_value, (int, float)) and not isinstance(predicted_value, bool):
        return {"value": predicted_value, "unit": unit, "source": "transitlens-ml-core"}
    return {"value": None, "unit": unit, "source": "unavailable"}


@router.get("/analyses/{analysis_id}/results")
def results(analysis_id: str, request: Request) -> dict[str, Any]:
    analysis = _analysis(request, analysis_id)
    metadata, features = analysis.metadata, analysis.features
    source = metadata.get("source") if isinstance(metadata.get("source"), dict) else {}
    config = metadata.get("config") if isinstance(metadata.get("config"), dict) else {}
    feature_metadata = features.get("metadata") if isinstance(features.get("metadata"), dict) else {}
    statistics = features.get("statistics") if isinstance(features.get("statistics"), dict) else features
    prediction = request.app.state.store.predictions.get(analysis_id)
    return {
        "analysis_id": analysis_id, "generated_at": datetime.now(UTC).isoformat(),
        "metrics": {
            "transit_depth": _metric(features, prediction, "transit_depth", "ppm"),
            "transit_duration": _metric(features, prediction, "transit_duration", "hours"),
            "estimated_period": _metric(features, prediction, "estimated_period", "days"),
            "signal_to_noise_ratio": _metric(features, prediction, "signal_to_noise_ratio", "dimensionless"),
        },
        "observation": {
            "mission": analysis.source.mission or str(source.get("mission", feature_metadata.get("mission", "unknown"))),
            "target_name": analysis.source.target or source.get("target_name") or feature_metadata.get("target_name"),
            "observation_id": source.get("observation_id") or feature_metadata.get("observation_id"),
            "source_filename": analysis.source.filename, "flux_column": str(source.get("flux_column", feature_metadata.get("flux_column", "unknown"))),
            "quality_column": source.get("quality_column", feature_metadata.get("quality_column")),
            "observation_duration_days": float(statistics.get("observation_duration", 0)),
            "cadence_days": statistics.get("cadence"),
        },
        "processing": {
            "schema_version": str(feature_metadata.get("schema_version", metadata.get("schema_version", "unknown"))),
            "pipeline_version": str(feature_metadata.get("pipeline_version", metadata.get("pipeline_version", "unknown"))),
            "input_samples": int(metadata.get("input_samples", len(analysis.time))),
            "non_finite_removed": int(metadata.get("non_finite_removed", 0)),
            "quality_removed": int(metadata.get("quality_removed", 0)), "output_samples": len(analysis.time),
            "quality_bitmask": str(config.get("quality_bitmask", metadata.get("quality_bitmask", "unknown"))),
            "median_window": int(config.get("median_window", metadata.get("median_window", 0))), "wavelet": str(config.get("wavelet", metadata.get("wavelet", "unknown"))),
            "wavelet_threshold_mode": str(config.get("wavelet_threshold_mode", metadata.get("wavelet_threshold_mode", "unknown"))),
        },
        "prediction": prediction,
    }


@router.post("/analyses/{analysis_id}/reports")
def reports(analysis_id: str, payload: ReportRequest, request: Request) -> BinaryResponse:
    analysis = _analysis(request, analysis_id)
    prediction = request.app.state.store.predictions.get(analysis_id)
    if prediction is None:
        raise GatewayError(409, "prediction_required", "Run a prediction before generating a report.")
    content, media_type = serialize_report(report_document(analysis, prediction), payload.format)
    filename = f"transitlens-{analysis_id}.{payload.format}"
    return BinaryResponse(content, media_type=media_type, headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/dashboard/summary")
async def dashboard(request: Request, response: Response) -> dict[str, Any]:
    _, session = context(request, response)
    async def state(service: str, base: str, path: str) -> tuple[str, dict[str, Any]]:
        try:
            payload = await (request.app.state.clients.pipeline_json("GET", base, path) if service == "pipeline" else request.app.state.clients.ml_json("GET", base, path))
            return "operational", payload if isinstance(payload, dict) else {}
        except GatewayError:
            return "offline", {}
    pipeline_state, pipeline = await state("pipeline", session.pipeline_url, "/status")
    ml_state, ml_health = await state("ml", session.ml_core_url, "/health")
    _, ml_model = await state("ml", session.ml_core_url, "/model") if ml_state == "operational" else ("offline", {})
    services = [
        {"id": "pipeline", "name": "Data Pipeline", "state": pipeline_state},
        {"id": "ml-core", "name": "ML Core", "state": ml_state},
    ]
    jobs = [{"id": item.analysis_id, "target": item.source.target or item.source.filename, "mission": item.source.mission or "Unknown", "state": "completed", "progress": 100, "updatedAt": datetime.now(UTC).isoformat()} for item in request.app.state.store.analyses.values()]
    return {
        "systemState": "operational" if pipeline_state == ml_state == "operational" else "degraded",
        "pipelineState": pipeline_state,
        "modelVersion": ml_model.get("model_version") or ml_health.get("model_version"),
        "services": services,
        "recentAnalyses": jobs[-10:], "recentDownloads": request.app.state.store.downloads[:10],
        "activeJobs": [], "generatedAt": datetime.now(UTC).isoformat(),
    }
