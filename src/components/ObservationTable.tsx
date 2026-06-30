import type { Observation } from '../types/mast';

interface ObservationTableProps {
  readonly observations: readonly Observation[];
  readonly downloadingId?: string;
  readonly onDownload: (mastId: string) => void;
}

const formatJulianDate = (value: number | null): string => value === null ? '—' : value.toFixed(4);

export const ObservationTable = ({ observations, downloadingId, onDownload }: ObservationTableProps) => (
  <div className="overflow-hidden rounded-xl border border-white/8 bg-space-900/70">
    <div className="flex items-center justify-between border-b border-white/7 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">Available observations</h2>
        <p className="mt-1 text-xs text-slate-500">{String(observations.length)} results returned by the data pipeline</p>
      </div>
    </div>
    {observations.length === 0 ? (
      <p className="px-5 py-12 text-center text-sm text-slate-500">No matching observations were found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.025] text-[10px] tracking-[0.14em] text-slate-600 uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Target</th>
              <th scope="col" className="px-5 py-3 font-semibold">Mission</th>
              <th scope="col" className="px-5 py-3 font-semibold">Observation</th>
              <th scope="col" className="px-5 py-3 font-semibold">Product</th>
              <th scope="col" className="px-5 py-3 font-semibold">Time range (BJD)</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Available file</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/7">
            {observations.map((observation) => {
              const isDownloading = downloadingId === observation.mast_id;
              return (
                <tr key={observation.mast_id} className="hover:bg-white/[0.025]">
                  <td className="px-5 py-4 font-medium text-slate-200">{observation.target_name}</td>
                  <td className="px-5 py-4"><span className="rounded bg-sky-400/10 px-2 py-1 text-xs text-sky-300">{observation.mission}</span></td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{observation.observation_id}</td>
                  <td className="px-5 py-4 text-slate-400">{observation.product_type}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{formatJulianDate(observation.start_time)} – {formatJulianDate(observation.end_time)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={downloadingId !== undefined}
                      onClick={() => {
                        onDownload(observation.mast_id);
                      }}
                      className="rounded-lg border border-signal-400/25 px-3 py-2 text-xs font-semibold text-signal-300 hover:bg-signal-400/10 disabled:cursor-wait disabled:opacity-45"
                    >
                      {isDownloading ? 'Downloading…' : 'Download FITS'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
