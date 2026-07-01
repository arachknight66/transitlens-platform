"""Scientific artifact serialization from validated gateway records."""

import csv
import io
import json
from datetime import UTC, datetime
from typing import Any

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen.canvas import Canvas

from .models import PredictionResult, ProcessedAnalysis


def report_document(analysis: ProcessedAnalysis, prediction: PredictionResult) -> dict[str, Any]:
    features = analysis.features
    metadata = analysis.metadata
    statistics = features.get("statistics") if isinstance(features.get("statistics"), dict) else features
    feature_metadata = features.get("metadata") if isinstance(features.get("metadata"), dict) else {}
    return {
        "analysis_id": analysis.analysis_id,
        "timestamp": datetime.now(UTC).isoformat(),
        "observation_metadata": {
            "filename": analysis.source.filename,
            "target": analysis.source.target,
            "mission": analysis.source.mission,
            **metadata,
        },
        "prediction": prediction.predicted_class,
        "probability": prediction.probability,
        "confidence": prediction.confidence,
        "scientific_metrics": {
            "transit_depth": _first_number(features.get("transit_depth"), prediction.transit_depth),
            "transit_duration": _first_number(features.get("transit_duration"), prediction.transit_duration),
            "estimated_period": _first_number(features.get("estimated_period"), prediction.estimated_period),
            "signal_to_noise_ratio": _first_number(
                statistics.get("signal_to_noise_ratio", statistics.get("snr")),
                prediction.signal_to_noise_ratio,
            ),
        },
        "model_version": prediction.model_version,
        "inference_time_ms": prediction.inference_time,
        "pipeline_version": feature_metadata.get("pipeline_version", metadata.get("pipeline_version", "unavailable")),
    }


def _first_number(*values: Any) -> float | int | None:
    for value in values:
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            return value
    return None


def serialize_report(document: dict[str, Any], format_name: str) -> tuple[bytes, str]:
    if format_name == "json":
        return json.dumps(document, indent=2, default=str).encode(), "application/json"
    if format_name == "csv":
        output = io.StringIO(newline="")
        writer = csv.writer(output)
        writer.writerow(["field", "value"])
        for key, value in _flatten(document):
            writer.writerow([key, "" if value is None else value])
        return output.getvalue().encode(), "text/csv; charset=utf-8"
    return _pdf(document), "application/pdf"


def _flatten(value: Any, prefix: str = "") -> list[tuple[str, Any]]:
    rows: list[tuple[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            rows.extend(_flatten(child, f"{prefix}.{key}" if prefix else key))
    else:
        rows.append((prefix, value))
    return rows


def _pdf(document: dict[str, Any]) -> bytes:
    output = io.BytesIO()
    canvas = Canvas(output, pagesize=letter, pageCompression=1)
    canvas.setTitle(f"TransitLens Report {document['analysis_id']}")
    y = 750
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawString(54, y, "TransitLens Scientific Report")
    y -= 28
    canvas.setFont("Helvetica", 9)
    for key, value in _flatten(document):
        line = f"{key}: {value if value is not None else 'unavailable'}"
        for offset in range(0, len(line), 100):
            if y < 54:
                canvas.showPage()
                canvas.setFont("Helvetica", 9)
                y = 750
            canvas.drawString(54, y, line[offset:offset + 100])
            y -= 13
    canvas.save()
    return output.getvalue()
