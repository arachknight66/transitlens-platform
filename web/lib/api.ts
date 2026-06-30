import type { AnalysisResult, ProgressEvent } from "@/types/analysis";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: "GET" });
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === "ok";
  } catch {
    return false;
  }
}

function buildPayload(
  time: number[],
  flux: number[],
  targetId: string,
  configOverride?: Record<string, unknown>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    time,
    flux,
    target_id: targetId,
    metadata: { source_type: targetId.startsWith("candidate_") ? "synthetic_demo" : "array_input" },
  };
  if (configOverride) {
    payload.config = configOverride;
  }
  return payload;
}

export async function analyze(
  time: number[],
  flux: number[],
  targetId: string,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload(time, flux, targetId, configOverride)),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AnalysisResult>;
}

export async function analyzeTess(
  ticId: string,
  sector?: number,
  cutoutSize = 15,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const formData = new URLSearchParams();
  formData.append("tic_id", ticId);
  if (sector != null) {
    formData.append("sector", String(sector));
  }
  formData.append("cutout_size", String(cutoutSize));
  if (configOverride) {
    formData.append("config", JSON.stringify(configOverride));
  }

  const res = await fetch(`${BASE_URL}/analyze/tess`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`TESS Analysis failed: ${res.status} ${res.statusText}. Detail: ${errorText}`);
  }

  return res.json() as Promise<AnalysisResult>;
}

export async function getTesscutSectors(ticId: string, signal?: AbortSignal): Promise<{
  tic_id: string;
  ra_deg: number;
  dec_deg: number;
  sectors: number[];
  default_sector: number | null;
}> {
  const clean = ticId.replace(/^TIC[-\s]*/i, "").trim();
  const res = await fetch(`${BASE_URL}/tesscut/sectors/${encodeURIComponent(clean)}`, { signal });
  if (!res.ok) throw new Error(`TESScut sector lookup failed: ${await res.text()}`);
  return res.json();
}

export async function analyzeFile(
  file: File,
  targetId: string,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("target_id", targetId);
  body.append("config", JSON.stringify(configOverride ?? {}));
  const res = await fetch(`${BASE_URL}/analyze/file`, { method: "POST", body, signal });
  if (!res.ok) throw new Error(`Authoritative upload analysis failed: ${await res.text()}`);
  return res.json();
}

async function runTessAnalysisWithProgress(
  ticId: string,
  onEvent: (event: ProgressEvent) => void,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const steps: ProgressEvent[] = [
    { stage: "preprocessing", pct: 15, msg: "Connecting to MAST and downloading TPF data..." },
    { stage: "bls_search", pct: 35, msg: "Cleaning data and performing BLS period search..." },
    { stage: "features", pct: 60, msg: "Extracting diagnostic properties and centroid shifts..." },
    { stage: "classify", pct: 75, msg: "Vetting signal against pipeline rules..." },
    { stage: "plots", pct: 90, msg: "Generating diagnostic matplotlib figures..." },
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < steps.length) {
      onEvent(steps[stepIdx]);
      stepIdx++;
    }
  }, 1200);

  try {
    const result = await analyzeTess(ticId, undefined, 15, configOverride, signal);
    clearInterval(interval);
    onEvent({ stage: "complete", pct: 100, msg: "Analysis complete.", result });
    return result;
  } catch (error) {
    clearInterval(interval);
    throw error;
  }
}

export async function analyzeStream(
  time: number[],
  flux: number[],
  targetId: string,
  onEvent: (event: ProgressEvent) => void,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  const isTicId = targetId.toUpperCase().startsWith("TIC") || /^\d+$/.test(targetId);
  if (isTicId) {
    const cleanId = targetId.replace(/^TIC[-\s]*/i, "").trim();
    return runTessAnalysisWithProgress(cleanId, onEvent, configOverride, signal);
  }

  const steps: ProgressEvent[] = [
    { stage: "preprocessing", pct: 10, msg: "Submitting measurements to the scientific backend…" },
    { stage: "bls_search", pct: 30, msg: "Running transit-preserving preprocessing and BLS search…" },
    { stage: "features", pct: 55, msg: "Extracting physical and contamination diagnostics…" },
    { stage: "classify", pct: 72, msg: "Ranking interpretations with restricted calibrated ML…" },
    { stage: "fitting", pct: 85, msg: "Fitting parameters and uncertainties…" },
    { stage: "plots", pct: 94, msg: "Rendering scientific diagnostics…" },
  ];
  let index = 0;
  const timer = setInterval(() => {
    if (index < steps.length) onEvent(steps[index++]);
  }, 800);
  try {
    const result = await analyze(time, flux, targetId, configOverride, signal);
    onEvent({ stage: "complete", pct: 100, msg: "Analysis complete.", result });
    return result;
  } finally {
    clearInterval(timer);
  }
}

export async function loadLightCurve(
  targetId: string
): Promise<{ time: number[]; flux: number[] } | null> {
  const match = targetId.match(/^candidate_([abc])$/);
  if (!match) return null;

  try {
    const { loadDemoCandidateCsv } = await import("./parseLightCurve");
    const parsed = await loadDemoCandidateCsv(match[1] as "a" | "b" | "c");
    return { time: parsed.time, flux: parsed.flux };
  } catch {
    return null;
  }
}

export async function loadFallback(targetId: string): Promise<AnalysisResult | null> {
  try {
    let metadata: Partial<AnalysisResult> | undefined;

    const sampleRes = await fetch("/demo_data/sample_metadata.json");
    if (sampleRes.ok) {
      const allMeta = (await sampleRes.json()) as Record<string, Partial<AnalysisResult>>;
      metadata = allMeta[targetId];
    }

    if (!metadata) {
      const perTargetRes = await fetch(`/demo_data/${targetId}_metadata.json`);
      if (perTargetRes.ok) {
        metadata = (await perTargetRes.json()) as Partial<AnalysisResult>;
      }
    }

    if (!metadata) {
      return null;
    }

    const lc = await loadLightCurve(targetId);

    const plotsRes = await fetch(`/demo_data/${targetId}_plots.json`);
    const plots = plotsRes.ok
      ? ((await plotsRes.json()) as AnalysisResult["plots"])
      : {};

    return {
      ...metadata,
      plots: { ...plots, ...(metadata.plots ?? {}) },
      raw_time: lc?.time ?? metadata.raw_time,
      raw_flux: lc?.flux ?? metadata.raw_flux,
    } as AnalysisResult;
  } catch {
    return null;
  }
}
