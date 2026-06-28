"use client";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

export function ExportStrip({ result }: Props) {
  const targetId = result.target_id ?? "target";

  const downloadJson = () => {
    const displayResult = { ...result, plots: "[omitted — use PNG exports above]" };
    const blob = new Blob([JSON.stringify(displayResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transitlens_${targetId}_result.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-bg-card p-6">
      <h3 className="mb-2 text-heading font-semibold text-text-primary">
        Export Evidence Pack
      </h3>
      <p className="mb-4 text-body text-text-secondary">
        Download a complete evidence package for this analysis, including parameters,
        uncertainties, and pipeline provenance.
      </p>
      <button
        type="button"
        onClick={downloadJson}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Download JSON Report
      </button>
    </div>
  );
}
