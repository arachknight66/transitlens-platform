import type { PredictionResult } from '../types/prediction';
import { ProbabilityGauge } from './ProbabilityGauge';

const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value));

export const PredictionCard = ({ prediction }: { readonly prediction: PredictionResult }) => {
  const detected = prediction.predicted_class === 1;

  return (
    <section className="overflow-hidden rounded-xl border border-white/8 bg-space-900/70" aria-labelledby="prediction-title">
      <header className="flex flex-col justify-between gap-3 border-b border-white/7 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.17em] text-slate-600 uppercase">ML Core inference</p>
          <h2 id="prediction-title" className="mt-1 text-lg font-semibold text-white">Prediction summary</h2>
        </div>
        <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-semibold sm:self-auto ${detected ? 'border-signal-400/25 bg-signal-400/10 text-signal-300' : 'border-slate-400/20 bg-slate-400/10 text-slate-300'}`}>
          {detected ? 'Transit candidate detected' : 'No transit detected'}
        </span>
      </header>

      <div className="grid gap-6 p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.85fr]">
        <ProbabilityGauge label="Transit probability" value={prediction.probability} accent="#45d6c5" />
        <ProbabilityGauge label="Decision confidence" value={prediction.confidence} accent="#58a6ff" />
        <dl className="grid content-center gap-3 border-t border-white/7 pt-5 text-xs md:col-span-2 xl:col-span-1 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
          <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Prediction</dt><dd className="font-medium text-slate-200">Class {String(prediction.predicted_class)}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Model version</dt><dd className="font-mono text-slate-300">{prediction.model_version}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Inference time</dt><dd className="font-mono text-slate-300">{prediction.inference_time.toFixed(2)} ms</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Generated</dt><dd className="text-right text-slate-400">{formatTimestamp(prediction.created_at)}</dd></div>
        </dl>
      </div>
    </section>
  );
};

