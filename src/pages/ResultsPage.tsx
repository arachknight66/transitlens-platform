import { Link, useSearchParams } from 'react-router-dom';

import { AnalysisReferenceForm } from '../components/AnalysisReferenceForm';
import { ErrorPanel } from '../components/ErrorPanel';
import { LoadingPanel } from '../components/LoadingPanel';
import { MetadataPanel } from '../components/MetadataPanel';
import { PageHeader } from '../components/PageHeader';
import { PredictionCard } from '../components/PredictionCard';
import { ScientificMetricsPanel } from '../components/ScientificMetricsPanel';
import { useScientificResults } from '../hooks/useScientificResults';
import { getCurrentAnalysisId, setCurrentAnalysisId } from '../utils/analysisSession';
import { validateScientificResults } from '../utils/resultsValidation';

const ResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const analysisId = searchParams.get('analysis_id')?.trim() ?? getCurrentAnalysisId();
  const results = useScientificResults(analysisId);
  const validation = results.data ? validateScientificResults(results.data) : null;

  const loadResults = (nextId: string): void => {
    setCurrentAnalysisId(nextId);
    setSearchParams({ analysis_id: nextId }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Scientific summary"
        title="Results"
        description="Review pipeline-derived transit metrics, observation provenance, and the associated ML Core prediction."
        action={analysisId ? <Link to={`/analysis?analysis_id=${encodeURIComponent(analysisId)}`} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5">Open analysis workspace</Link> : undefined}
      />

      <div className="mt-8 space-y-7">
        <AnalysisReferenceForm initialValue={analysisId} onLoad={loadResults} isLoading={results.isFetching} />
        {!analysisId && (
          <div className="rounded-xl border border-white/8 bg-space-900/55 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-300">No scientific result selected</p>
            <p className="mt-2 text-sm text-slate-500">Enter an analysis reference or complete an analysis first.</p>
          </div>
        )}
        {results.isPending && analysisId && <LoadingPanel />}
        {results.isError && <ErrorPanel title="Scientific results unavailable" message="TransitLens could not load the scientific summary from the platform gateway." onRetry={() => void results.refetch()} />}
        {results.data && validation && !validation.isValid && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">Scientific results cannot be displayed</p>
            <p className="mt-2 text-sm text-slate-400">{validation.message}</p>
          </div>
        )}
        {results.data && validation?.isValid && (
          <>
            <ScientificMetricsPanel metrics={results.data.metrics} />
            {results.data.prediction ? (
              <PredictionCard prediction={results.data.prediction} />
            ) : (
              <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-5">
                <p className="text-sm font-semibold text-amber-200">Prediction not available</p>
                <p className="mt-2 text-sm text-slate-400">Run ML Core inference in the Analysis workspace to add a prediction summary.</p>
              </div>
            )}
            <MetadataPanel observation={results.data.observation} processing={results.data.processing} />
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
