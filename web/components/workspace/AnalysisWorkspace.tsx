"use client";

import { useMemo, useState } from "react";
import type { SourceMode } from "@/lib/analysisConfig";
import {
  DEFAULT_CONFIG,
  buildConfigOverride,
  configSummary,
  type AnalysisConfigForm,
} from "@/lib/analysisConfig";
import type { ParsedLightCurve } from "@/lib/parseLightCurve";
import {
  WorkspaceCandidateCard,
  getDemoTargetId,
} from "./CandidateCard";
import { UploadZone } from "./UploadZone";
import { TICInput, getTicTargetId } from "./TICInput";
import { ConfigPanel } from "./ConfigPanel";

const SOURCE_MODES: { id: SourceMode; label: string }[] = [
  { id: "demo", label: "Demo Candidates" },
  { id: "upload", label: "Upload CSV/FITS" },
  { id: "tic", label: "TESS TIC ID" },
];

export interface RunPayload {
  targetId: string;
  time: number[];
  flux: number[];
  configOverride: Record<string, unknown>;
  sourceMode: SourceMode;
}

interface Props {
  onRun: (payload: RunPayload) => void;
  running?: boolean;
}

export function AnalysisWorkspace({ onRun, running = false }: Props) {
  const [sourceMode, setSourceMode] = useState<SourceMode>("demo");
  const [selectedDemo, setSelectedDemo] = useState<"a" | "b" | "c" | null>("a");
  const [uploadData, setUploadData] = useState<ParsedLightCurve | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ticId, setTicId] = useState("");
  const [config, setConfig] = useState<AnalysisConfigForm>(DEFAULT_CONFIG);

  const targetId = useMemo(() => {
    if (sourceMode === "demo" && selectedDemo) return getDemoTargetId(selectedDemo);
    if (sourceMode === "upload" && uploadData) {
      return uploadData.filename.replace(/\.[^.]+$/, "");
    }
    if (sourceMode === "tic" && ticId) return getTicTargetId(ticId);
    return null;
  }, [sourceMode, selectedDemo, uploadData, ticId]);

  const canRun = useMemo(() => {
    if (running) return false;
    if (sourceMode === "demo") return selectedDemo != null;
    if (sourceMode === "upload") return uploadData != null && !uploadError;
    if (sourceMode === "tic") return ticId.replace(/\D/g, "").length > 0;
    return false;
  }, [sourceMode, selectedDemo, uploadData, uploadError, ticId, running]);

  const handleRun = async () => {
    if (!targetId || !canRun) return;

    let time: number[] = [];
    let flux: number[] = [];

    if (sourceMode === "demo" && selectedDemo) {
      const { loadDemoCandidateCsv } = await import("@/lib/parseLightCurve");
      const parsed = await loadDemoCandidateCsv(selectedDemo);
      time = parsed.time;
      flux = parsed.flux;
    } else if (sourceMode === "upload" && uploadData) {
      time = uploadData.time;
      flux = uploadData.flux;
    }

    onRun({
      targetId,
      time,
      flux,
      configOverride: buildConfigOverride(config),
      sourceMode,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column — Source + Target */}
        <div className="space-y-6">
          <section className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
            <h2 className="mb-4 text-sm font-semibold text-text-primary">1. Source</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {SOURCE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSourceMode(mode.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-fast ${
                    sourceMode === mode.id
                      ? "bg-brand-ghost text-text-primary ring-1 ring-brand/40"
                      : "text-text-secondary hover:bg-white/5"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {sourceMode === "demo" && (
              <div className="space-y-3">
                {(["a", "b", "c"] as const).map((id) => (
                  <WorkspaceCandidateCard
                    key={id}
                    candidateId={id}
                    selected={selectedDemo === id}
                    onSelect={() => setSelectedDemo(id)}
                  />
                ))}
              </div>
            )}

            {sourceMode === "upload" && (
              <UploadZone
                data={uploadData}
                error={uploadError}
                onData={setUploadData}
                onError={setUploadError}
              />
            )}

            {sourceMode === "tic" && <TICInput value={ticId} onChange={setTicId} />}
          </section>

          <section className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
            <h2 className="mb-3 text-sm font-semibold text-text-primary">2. Target</h2>
            <div className="rounded-md border border-border-subtle bg-bg-surface px-4 py-3 font-mono text-sm text-text-primary">
              {targetId ?? "— select a source —"}
            </div>
          </section>
        </div>

        {/* Right column — Run + Config */}
        <div className="space-y-6">
          <section className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
            <h2 className="mb-4 text-sm font-semibold text-text-primary">3. Run</h2>
            <ConfigPanel value={config} onChange={setConfig} />

            <div className="mt-4 space-y-2 rounded-md bg-bg-surface px-4 py-3 text-xs text-text-muted">
              <p>
                Pipeline:{" "}
                <span className="text-text-secondary capitalize">{config.fitProfile}</span>
              </p>
              <p>
                Target:{" "}
                <span className="font-mono text-text-secondary">{targetId ?? "—"}</span>
              </p>
              <p>{configSummary(config)}</p>
            </div>

            <button
              type="button"
              disabled={!canRun}
              onClick={handleRun}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-core disabled:cursor-not-allowed disabled:opacity-40"
            >
              Run 🔭
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
