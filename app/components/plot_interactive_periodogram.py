"""Interactive periodogram — self-contained Recharts component with period selection."""
import json
import numpy as np
import streamlit as st


def render(result: dict) -> None:
    """
    Render an interactive periodogram if bls_periods and bls_power are available.
    Falls back to static plot otherwise.
    """
    from app.components import plot_periodogram  # Import here to avoid circular import
    
    # Check for required data
    bls_periods = result.get("bls_periods")
    bls_power = result.get("bls_power_array") or result.get("bls_power")
    
    # Handle single BLS power value vs array
    if isinstance(bls_power, (int, float)):
        # Single value, fallback to static
        plot_periodogram.render(result)
        return
    
    if not bls_periods or not bls_power or not isinstance(bls_periods, (list, np.ndarray)) or not isinstance(bls_power, (list, np.ndarray)):
        # Fallback to static plot
        plot_periodogram.render(result)
        return
    
    period = result.get("period_days")
    
    if period is None or period <= 0:
        # Fallback to static plot
        plot_periodogram.render(result)
        return
    
    # Convert to lists if needed
    if isinstance(bls_periods, np.ndarray):
        bls_periods = bls_periods.tolist()
    if isinstance(bls_power, np.ndarray):
        bls_power = bls_power.tolist()
    
    # Ensure same length
    if len(bls_periods) != len(bls_power):
        plot_periodogram.render(result)
        return
    
    # Downsample to at most 1000 points
    max_points = 1000
    if len(bls_periods) > max_points:
        step = max(1, len(bls_periods) // max_points)
        bls_periods = bls_periods[::step]
        bls_power = bls_power[::step]
    
    # Serialize data for JavaScript
    periods_json = json.dumps(bls_periods)
    power_json = json.dumps(bls_power)
    
    # HTML component with inline SVG and interaction
    html = f"""
    <div id="periodogram-container" style="width:100%;height:350px;background:#0E1117;border-radius:8px;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;">
      <svg id="periodogram-svg" viewBox="0 0 600 300" style="flex:1;background:#1A1A2E;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">
        <!-- Will be populated by JavaScript -->
      </svg>
      
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px;color:#AAAAAA;">
        <span>Period aliases:</span>
        <span style="padding:2px 8px;background:rgba(255,255,255,0.08);border-radius:4px;cursor:pointer;" onclick="alert('P/2 = ' + ({period}/2).toFixed(4) + ' days')">P/2</span>
        <span style="padding:2px 8px;background:rgba(255,255,255,0.08);border-radius:4px;cursor:pointer;" onclick="alert('P = ' + {period}.toFixed(4) + ' days')">P</span>
        <span style="padding:2px 8px;background:rgba(255,255,255,0.08);border-radius:4px;cursor:pointer;" onclick="alert('2P = ' + ({period}*2).toFixed(4) + ' days')">2P</span>
      </div>
    </div>
    
    <script>
    (function() {{
      const periods = {periods_json};
      const power = {power_json};
      const detected_period = {period};
      
      // Find min/max for scaling
      const min_period = Math.min(...periods);
      const max_period = Math.max(...periods);
      const max_power = Math.max(...power);
      const min_power = Math.min(...power);
      
      // SVG dimensions
      const svg_width = 600;
      const svg_height = 300;
      const margin = {{ left: 50, right: 20, top: 20, bottom: 40 }};
      const plot_width = svg_width - margin.left - margin.right;
      const plot_height = svg_height - margin.top - margin.bottom;
      
      // Scale functions
      function scale_x(period) {{
        return margin.left + (period - min_period) / (max_period - min_period) * plot_width;
      }}
      
      function scale_y(power_val) {{
        return margin.top + plot_height - (power_val - min_power) / (max_power - min_power) * plot_height;
      }}
      
      // Draw SVG
      function draw_plot() {{
        const svg = document.getElementById('periodogram-svg');
        
        // Background
        let html = `<rect width="600" height="300" fill="#1A1A2E"/>`;
        
        // Grid lines
        html += `<line x1="${{margin.left}}" y1="${{margin.top}}" x2="${{margin.left}}" y2="${{margin.top + plot_height}}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
        html += `<line x1="${{margin.left}}" y1="${{margin.top + plot_height}}" x2="${{svg_width - margin.right}}" y2="${{margin.top + plot_height}}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
        
        // Data polyline
        let points = [];
        for (let i = 0; i < periods.length; i++) {{
          const x = scale_x(periods[i]);
          const y = scale_y(power[i]);
          points.push(x + ',' + y);
        }}
        html += `<polyline points="${{points.join(' ')}}" fill="none" stroke="#8A81F2" stroke-width="1.5" opacity="0.7"/>`;
        
        // Detected period reference line
        const det_x = scale_x(detected_period);
        html += `<line x1="${{det_x}}" y1="${{margin.top}}" x2="${{det_x}}" y2="${{margin.top + plot_height}}" stroke="#534AB7" stroke-width="2" stroke-dasharray="4,4"/>`;
        html += `<text x="${{det_x}}" y="${{margin.top - 5}}" font-size="10" fill="#534AB7" text-anchor="middle">P</text>`;
        
        // Alias lines (P/2, 2P)
        const p2_x = scale_x(detected_period / 2);
        html += `<line x1="${{p2_x}}" y1="${{margin.top}}" x2="${{p2_x}}" y2="${{margin.top + plot_height}}" stroke="#FF6B6B" stroke-width="1" stroke-dasharray="2,2" opacity="0.5"/>`;
        
        const p2_x2 = scale_x(detected_period * 2);
        html += `<line x1="${{p2_x2}}" y1="${{margin.top}}" x2="${{p2_x2}}" y2="${{margin.top + plot_height}}" stroke="#4CAF50" stroke-width="1" stroke-dasharray="2,2" opacity="0.5"/>`;
        
        // Axis labels
        html += `<text x="${{margin.left + plot_width/2}}" y="${{svg_height - 5}}" font-size="12" fill="#888888" text-anchor="middle">Period (days)</text>`;
        html += `<text x="15" y="${{margin.top + plot_height/2}}" font-size="12" fill="#888888" text-anchor="middle" transform="rotate(-90 15 ${{margin.top + plot_height/2}})">BLS Power</text>`;
        
        svg.innerHTML = html;
      }}
      
      draw_plot();
    }})();
    </script>
    """
    
    st.markdown(html, unsafe_allow_html=True)


def render_skeleton() -> None:
    """Render a shimmer placeholder matching the plot dimensions."""
    st.markdown(
        '<div class="skeleton" style="height:350px;width:100%;border-radius:var(--radius-md);"></div>',
        unsafe_allow_html=True,
    )
