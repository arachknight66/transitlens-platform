import Plotly from 'plotly.js/lib/core';
import scatterGl from 'plotly.js/lib/scattergl';
import createPlotlyComponent from 'react-plotly.js/factory';

Plotly.register([scatterGl]);

export const PlotlyChart = createPlotlyComponent(Plotly);

