declare module 'plotly.js/lib/core' {
  interface PlotlyCore {
    register: (modules: readonly unknown[]) => void;
  }

  const Plotly: PlotlyCore;
  export default Plotly;
}

declare module 'plotly.js/lib/scattergl' {
  const scatterGl: unknown;
  export default scatterGl;
}

