import { useForm } from 'react-hook-form';

interface ReferenceFormValues {
  analysisId: string;
}

export const AnalysisReferenceForm = ({ initialValue, onLoad, isLoading }: { readonly initialValue: string; readonly onLoad: (analysisId: string) => void; readonly isLoading: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ReferenceFormValues>({
    defaultValues: { analysisId: initialValue },
  });

  return (
    <form onSubmit={(event) => void handleSubmit((values) => { onLoad(values.analysisId.trim()); })(event)} className="rounded-xl border border-white/8 bg-space-900/70 p-5" aria-label="Load processed analysis">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs font-medium text-slate-400">
          Analysis reference
          <input
            {...register('analysisId', { required: 'Enter an analysis reference.' })}
            placeholder="e.g. analysis-01J..."
            aria-invalid={errors.analysisId ? 'true' : 'false'}
            className="mt-2 w-full rounded-lg border border-white/10 bg-space-950 px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-700"
          />
          {errors.analysisId && <span className="mt-1.5 block text-xs text-rose-300" role="alert">{errors.analysisId.message}</span>}
        </label>
        <button type="submit" disabled={isLoading} className="rounded-lg bg-signal-400 px-5 py-2.5 text-sm font-semibold text-space-950 hover:bg-signal-300 disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Loading…' : 'Load analysis'}</button>
      </div>
    </form>
  );
};

