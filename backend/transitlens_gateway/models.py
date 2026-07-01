"""Validated public and upstream gateway contracts."""

from datetime import datetime
from typing import Any, Literal

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SessionSettingsRequest(StrictModel):
    mast_api_token: str | None = Field(default=None, max_length=4096)
    pipeline_url: AnyHttpUrl | None = None
    ml_core_url: AnyHttpUrl | None = None

    @field_validator("mast_api_token")
    @classmethod
    def clean_token(cls, value: str | None) -> str | None:
        if value is None:
            return None
        token = value.strip()
        return token or None


class SessionSettingsResponse(StrictModel):
    pipeline_url: str
    ml_core_url: str
    has_mast_token: bool
    expires_at: datetime


class DownloadRequest(StrictModel):
    mast_id: str = Field(min_length=1, max_length=512)


class DownloadResponse(StrictModel):
    mast_id: str
    product_filename: str
    data_uri: str
    path: str
    from_cache: bool


class Observation(StrictModel):
    mast_id: str
    observation_id: str
    target_name: str
    mission: Literal["TESS", "Kepler", "K2"]
    product_type: str
    start_time: float | None
    end_time: float | None


class ProcessRequest(StrictModel):
    source_reference: str = Field(min_length=1, max_length=2048)
    filename: str | None = Field(default=None, max_length=512)
    target: str | None = Field(default=None, max_length=512)
    mission: str | None = Field(default=None, max_length=64)


class UploadReceipt(StrictModel):
    upload_id: str
    analysis_id: str
    filename: str
    format: Literal["fits", "csv"]
    size_bytes: int = Field(ge=0)
    status: Literal["accepted", "processing", "processed"]


class AnalysisSource(StrictModel):
    filename: str
    target: str | None = None
    mission: str | None = None


class ProcessedAnalysis(StrictModel):
    analysis_id: str
    status: Literal["processed"] = "processed"
    source: AnalysisSource
    time: list[float]
    flux: list[float]
    normalized_flux: list[float]
    median_filtered_flux: list[float]
    wavelet_flux: list[float]
    quality: list[int] | None
    metadata: dict[str, Any]
    features: dict[str, Any]


class PredictionResult(StrictModel):
    prediction_id: str
    analysis_id: str
    probability: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    predicted_class: Literal[0, 1]
    transit_depth: float | None = None
    transit_duration: float | None = None
    estimated_period: float | None = None
    signal_to_noise_ratio: float | None = None
    model_version: str = Field(min_length=1)
    inference_time: float = Field(ge=0)
    created_at: datetime


class ScientificMetric(StrictModel):
    value: float | None
    unit: Literal["ppm", "hours", "days", "dimensionless"]
    source: str


class ReportRequest(StrictModel):
    format: Literal["pdf", "json", "csv"]


class UpstreamUploadResponse(StrictModel):
    file_id: str
    media_type: Literal["fits", "fit", "csv"]
    size_bytes: int = Field(ge=0)
