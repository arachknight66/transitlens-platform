import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AnalysisReferenceForm } from '../components/AnalysisReferenceForm';
import { ErrorPanel } from '../components/ErrorPanel';
import { LoadingPanel } from '../components/LoadingPanel';
import { PageHeader } from '../components/PageHeader';
import { ReportContentsPanel } from '../components/ReportContentsPanel';
import { ReportExportDialog } from '../components/ReportExportDialog';
import { useReportExport } from '../hooks/useReportExport';
import { useScientificResults } from '../hooks/useScientificResults';
import { getCurrentAnalysisId, setCurrentAnalysisId } from '../utils/analysisSession';
import { validateScientificResults } from '../utils/resultsValidation';

const ReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const analysisId = searchParams.get('analysis_id')?.trim() ?? getCurrentAnalysisId();
  const results = useScientificResults(analysisId);
  const exportReport = useReportExport(analysisId);
  const validation = results.data ? validateScientificResults(results.data) : null;

  const loadAnalysis = (nextId: string): void => {
    setCurrentAnalysisId(nextId);
    exportReport.reset();
    setIsDialogOpen(false);
    setSearchParams({ analysis_id: nextId }, { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Scientific export"
        title="Reports"
        description="Generate traceable scientific records from the selected analysis in PDF, JSON, or CSV format."
        action={analysisId ? <Link to={`/results?analysis_id=${encodeURIComponent(analysisId)}`} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5">Back to results</Link> : undefined}
      />

      <div className="mt-8 space-y-5">
        <AnalysisReferenceForm initialValue={analysisId} onLoad={loadAnalysis} isLoading={results.isFetching} />
        {!analysisId && (
          <div className="rounded-xl border border-white/8 bg-space-900/55 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-300">No analysis selected for export</p>
            <p className="mt-2 text-sm text-slate-500">Enter an analysis reference or open Reports from a scientific result.</p>
          </div>
        )}
        {results.isPending && analysisId && <LoadingPanel />}
        {results.isError && <ErrorPanel title="Report data unavailable" message="TransitLens could not load the selected scientific result for export." onRetry={() => void results.refetch()} />}
        {results.data && validation && !validation.isValid && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert"><p className="text-sm font-semibold text-rose-200">Report cannot be generated</p><p className="mt-2 text-sm text-slate-400">{validation.message}</p></div>
        )}
        {results.data && validation?.isValid && (
          <>
            <ReportContentsPanel results={results.data} />
            {results.data.prediction ? (
              <button type="button" onClick={() => { exportReport.reset(); setIsDialogOpen(true); }} className="w-full rounded-lg bg-signal-400 px-5 py-3 text-sm font-semibold text-space-950 hover:bg-signal-300">Choose export format</button>
            ) : (
              <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-5">
                <p className="text-sm font-semibold text-amber-200">Prediction required for report generation</p>
                <p className="mt-2 text-sm text-slate-400">Run ML Core inference so the report can include prediction, model version, and inference timing.</p>
                <Link to={`/analysis?analysis_id=${encodeURIComponent(analysisId)}`} className="mt-4 inline-flex rounded-lg border border-amber-300/25 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-300/10">Run inference</Link>
              </div>
            )}
          </>
        )}
      </div>

      {isDialogOpen && <ReportExportDialog exportReport={exportReport} onClose={() => { setIsDialogOpen(false); }} />}
    </div>
  );
};

export default ReportsPage;
