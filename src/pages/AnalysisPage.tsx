import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AnalysisChart } from '../components/AnalysisChart';
import { AnalysisReferenceForm } from '../components/AnalysisReferenceForm';
import { ErrorPanel } from '../components/ErrorPanel';
import { LoadingPanel } from '../components/LoadingPanel';
import { PageHeader } from '../components/PageHeader';
import { PredictionPanel } from '../components/PredictionPanel';
import { usePrediction } from '../hooks/usePrediction';
import { useProcessedAnalysis } from '../hooks/useProcessedAnalysis';
import { getCurrentAnalysisId, setCurrentAnalysisId } from '../utils/analysisSession';
import { validateProcessedAnalysis } from '../utils/analysisValidation';

const AnalysisPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAnalysisId = searchParams.get('analysis_id')?.trim() ?? getCurrentAnalysisId();
  const [analysisId, setAnalysisId] = useState(initialAnalysisId);
  const analysis = useProcessedAnalysis(analysisId);
  const prediction = usePrediction(analysisId);
  const validation = analysis.data ? validateProcessedAnalysis(analysis.data) : null;

  const loadAnalysis = (nextId: string): void => {
    prediction.reset();
    setCurrentAnalysisId(nextId);
    setAnalysisId(nextId);
    setSearchParams({ analysis_id: nextId }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Processing viewer"
        title="Analysis"
        description="Inspect aligned pipeline outputs on one synchronized time axis. All preprocessing values are supplied by transitlens-data-pipeline."
      />

      <div className="mt-8 space-y-5">
        <AnalysisReferenceForm initialValue={initialAnalysisId} onLoad={loadAnalysis} isLoading={analysis.isFetching} />

        {!analysisId && (
          <div className="rounded-xl border border-white/8 bg-space-900/55 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-300">No processed analysis selected</p>
            <p className="mt-2 text-sm text-slate-500">Enter an analysis reference or upload an observation first.</p>
          </div>
        )}
        {analysis.isPending && analysisId && <LoadingPanel />}
        {analysis.isError && <ErrorPanel onRetry={() => void analysis.refetch()} />}
        {analysis.data && validation && !validation.isValid && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">Processed data cannot be visualized</p>
            <p className="mt-2 text-sm text-slate-400">{validation.message}</p>
          </div>
        )}
        {analysis.data && validation?.isValid && (
          <>
            <section className="grid gap-4 sm:grid-cols-3" aria-label="Analysis metadata">
              <div className="rounded-xl border border-white/8 bg-space-900/70 p-4"><p className="text-[10px] tracking-[0.15em] text-slate-600 uppercase">Source</p><p className="mt-2 truncate text-sm text-slate-200">{analysis.data.source.filename}</p></div>
              <div className="rounded-xl border border-white/8 bg-space-900/70 p-4"><p className="text-[10px] tracking-[0.15em] text-slate-600 uppercase">Target</p><p className="mt-2 truncate text-sm text-slate-200">{analysis.data.source.target ?? 'Not provided'}</p></div>
              <div className="rounded-xl border border-white/8 bg-space-900/70 p-4"><p className="text-[10px] tracking-[0.15em] text-slate-600 uppercase">Samples</p><p className="mt-2 font-mono text-sm text-slate-200">{String(analysis.data.time.length)}</p></div>
            </section>
            <PredictionPanel prediction={prediction} />
            <AnalysisChart analysis={analysis.data} />
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
