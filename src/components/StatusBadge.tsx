import type { JobState, ServiceState } from '../types/dashboard';

type Status = JobState | ServiceState;

const toneByStatus: Record<Status, string> = {
  operational: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  completed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  degraded: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  processing: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  queued: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  offline: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  failed: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  unknown: 'border-slate-400/20 bg-slate-400/10 text-slate-400',
};

export const StatusBadge = ({ status }: { readonly status: Status }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase ${toneByStatus[status]}`}>
    {status}
  </span>
);

