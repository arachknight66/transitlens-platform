import { ErrorPanel } from '../components/ErrorPanel';
import { JobList } from '../components/JobList';
import { LoadingPanel } from '../components/LoadingPanel';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { StatusBadge } from '../components/StatusBadge';
import { StatusCard } from '../components/StatusCard';
import { useDashboardSummary } from '../hooks/useDashboardSummary';

const formatBytes = (bytes: number): string => {
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

const DashboardPage = () => {
  const summary = useDashboardSummary();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="System overview"
        title="Dashboard"
        description="Service health, model readiness, and recent observation activity across the TransitLens workspace."
        action={summary.data ? <p className="font-mono text-[10px] text-slate-600">Updated {formatDate(summary.data.generatedAt)}</p> : undefined}
      />

      <div className="mt-8">
        {summary.isPending && <LoadingPanel />}
        {summary.isError && <ErrorPanel title="Dashboard services are unavailable" onRetry={() => void summary.refetch()} />}
        {summary.data && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform status">
              <StatusCard label="System status" value={summary.data.systemState} detail={`${String(summary.data.services.length)} connected services`} status={summary.data.systemState} />
              <StatusCard label="Pipeline status" value={summary.data.pipelineState} detail="Data processing service" status={summary.data.pipelineState} />
              <StatusCard label="Model version" value={summary.data.modelVersion ?? 'Unavailable'} detail="ML Core active model" status={summary.data.modelVersion ? 'operational' : 'unknown'} />
              <StatusCard label="Active processing" value={String(summary.data.activeJobs.length)} detail="Jobs currently in queue" status={summary.data.activeJobs.length > 0 ? 'operational' : 'unknown'} />
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Panel title="Active processing jobs" description="Current pipeline activity">
                <JobList jobs={summary.data.activeJobs} emptyMessage="No active processing jobs." />
              </Panel>
              <Panel title="Connected services" description="Gateway-reported service health">
                {summary.data.services.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No services are connected.</p>
                ) : (
                  <ul className="divide-y divide-white/7">
                    {summary.data.services.map((service) => (
                      <li key={service.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm text-slate-200">{service.name}</p>
                          <p className="mt-1 text-xs text-slate-600">{service.latencyMs === undefined ? 'Latency unavailable' : `${String(service.latencyMs)} ms`}</p>
                        </div>
                        <StatusBadge status={service.state} />
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Recent analyses" description="Latest observation processing outcomes">
                <JobList jobs={summary.data.recentAnalyses} emptyMessage="No analyses have been run yet." />
              </Panel>
              <Panel title="Recent downloads" description="Latest observation files acquired">
                {summary.data.recentDownloads.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No observations have been downloaded yet.</p>
                ) : (
                  <ul className="divide-y divide-white/7">
                    {summary.data.recentDownloads.map((download) => (
                      <li key={download.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-slate-200">{download.filename}</p>
                          <p className="mt-1 text-xs text-slate-500">{download.target} · {formatDate(download.downloadedAt)}</p>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-slate-600">{formatBytes(download.sizeBytes)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
