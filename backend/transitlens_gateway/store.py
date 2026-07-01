"""Ephemeral orchestration records; no scientific processing occurs here."""

from dataclasses import dataclass, field
from datetime import UTC, datetime

from .models import PredictionResult, ProcessedAnalysis


@dataclass(slots=True)
class GatewayStore:
    analyses: dict[str, ProcessedAnalysis] = field(default_factory=dict)
    predictions: dict[str, PredictionResult] = field(default_factory=dict)
    downloads: list[dict[str, object]] = field(default_factory=list)

    def remember_download(self, payload: dict[str, object]) -> None:
        self.downloads.insert(0, {**payload, "downloadedAt": datetime.now(UTC).isoformat()})
        del self.downloads[20:]

