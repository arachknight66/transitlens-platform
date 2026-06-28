import type { AnalysisResult } from "@/types/analysis";
import type { CandidateRecord, BlendRisk } from "@/types/candidate";

function computeBlendRisk(features: AnalysisResult["features"]): BlendRisk {
  const crowding = features.crowding_metric ?? 1;
  const centroid = features.centroid_shift ?? 0;
  if (crowding < 0.8 || centroid > 0.015) return "suspected";
  return "low";
}

function toRecord(targetId: string, raw: AnalysisResult): CandidateRecord {
  const features = raw.features ?? {};
  return {
    targetId,
    predictedClass: raw.predicted_class,
    confidence: raw.confidence,
    periodDays: raw.period_days,
    depth: raw.depth,
    snr: raw.snr ?? features.snr ?? null,
    durationDays: raw.duration_days,
    candidateDetected: raw.candidate_detected,
    blendRisk: computeBlendRisk(features),
    fitStatus: raw.candidate_detected ? "success" : "skipped",
    sector: raw.quality_flags?.find((f) => f.toLowerCase().includes("sector")) ?? "TESS",
    flags: raw.quality_flags ?? [],
  };
}

export async function loadCandidates(): Promise<CandidateRecord[]> {
  const res = await fetch("/demo_data/sample_metadata.json");
  if (!res.ok) return [];

  const data = (await res.json()) as Record<string, AnalysisResult>;
  return Object.entries(data).map(([id, raw]) =>
    toRecord(raw.target_id ?? id, { ...raw, target_id: raw.target_id ?? id })
  );
}

export function exportCandidatesCsv(rows: CandidateRecord[]): string {
  const headers = [
    "target_id",
    "predicted_class",
    "confidence",
    "period_days",
    "depth",
    "snr",
    "duration_days",
    "candidate_detected",
    "blend_risk",
    "fit_status",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.targetId,
        r.predictedClass,
        r.confidence.toFixed(4),
        r.periodDays?.toFixed(6) ?? "",
        r.depth?.toFixed(6) ?? "",
        r.snr?.toFixed(2) ?? "",
        r.durationDays?.toFixed(6) ?? "",
        r.candidateDetected ? "true" : "false",
        r.blendRisk,
        r.fitStatus,
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
