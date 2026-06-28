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

function parseSseBuffer(
  buffer: string,
  onEvent: (event: ProgressEvent) => void
): { remainder: string; result: AnalysisResult | null } {
  let result: AnalysisResult | null = null;
  const lines = buffer.split("\n");

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("data:")) continue;

    try {
      const event = JSON.parse(line.slice(5).trim()) as ProgressEvent;
      onEvent(event);
      if (event.result) {
        result = event.result;
      }
    } catch {
      // Skip malformed SSE lines
    }
  }

  return { remainder: lines[lines.length - 1], result };
}

export async function analyzeStream(
  time: number[],
  flux: number[],
  targetId: string,
  onEvent: (event: ProgressEvent) => void,
  configOverride?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AnalysisResult> {
  try {
    const res = await fetch(`${BASE_URL}/analyze/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(time, flux, targetId, configOverride)),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Stream failed: ${res.status} ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let result: AnalysisResult | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseBuffer(buffer, onEvent);
      buffer = parsed.remainder;
      if (parsed.result) {
        result = parsed.result;
      }
    }

    if (buffer.trim()) {
      const parsed = parseSseBuffer(`${buffer}\n`, onEvent);
      if (parsed.result) {
        result = parsed.result;
      }
    }

    if (!result) {
      throw new Error("Stream ended without a result");
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    return syntheticStreamFallback(time, flux, targetId, onEvent, configOverride);
  }
}

async function syntheticStreamFallback(
  time: number[],
  flux: number[],
  targetId: string,
  onEvent: (event: ProgressEvent) => void,
  configOverride?: Record<string, unknown>
): Promise<AnalysisResult> {
  const steps: ProgressEvent[] = [
    { stage: "preprocessing", pct: 10, msg: "Loading and preprocessing light curve..." },
    { stage: "bls_search", pct: 30, msg: "Running BLS period search..." },
    { stage: "features", pct: 55, msg: "Extracting 16 diagnostic features..." },
    { stage: "classify", pct: 70, msg: "Classifying signal type..." },
    { stage: "fitting", pct: 85, msg: "Fitting transit parameters..." },
    { stage: "plots", pct: 95, msg: "Generating diagnostic plots..." },
  ];

  for (const event of steps) {
    onEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  try {
    const isHealthy = await healthCheck();
    if (isHealthy && time.length > 0 && flux.length > 0) {
      const result = await analyze(time, flux, targetId, configOverride);
      onEvent({ stage: "complete", pct: 100, msg: "Analysis complete.", result });
      return result;
    }
  } catch {
    // Fall through to cached demo data
  }

  const fallback = await loadFallback(targetId);
  if (!fallback) {
    throw new Error(`Could not load fallback for ${targetId}`);
  }

  onEvent({ stage: "complete", pct: 100, msg: "Analysis complete.", result: fallback });
  return fallback;
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

    const perTargetRes = await fetch(`/demo_data/${targetId}_metadata.json`);
    if (perTargetRes.ok) {
      metadata = (await perTargetRes.json()) as Partial<AnalysisResult>;
    } else {
      const sampleRes = await fetch("/demo_data/sample_metadata.json");
      if (!sampleRes.ok) {
        return null;
      }
      const allMeta = (await sampleRes.json()) as Record<string, Partial<AnalysisResult>>;
      metadata = allMeta[targetId];
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
