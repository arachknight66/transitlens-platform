const configuredSystems = ['React + TypeScript', 'Vite', 'Tailwind CSS', 'Application routing', 'API orchestration client'];

const ProjectSetupPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#132d49_0%,#07111f_52%)] px-6 py-12">
    <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-space-900/85 p-8 shadow-2xl shadow-black/30 backdrop-blur md:p-12" aria-labelledby="page-title">
      <p className="mb-3 font-mono text-xs tracking-[0.24em] text-signal-300 uppercase">TransitLens Platform</p>
      <h1 id="page-title" className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
        Scientific workspace foundation is operational.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
        The application shell is ready for the phased observation, analysis, and reporting workflows.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Configured systems">
        {configuredSystems.map((system) => (
          <li key={system} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
            <span className="h-2 w-2 rounded-full bg-signal-400 shadow-[0_0_10px_#45d6c5]" aria-hidden="true" />
            {system}
          </li>
        ))}
      </ul>
    </section>
  </main>
);

export default ProjectSetupPage;

