import { memo, useMemo, useState } from 'react';

import type { ProcessedAnalysis } from '../types/analysis';
import { buildAnalysisPlot } from '../utils/analysisPlot';
import { PlotlyChart } from './PlotlyChart';

export const AnalysisChart = memo(({ analysis }: { readonly analysis: ProcessedAnalysis }) => {
  const [dragMode, setDragMode] = useState<'pan' | 'zoom'>('zoom');
  const [revision, setRevision] = useState(0);
  const plot = useMemo(() => buildAnalysisPlot(analysis, dragMode), [analysis, dragMode]);

  return (
    <section className="overflow-hidden rounded-xl border border-white/8 bg-space-900/70" aria-labelledby="curve-workspace-title">
      <header className="flex flex-col justify-between gap-4 border-b border-white/7 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 id="curve-workspace-title" className="text-sm font-semibold text-slate-100">Synchronized light curves</h2>
          <p className="mt-1 text-xs text-slate-500">Shared time axis · {String(analysis.time.length)} samples · scroll to zoom</p>
        </div>
        <div className="flex gap-2" aria-label="Chart interaction mode">
          <button type="button" aria-pressed={dragMode === 'zoom'} onClick={() => { setDragMode('zoom'); }} className={`rounded-lg border px-3 py-2 text-xs ${dragMode === 'zoom' ? 'border-signal-400/30 bg-signal-400/10 text-signal-300' : 'border-white/10 text-slate-400'}`}>Zoom</button>
          <button type="button" aria-pressed={dragMode === 'pan'} onClick={() => { setDragMode('pan'); }} className={`rounded-lg border px-3 py-2 text-xs ${dragMode === 'pan' ? 'border-signal-400/30 bg-signal-400/10 text-signal-300' : 'border-white/10 text-slate-400'}`}>Pan</button>
          <button type="button" onClick={() => { setRevision((value) => value + 1); }} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white">Reset view</button>
        </div>
      </header>
      <div role="img" aria-label="Raw, normalized, and wavelet-denoised light curves synchronized by observation time" className="min-h-[760px] w-full">
        <PlotlyChart
          data={[...plot.data]}
          layout={{ ...plot.layout, datarevision: revision, uirevision: `${analysis.analysis_id}-${String(revision)}` }}
          config={plot.config}
          revision={revision}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </section>
  );
});

AnalysisChart.displayName = 'AnalysisChart';
