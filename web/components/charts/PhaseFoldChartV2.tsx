"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  downsample,
  phaseFold,
  computeBinnedAverage,
  trapezoidalTransit,
  type PhasePoint,
} from "@/lib/phaseFold";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { formatPeriod } from "@/lib/formatters";
import { LazyPlotImage } from "@/components/ui/LazyPlotImage";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  selectedPeriod?: number | null;
  onPeriodChange?: (period: number) => void;
}

const COLORS = {
  points: "rgba(138,129,242,0.4)",
  binned: "#3E37A8",
  binnedBand: "rgba(62,55,168,0.2)",
  model: "#7B74D4",
  residuals: "rgba(255,255,255,0.3)",
  transitShade: "rgba(83,74,183,0.08)",
  grid: "rgba(255,255,255,0.06)",
  axis: "#888888",
  zero: "rgba(255,255,255,0.2)",
};

function mapX(x: number, xMin: number, xMax: number, w: number, pad: number): number {
  return pad + ((x - xMin) / (xMax - xMin)) * (w - 2 * pad);
}

function mapY(y: number, yMin: number, yMax: number, h: number, pad: number): number {
  return h - pad - ((y - yMin) / (yMax - yMin)) * (h - 2 * pad);
}

export function PhaseFoldChartV2({ result, selectedPeriod, onPeriodChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectedPeriod = result.period_days ?? 1;
  const depth = result.depth ?? 0.01;
  const durationPhase =
    result.duration_days && result.period_days
      ? result.duration_days / result.period_days
      : 0.05;

  const [localPeriod, setLocalPeriod] = useState<number | null>(null);
  const [phaseWindow, setPhaseWindow] = useState<[number, number]>([-0.5, 0.5]);
  const [sliderPeriod, setSliderPeriod] = useState(selectedPeriod ?? detectedPeriod);
  const [hover, setHover] = useState<PhasePoint | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; window: [number, number] } | null>(null);

  const activePeriod = useDebouncedValue(
    selectedPeriod ?? localPeriod ?? sliderPeriod,
    16
  );

  const phasedData = useMemo(() => {
    if (!result.raw_time?.length || !result.raw_flux?.length) return [];
    const time = downsample(result.raw_time);
    const flux = downsample(result.raw_flux.slice(0, time.length), time.length);
    return phaseFold(time, flux, activePeriod);
  }, [result.raw_time, result.raw_flux, activePeriod]);

  const [xMin, xMax] = phaseWindow;
  const visiblePoints = useMemo(
    () => phasedData.filter((p) => p.x >= xMin && p.x <= xMax),
    [phasedData, xMin, xMax]
  );

  const bins = useMemo(
    () => computeBinnedAverage(phasedData, 50, xMin, xMax),
    [phasedData, xMin, xMax]
  );

  const modelCurve = useMemo(() => {
    const pts: PhasePoint[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = xMin + ((xMax - xMin) * i) / 100;
      pts.push({ x, y: trapezoidalTransit(x, depth, durationPhase) });
    }
    return pts;
  }, [xMin, xMax, depth, durationPhase]);

  const residuals = useMemo(
    () =>
      visiblePoints.map((p) => ({
        x: p.x,
        y: p.y - trapezoidalTransit(p.x, depth, durationPhase),
      })),
    [visiblePoints, depth, durationPhase]
  );

  const yRange = useMemo(() => {
    const ys = visiblePoints.map((p) => p.y);
    if (!ys.length) return [0.99, 1.01];
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const pad = (max - min) * 0.15 || 0.005;
    return [min - pad, max + pad];
  }, [visiblePoints]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const topH = h * 0.7;
    const botH = h * 0.3;
    const pad = 40;

    ctx.clearRect(0, 0, w, h);
    const [yMin, yMax] = yRange;

    // Transit shading
    const ingress = -durationPhase / 2;
    const egress = durationPhase / 2;
    ctx.fillStyle = COLORS.transitShade;
    ctx.fillRect(
      mapX(ingress, xMin, xMax, w, pad),
      pad,
      mapX(egress, xMin, xMax, w, pad) - mapX(ingress, xMin, xMax, w, pad),
      topH - 2 * pad
    );

    // Binned ±1σ band
    ctx.beginPath();
    for (const b of bins) {
      if (b.n === 0) continue;
      const x = mapX(b.x, xMin, xMax, w, pad);
      const yTop = mapY(b.y + b.yStd, yMin, yMax, topH, pad);
      const yBot = mapY(b.y - b.yStd, yMin, yMax, topH, pad);
      ctx.fillStyle = COLORS.binnedBand;
      ctx.fillRect(x - 3, yTop, 6, yBot - yTop);
    }

    // Binned line
    ctx.strokeStyle = COLORS.binned;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (const b of bins) {
      if (b.n === 0) continue;
      const x = mapX(b.x, xMin, xMax, w, pad);
      const y = mapY(b.y, yMin, yMax, topH, pad);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Model dashed
    ctx.strokeStyle = COLORS.model;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    modelCurve.forEach((p, i) => {
      const x = mapX(p.x, xMin, xMax, w, pad);
      const y = mapY(p.y, yMin, yMax, topH, pad);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Scatter points
    for (const p of visiblePoints) {
      ctx.fillStyle = COLORS.points;
      ctx.beginPath();
      ctx.arc(
        mapX(p.x, xMin, xMax, w, pad),
        mapY(p.y, yMin, yMax, topH, pad),
        1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Residual panel
    const rMin = -0.01;
    const rMax = 0.01;
    ctx.strokeStyle = COLORS.zero;
    ctx.beginPath();
    ctx.moveTo(pad, topH + mapY(0, rMin, rMax, botH, pad) - pad);
    ctx.lineTo(w - pad, topH + mapY(0, rMin, rMax, botH, pad) - pad);
    ctx.stroke();

    for (const r of residuals) {
      ctx.fillStyle = COLORS.residuals;
      ctx.beginPath();
      ctx.arc(
        mapX(r.x, xMin, xMax, w, pad),
        topH + mapY(r.y, rMin, rMax, botH, pad) - pad,
        1.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Hover
    if (hover) {
      const hx = mapX(hover.x, xMin, xMax, w, pad);
      const hy = mapY(hover.y, yMin, yMax, topH, pad);
      ctx.strokeStyle = COLORS.model;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Divider
    ctx.strokeStyle = COLORS.grid;
    ctx.beginPath();
    ctx.moveTo(pad, topH);
    ctx.lineTo(w - pad, topH);
    ctx.stroke();
  }, [visiblePoints, bins, modelCurve, residuals, xMin, xMax, yRange, hover, durationPhase]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  const handlePeriodChange = useCallback(
    (value: number) => {
      setSliderPeriod(value);
      setLocalPeriod(value);
      onPeriodChange?.(value);
    },
    [onPeriodChange]
  );

  const handleReset = useCallback(() => {
    setSliderPeriod(detectedPeriod);
    setLocalPeriod(null);
    setPhaseWindow([-0.5, 0.5]);
    onPeriodChange?.(detectedPeriod);
  }, [detectedPeriod, onPeriodChange]);

  const staticPlot = result.plots?.phase_folded;
  if (!phasedData.length && staticPlot) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <h3 className="mb-3 font-semibold text-text-primary">Phase-Folded Light Curve</h3>
        <LazyPlotImage base64={staticPlot} alt="Phase-folded light curve" />
      </div>
    );
  }

  if (!phasedData.length) return null;

  const minP = detectedPeriod * 0.5;
  const maxP = detectedPeriod * 2;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-elevated p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-text-primary">Phase-Folded Light Curve</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-border-soft px-3 py-1 text-xs text-text-primary hover:border-brand"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${result.target_id}_phase_fold.png`;
                a.click();
                URL.revokeObjectURL(url);
              }, "image/png");
            }}
            className="rounded-md border border-border-soft px-3 py-1 text-xs text-text-primary hover:border-brand"
          >
            Export PNG
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-text-secondary">
        <span className="tabular-nums">Period: {formatPeriod(activePeriod)}</span>
      </div>

      <input
        type="range"
        min={minP}
        max={maxP}
        step={(maxP - minP) / 200}
        value={sliderPeriod}
        onChange={(e) => handlePeriodChange(parseFloat(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            handlePeriodChange(Math.max(minP, sliderPeriod - 0.001));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            handlePeriodChange(Math.min(maxP, sliderPeriod + 0.001));
          }
        }}
        className="mb-3 w-full accent-brand"
        aria-label="Orbital period slider. Use arrow keys to adjust by 0.001 days."
      />

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-[420px] w-full cursor-crosshair rounded-md bg-bg-surface"
          role="img"
          aria-label="Interactive phase-fold chart with binned overlay and residuals"
          onWheel={(e) => {
            e.preventDefault();
            const span = xMax - xMin;
            const factor = e.deltaY > 0 ? 1.1 : 0.9;
            const newSpan = Math.min(1, Math.max(0.1, span * factor));
            const cx = (xMin + xMax) / 2;
            setPhaseWindow([cx - newSpan / 2, cx + newSpan / 2]);
          }}
          onMouseDown={(e) => {
            setDragging(true);
            dragStart.current = { x: e.clientX, window: [...phaseWindow] as [number, number] };
          }}
          onMouseUp={() => {
            setDragging(false);
            dragStart.current = null;
          }}
          onMouseLeave={() => {
            setDragging(false);
            setHover(null);
          }}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const phase = xMin + ((px - 40) / (rect.width - 80)) * (xMax - xMin);

            if (dragging && dragStart.current) {
              const dx = e.clientX - dragStart.current.x;
              const dPhase = (-dx / (rect.width - 80)) * (xMax - xMin);
              const [w0, w1] = dragStart.current.window;
              setPhaseWindow([w0 + dPhase, w1 + dPhase]);
              return;
            }

            let nearest: PhasePoint | null = null;
            let best = Infinity;
            for (const p of visiblePoints) {
              const d = Math.abs(p.x - phase);
              if (d < best) {
                best = d;
                nearest = p;
              }
            }
            setHover(best < 0.02 ? nearest : null);
          }}
        />
        {hover && (
          <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-border-soft bg-bg-overlay px-3 py-2 text-xs tabular-nums text-text-primary">
            Phase: {hover.x.toFixed(4)} · Flux: {hover.y.toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
}
