import type { ProcessedAnalysis } from '../src/types/analysis';
import { buildAnalysisPlot } from '../src/utils/analysisPlot';

const analysis = {
  analysis_id: 'a1', status: 'processed', source: { filename: 'curve.fits' },
  time: [1, 2], flux: [10, 11], normalized_flux: [1, 0.99], median_filtered_flux: [1, 1], wavelet_flux: [1, 0.995], quality: null, metadata: {}, features: {},
} satisfies ProcessedAnalysis;

describe('buildAnalysisPlot', () => {
  it('creates three aligned Plotly traces sharing one time axis', () => {
    const plot = buildAnalysisPlot(analysis, 'pan');
    expect(plot.data).toHaveLength(3);
    expect(plot.data).toEqual([
      expect.objectContaining({ yaxis: 'y', x: analysis.time }),
      expect.objectContaining({ yaxis: 'y2', x: analysis.time }),
      expect.objectContaining({ yaxis: 'y3', x: analysis.time }),
    ]);
    expect(plot.layout.dragmode).toBe('pan');
    expect(plot.config.scrollZoom).toBe(true);
  });
});
