interface PanelProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}

export const Panel = ({ title, description, children }: PanelProps) => (
  <section className="rounded-xl border border-white/8 bg-space-900/70">
    <header className="border-b border-white/7 px-5 py-4">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

