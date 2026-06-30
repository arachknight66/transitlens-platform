import type { ServiceState } from '../types/dashboard';
import { StatusBadge } from './StatusBadge';

interface StatusCardProps {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly status?: ServiceState;
}

export const StatusCard = ({ label, value, detail, status }: StatusCardProps) => (
  <article className="rounded-xl border border-white/8 bg-space-900/75 p-5 shadow-lg shadow-black/10">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">{label}</p>
      {status && <StatusBadge status={status} />}
    </div>
    <p className="mt-5 truncate text-2xl font-semibold tracking-tight text-white" title={value}>{value}</p>
    <p className="mt-1.5 text-xs text-slate-500">{detail}</p>
  </article>
);

