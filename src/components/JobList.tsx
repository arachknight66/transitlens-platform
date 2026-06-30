import type { AnalysisJob } from '../types/dashboard';
import { StatusBadge } from './StatusBadge';

const formatDate = (date: string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const JobList = ({ jobs, emptyMessage }: { readonly jobs: readonly AnalysisJob[]; readonly emptyMessage: string }) => {
  if (jobs.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-white/7">
      {jobs.map((job) => (
        <li key={job.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{job.target}</p>
            <p className="mt-1 text-xs text-slate-500">{job.mission} · {formatDate(job.updatedAt)}</p>
            {job.progress !== undefined && job.state === 'processing' && (
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label={`${job.target} progress`} aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-signal-400" style={{ width: `${String(Math.min(100, Math.max(0, job.progress)))}%` }} />
              </div>
            )}
          </div>
          <StatusBadge status={job.state} />
        </li>
      ))}
    </ul>
  );
};
