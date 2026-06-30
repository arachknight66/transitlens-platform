import { useForm, useWatch } from 'react-hook-form';

import type { MastSearchCriteria, Mission, SearchIdentifier } from '../types/mast';

interface SearchFormValues {
  identifier: SearchIdentifier;
  value: string;
  mission: Mission | 'all';
}

const identifierLabels: Record<SearchIdentifier, string> = {
  target: 'Target name',
  tic: 'TIC ID',
  kepler: 'Kepler ID',
  observation: 'Observation ID',
};

export const MastSearchForm = ({ onSearch, isSearching }: { readonly onSearch: (criteria: MastSearchCriteria) => void; readonly isSearching: boolean }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<SearchFormValues>({
    defaultValues: { identifier: 'target', value: '', mission: 'all' },
  });
  const identifier = useWatch({ control, name: 'identifier' });

  const submit = (values: SearchFormValues): void => {
    onSearch({
      identifier: values.identifier,
      value: values.value.trim(),
      missions: values.mission === 'all' ? ['Kepler', 'K2', 'TESS'] : [values.mission],
      radiusDeg: 0.001,
      limit: 100,
    });
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submit)(event)} className="rounded-xl border border-white/8 bg-space-900/70 p-5" aria-label="Search MAST observations">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_2fr_0.8fr_auto] lg:items-end">
        <label className="block text-xs font-medium text-slate-400">
          Identifier
          <select {...register('identifier')} className="mt-2 w-full rounded-lg border border-white/10 bg-space-950 px-3 py-2.5 text-sm text-slate-200">
            {Object.entries(identifierLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-400">
          {identifierLabels[identifier]}
          <input
            {...register('value', {
              required: `${identifierLabels[identifier]} is required`,
              validate: (value) => {
                if ((identifier === 'tic' || identifier === 'kepler') && !/^\d+$/.test(value.trim())) return 'Enter digits only for this identifier';
                return true;
              },
            })}
            aria-invalid={errors.value ? 'true' : 'false'}
            placeholder={identifier === 'target' ? 'e.g. TOI-700' : `Enter ${identifierLabels[identifier]}`}
            className="mt-2 w-full rounded-lg border border-white/10 bg-space-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-700"
          />
          {errors.value && <span className="mt-1.5 block text-xs text-rose-300" role="alert">{errors.value.message}</span>}
        </label>
        <label className="block text-xs font-medium text-slate-400">
          Mission
          <select {...register('mission')} className="mt-2 w-full rounded-lg border border-white/10 bg-space-950 px-3 py-2.5 text-sm text-slate-200">
            <option value="all">All missions</option>
            <option value="TESS">TESS</option>
            <option value="Kepler">Kepler</option>
            <option value="K2">K2</option>
          </select>
        </label>
        <button type="submit" disabled={isSearching} className="rounded-lg bg-signal-400 px-5 py-2.5 text-sm font-semibold text-space-950 hover:bg-signal-300 disabled:cursor-wait disabled:opacity-60">
          {isSearching ? 'Searching…' : 'Search archive'}
        </button>
      </div>
    </form>
  );
};
