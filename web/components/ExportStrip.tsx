"use client";

import type { AnalysisResult } from "@/types/analysis";
import { formatPeriod, formatDepth, formatDuration } from "@/lib/formatters";
import { getClassConfig } from "@/lib/classConfig";

interface Props {
  result: AnalysisResult;
}

export function ExportStrip({ result }: Props) {
  const targetId = result.target_id ?? "target";

  const downloadJson = () => {
    const displayResult = { ...result, plots: "[omitted — use HTML report or plot gallery to export figures]" };
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

  const downloadCsv = () => {
    const features = result.features ?? {};
    const headers = [
      "target_id",
      "candidate_detected",
      "predicted_class",
      "confidence",
      "period_days",
      "duration_days",
      "depth",
      "snr",
      "transit_count",
      "bls_power",
      "odd_even_depth_delta",
      "v_shape_score",
      "local_noise",
      "depth_to_noise_ratio",
      "phase_shape_kurtosis",
      "explanation",
      "processing_time_ms",
      "pipeline_version"
    ];

    const escape = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = [
      result.target_id,
      result.candidate_detected ? "true" : "false",
      result.predicted_class,
      result.confidence,
      result.period_days,
      result.duration_days,
      result.depth,
      result.snr,
      features.transit_count,
      features.bls_power,
      features.odd_even_depth_delta,
      features.v_shape_score,
      features.local_noise,
      features.depth_to_noise_ratio,
      features.phase_shape_kurtosis,
      result.explanation,
      result.processing_time_ms,
      result.pipeline_version ?? "0.1.0"
    ].map(escape);

    const csvContent = [headers.join(","), row.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transitlens_${targetId}_result.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const cfg = getClassConfig(result.predicted_class);
    const confidenceColors: Record<string, string> = {
      exoplanet_transit: "#3C3489",
      eclipsing_binary: "#712B13",
      blend_contamination: "#D48B00",
      stellar_variability_or_other: "#444441",
    };
    const confidenceColor = confidenceColors[result.predicted_class] ?? "#444441";
    const timestamp = new Date().toLocaleString();
    const version = result.pipeline_version ?? "0.1.0";

    const plotsHtml = Object.entries(result.plots ?? {})
      .map(([key, b64]) => {
        if (!b64) return "";
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `
          <div class="plot-item">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 8px; color: #495057;">${label}</div>
            <img src="data:image/png;base64,${b64}" alt="${label}">
          </div>
        `;
      })
      .join("");

    const featuresHtml = Object.entries(result.features ?? {})
      .map(([key, val]) => {
        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const displayVal =
          val === null || val === undefined
            ? "N/A"
            : typeof val === "number"
              ? val.toFixed(5)
              : String(val);
        return `<tr><td>${label}</td><td>${displayVal}</td></tr>`;
      })
      .join("");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>TransitLens Report - ${result.target_id}</title>
<style>
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #FFFFFF;
        color: #1A1A1A;
        line-height: 1.6;
        margin: 0;
        padding: 0;
    }
    .header {
        background-color: #3E37A8;
        color: #FFFFFF;
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .header h1 {
        margin: 0;
        font-size: 24px;
        letter-spacing: 1px;
    }
    .header .meta {
        font-size: 12px;
        text-align: right;
        opacity: 0.8;
    }
    .container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 40px 20px;
    }
    .summary-card {
        background-color: #F8F9FA;
        border: 1px solid #E9ECEF;
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 30px;
    }
    .target-title {
        font-size: 20px;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 16px;
    }
    .badge {
        display: inline-block;
        background-color: ${confidenceColor};
        color: #FFFFFF;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
        margin-right: 16px;
    }
    .metrics {
        display: flex;
        gap: 30px;
        margin-top: 20px;
    }
    .metric {
        flex: 1;
    }
    .metric-label {
        font-size: 12px;
        color: #6C757D;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
    }
    .metric-value {
        font-size: 18px;
        font-weight: 600;
        font-family: monospace;
    }
    h2 {
        border-bottom: 1px solid #E9ECEF;
        padding-bottom: 8px;
        margin-top: 40px;
        color: #343A40;
        font-size: 18px;
    }
    .explanation {
        background-color: rgba(62, 55, 168, 0.05);
        border-left: 4px solid #3E37A8;
        padding: 16px 20px;
        border-radius: 0 4px 4px 0;
        margin-bottom: 30px;
        font-size: 14px;
    }
    .plot-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }
    .plot-item {
        border: 1px solid #E9ECEF;
        border-radius: 6px;
        padding: 12px;
        background: #FFFFFF;
    }
    .plot-item img {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 4px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 40px;
    }
    th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid #E9ECEF;
        font-size: 13px;
    }
    th {
        font-weight: 600;
        color: #495057;
        background-color: #F8F9FA;
    }
    td {
        font-family: monospace;
    }
    .footer {
        text-align: center;
        padding: 30px;
        font-size: 12px;
        color: #ADB5BD;
        border-top: 1px solid #E9ECEF;
        margin-top: 40px;
    }
</style>
</head>
<body>

<div class="header">
    <h1>TransitLens</h1>
    <div class="meta">
        Analysis Report<br>
        ${timestamp}<br>
        v${version}
    </div>
</div>

<div class="container">
    
    <div class="summary-card">
        <h2 class="target-title">Target: ${result.target_id}</h2>
        <div>
            <span class="badge">${cfg.display}</span>
            <span style="font-size: 16px; font-weight: 600; color: ${confidenceColor};">Confidence: ${Math.round(
              result.confidence * 100
            )}%</span>
        </div>
        <div class="metrics">
            <div class="metric">
                <div class="metric-label">Orbital Period</div>
                <div class="metric-value">${
                  result.candidate_detected ? formatPeriod(result.period_days) : "—"
                }</div>
            </div>
            <div class="metric">
                <div class="metric-label">Transit Depth</div>
                <div class="metric-value">${
                  result.candidate_detected ? formatDepth(result.depth) : "—"
                }</div>
            </div>
            <div class="metric">
                <div class="metric-label">Duration</div>
                <div class="metric-value">${
                  result.candidate_detected ? formatDuration(result.duration_days) : "—"
                }</div>
            </div>
            <div class="metric">
                <div class="metric-label">SNR</div>
                <div class="metric-value">${
                  result.candidate_detected && result.snr != null
                    ? `${result.snr.toFixed(1)}σ`
                    : "—"
                }</div>
            </div>
        </div>
    </div>

    <h2>Classification Reasoning</h2>
    <div class="explanation">
        ${result.explanation}
    </div>

    <h2>Diagnostic Plots</h2>
    <div class="plot-grid">
        ${plotsHtml || '<p style="grid-column: span 2; color: #888; font-size: 14px;">No diagnostic plots available.</p>'}
    </div>

    <h2>Extracted Features</h2>
    <table>
        <thead>
            <tr>
                <th>Feature</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            ${featuresHtml}
        </tbody>
    </table>

</div>

<div class="footer">
    Generated by TransitLens &middot; Bharatiya Antariksh Hackathon 2026
</div>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transitlens_${targetId}_report.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-6">
      <h3 className="mb-2 text-heading font-semibold text-text-primary">
        Export Evidence Pack
      </h3>
      <p className="mb-4 text-body text-text-secondary">
        Download a complete evidence package for this analysis, including parameters,
        uncertainties, and pipeline provenance.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadJson}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-fast hover:bg-brand-core"
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={downloadCsv}
          className="rounded-md border border-border-soft px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-fast hover:border-brand"
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={downloadHtml}
          className="rounded-md border border-border-soft px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-fast hover:border-brand"
        >
          Download HTML Report
        </button>
      </div>
    </div>
  );
}
