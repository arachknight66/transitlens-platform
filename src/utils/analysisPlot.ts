import type { Config, Data, Layout } from 'plotly.js';

import type { ProcessedAnalysis } from '../types/analysis';

export interface AnalysisPlotModel {
  readonly data: readonly Data[];
  readonly layout: Partial<Layout>;
  readonly config: Partial<Config>;
}

const axisStyle = {
  color: '#8494a8',
  gridcolor: 'rgba(148, 163, 184, 0.10)',
  linecolor: 'rgba(148, 163, 184, 0.18)',
  zeroline: false,
  fixedrange: false,
} as const;

export const buildAnalysisPlot = (
  analysis: ProcessedAnalysis,
  dragMode: 'pan' | 'zoom',
): AnalysisPlotModel => ({
  data: [
    {
      type: 'scattergl',
      mode: 'lines',
      name: 'Raw flux',
      x: analysis.time,
      y: analysis.flux,
      yaxis: 'y',
      line: { color: '#8ea6c4', width: 1 },
      hovertemplate: 'Time %{x:.5f}<br>Raw flux %{y:.6f}<extra></extra>',
    },
    {
      type: 'scattergl',
      mode: 'lines',
      name: 'Normalized flux',
      x: analysis.time,
      y: analysis.normalized_flux,
      yaxis: 'y2',
      line: { color: '#58a6ff', width: 1.2 },
      hovertemplate: 'Time %{x:.5f}<br>Normalized %{y:.6f}<extra></extra>',
    },
    {
      type: 'scattergl',
      mode: 'lines',
      name: 'Wavelet denoised',
      x: analysis.time,
      y: analysis.wavelet_flux,
      yaxis: 'y3',
      line: { color: '#45d6c5', width: 1.4 },
      hovertemplate: 'Time %{x:.5f}<br>Denoised %{y:.6f}<extra></extra>',
    },
  ],
  layout: {
    autosize: true,
    height: 760,
    margin: { l: 76, r: 24, t: 28, b: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#091525',
    font: { color: '#a7b4c5', family: 'Inter, ui-sans-serif, system-ui' },
    dragmode: dragMode,
    hovermode: 'x unified',
    showlegend: false,
    xaxis: {
      ...axisStyle,
      title: { text: 'Time (BJD)', font: { size: 11 } },
      anchor: 'y3',
      rangeslider: { visible: false },
    },
    yaxis: {
      ...axisStyle,
      title: { text: 'Raw flux', font: { size: 11 } },
      domain: [0.70, 1],
    },
    yaxis2: {
      ...axisStyle,
      title: { text: 'Normalized flux', font: { size: 11 } },
      domain: [0.35, 0.65],
      anchor: 'x',
    },
    yaxis3: {
      ...axisStyle,
      title: { text: 'Wavelet flux', font: { size: 11 } },
      domain: [0, 0.30],
      anchor: 'x',
    },
    annotations: [
      { text: 'RAW LIGHT CURVE', x: 0, xref: 'paper', xanchor: 'left', y: 1.035, yref: 'paper', showarrow: false, font: { color: '#788ba3', size: 10 } },
      { text: 'NORMALIZED CURVE', x: 0, xref: 'paper', xanchor: 'left', y: 0.685, yref: 'paper', showarrow: false, font: { color: '#58a6ff', size: 10 } },
      { text: 'WAVELET DENOISED CURVE', x: 0, xref: 'paper', xanchor: 'left', y: 0.335, yref: 'paper', showarrow: false, font: { color: '#45d6c5', size: 10 } },
    ],
  },
  config: {
    responsive: true,
    scrollZoom: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: { format: 'png', filename: `transitlens-${analysis.analysis_id}-curves`, scale: 2 },
  },
});

