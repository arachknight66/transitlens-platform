import { PageHeader } from "@/components/layout/PageHeader";

const stages = [
  ["1", "Authoritative ingestion", "CSV, FITS/FIT/FTS, compressed FITS, DVT tables, target-pixel cubes, or TIC/sector TESScut acquisition. Checksums and source metadata are retained."],
  ["2", "Quality and detrending", "Finite-value selection, TESS quality masking, asymmetric clipping, robust normalization, gap-aware detrending, and explicit raw versus cleaned series."],
  ["3", "Transit-preserving denoising", "An initial BLS mask protects transit windows during a conservative second pass. Noise, depth, period, duration, and noise-only gates decide whether the denoised representation is accepted."],
  ["4", "Detection and significance", "Box Least Squares searches for periodic dips. TransitLens reports SNR, bootstrap false-alarm probability, aliases, event count, and the BLS periodogram."],
  ["5", "AI ranking and vetting", "A restricted calibrated prototype ranks transit, eclipsing-binary, and blend interpretations. No significant dip routes to other; physics, uncertainty, OOD, and missing diagnostics govern final vetting and review."],
  ["6", "Fit and explain", "Period, epoch, depth, duration, uncertainties, red-noise diagnostics, phase-folded fit, and human-readable reasoning are returned with provenance."],
];

export default function MethodPage() {
  return (
    <div className="p-8"><div className="mx-auto max-w-6xl">
      <PageHeader title="Method" subtitle="An explainable detection, AI-ranking, and physics-vetting pipeline—not a planet-confirmation claim." />
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-status-ok/30 bg-status-ok/10 p-4"><p className="text-xs text-text-muted">Detection</p><p className="font-semibold">Is a significant periodic dip present?</p></div>
        <div className="rounded-lg border border-brand/30 bg-brand-ghost p-4"><p className="text-xs text-text-muted">Classification</p><p className="font-semibold">Which interpretation ranks highest?</p></div>
        <div className="rounded-lg border border-status-warn/30 bg-status-warn/10 p-4"><p className="text-xs text-text-muted">Confirmation</p><p className="font-semibold">Requires independent follow-up; not performed here.</p></div>
      </div>
      <div className="space-y-3">
        {stages.map(([number, title, body]) => <section key={number} className="flex gap-4 rounded-lg border border-border-subtle bg-bg-elevated p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{number}</span><div><h2 className="font-semibold text-text-primary">{title}</h2><p className="mt-1 text-sm leading-relaxed text-text-secondary">{body}</p></div></section>)}
      </div>
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5 text-sm text-text-secondary">
        <strong className="text-text-primary">Four canonical outputs:</strong> exoplanet transit, eclipsing binary, blend contamination, and stellar variability/other. The calibrated model is a restricted research prototype with production_eligible=false; missing centroid, crowding, or Gaia evidence is shown as unavailable and can require review.
      </div>
    </div></div>
  );
}
