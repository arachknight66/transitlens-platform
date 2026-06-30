import type { UseMutationResult } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import type { PredictionResult } from '../types/prediction';
import { validatePrediction } from '../utils/predictionValidation';
import { PredictionCard } from './PredictionCard';

interface PredictionPanelProps {
  readonly prediction: UseMutationResult<PredictionResult, Error, void>;
}

export const PredictionPanel = ({ prediction }: PredictionPanelProps) => {
  const validation = prediction.data ? validatePrediction(prediction.data) : null;

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-4 rounded-xl border border-white/8 bg-space-900/70 p-5 sm:flex-row sm:items-center" aria-labelledby="inference-action-title">
        <div>
          <h2 id="inference-action-title" className="text-sm font-semibold text-slate-100">Transit inference</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Submit this processed analysis to the configured ML Core model.</p>
        </div>
        <button
          type="button"
          disabled={prediction.isPending}
          onClick={() => {
            prediction.mutate();
          }}
          className="rounded-lg bg-signal-400 px-5 py-2.5 text-sm font-semibold text-space-950 hover:bg-signal-300 disabled:cursor-wait disabled:opacity-60"
        >
          {prediction.isPending ? 'Running inference…' : prediction.data ? 'Run inference again' : 'Run inference'}
        </button>
      </section>

      {prediction.isPending && (
        <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-5" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-sky-200">ML Core inference in progress</p>
          <p className="mt-2 text-sm text-slate-400">This can take a moment when the model is warming up.</p>
        </div>
      )}
      {prediction.isError && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
          <p className="text-sm font-semibold text-rose-200">Inference failed</p>
          <p className="mt-2 text-sm text-slate-400">{prediction.error.message}</p>
          <button type="button" onClick={() => { prediction.mutate(); }} className="mt-4 rounded-lg border border-rose-300/25 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-300/10">Try again</button>
        </div>
      )}
      {prediction.data && validation && !validation.isValid && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5" role="alert">
          <p className="text-sm font-semibold text-rose-200">Prediction cannot be displayed</p>
          <p className="mt-2 text-sm text-slate-400">{validation.message}</p>
        </div>
      )}
      {prediction.data && validation?.isValid && (
        <>
          <PredictionCard prediction={prediction.data} />
          <div className="flex justify-end">
            <Link to={`/results?analysis_id=${encodeURIComponent(prediction.data.analysis_id)}`} className="rounded-lg border border-signal-400/25 px-4 py-2.5 text-xs font-semibold text-signal-300 hover:bg-signal-400/10">View scientific results</Link>
          </div>
        </>
      )}
    </div>
  );
};
