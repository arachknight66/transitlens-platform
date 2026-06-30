interface PageHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly action?: React.ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, action }: PageHeaderProps) => (
  <header className="flex flex-col justify-between gap-5 border-b border-white/8 pb-7 sm:flex-row sm:items-end">
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-signal-300 uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
    {action}
  </header>
);

