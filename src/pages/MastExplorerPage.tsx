import { ApiError } from '../api/client';
import { MastAuthentication } from '../components/MastAuthentication';
import { MastSearchForm } from '../components/MastSearchForm';
import { ObservationTable } from '../components/ObservationTable';
import { PageHeader } from '../components/PageHeader';
import { useMastSearch, useObservationDownload } from '../hooks/useMastExplorer';
import { useMastSession } from '../hooks/useMastSession';

const errorMessage = (error: Error): string =>
  error instanceof ApiError ? error.message : 'The platform gateway could not be reached. Please try again.';

const MastExplorerPage = () => {
  const session = useMastSession();
  const search = useMastSearch(session.token);
  const download = useObservationDownload(session.token);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Observation archive"
        title="MAST Explorer"
        description="Search supported MAST missions and request preferred light-curve FITS products through the TransitLens data pipeline."
      />

      <div className="mt-8 space-y-5">
        <MastAuthentication hasToken={session.token !== null} onSave={session.saveToken} onClear={session.removeToken} />
        <MastSearchForm onSearch={(criteria) => {
          search.mutate(criteria);
        }} isSearching={search.isPending} />

        {search.isError && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">Observation search failed</p>
            <p className="mt-2 text-sm text-slate-400">{errorMessage(search.error)}</p>
          </div>
        )}

        {download.isError && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
            <p className="text-sm font-semibold text-rose-200">Download failed</p>
            <p className="mt-2 text-sm text-slate-400">{errorMessage(download.error)}</p>
          </div>
        )}

        {download.data && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5" role="status">
            <p className="text-sm font-semibold text-emerald-200">{download.data.from_cache ? 'FITS file ready from cache' : 'FITS download complete'}</p>
            <p className="mt-2 break-all font-mono text-xs text-slate-400">{download.data.product_filename} · {download.data.path}</p>
          </div>
        )}

        {search.isPending && (
          <div className="rounded-xl border border-white/8 bg-space-900/70 px-5 py-12 text-center" role="status">
            <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-signal-400" aria-hidden="true" />
            <p className="mt-4 text-sm text-slate-400">Querying the MAST archive…</p>
          </div>
        )}

        {search.isSuccess && (
          <ObservationTable
            observations={search.data}
            downloadingId={download.isPending ? download.variables : undefined}
            onDownload={(mastId) => {
              download.mutate(mastId);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MastExplorerPage;
