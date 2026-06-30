export const BrandMark = () => (
  <div className="flex items-center gap-3">
    <span className="relative grid h-9 w-9 place-items-center rounded-full border border-signal-400/50" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-signal-400 shadow-[0_0_14px_#45d6c5]" />
      <span className="absolute h-5 w-8 -rotate-12 rounded-[50%] border border-slate-400/50" />
    </span>
    <span>
      <span className="block text-sm font-semibold tracking-[0.16em] text-white uppercase">TransitLens</span>
      <span className="block text-[10px] tracking-[0.18em] text-slate-500 uppercase">Analysis Platform</span>
    </span>
  </div>
);

