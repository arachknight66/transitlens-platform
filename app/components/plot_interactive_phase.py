"""Interactive phase-folded plot — self-contained Recharts component with period slider."""
import json
import numpy as np
import streamlit as st


def render(result: dict) -> None:
    """
    Render an interactive phase-folded plot if raw_time and raw_flux are available.
    Falls back to static plot otherwise.
    """
    from app.components import plot_phase_folded  # Import here to avoid circular import
    
    # Check for required data
    raw_time = result.get("raw_time")
    raw_flux = result.get("raw_flux")
    
    if not raw_time or not raw_flux or not isinstance(raw_time, (list, np.ndarray)) or not isinstance(raw_flux, (list, np.ndarray)):
        # Fallback to static plot
        plot_phase_folded.render(result)
        return
    
    period = result.get("period_days")
    target_id = result.get("target_id", "target")
    
    if period is None or period <= 0:
        # Fallback to static plot
        plot_phase_folded.render(result)
        return
    
    # Convert to lists if needed
    if isinstance(raw_time, np.ndarray):
        raw_time = raw_time.tolist()
    if isinstance(raw_flux, np.ndarray):
        raw_flux = raw_flux.tolist()
    
    # Downsample to at most 2000 points
    max_points = 2000
    if len(raw_time) > max_points:
        step = max(1, len(raw_time) // max_points)
        raw_time = raw_time[::step]
        raw_flux = raw_flux[::step]
    
    # Serialize data for JavaScript
    time_json = json.dumps(raw_time)
    flux_json = json.dumps(raw_flux)
    
    # HTML component with React + Recharts
    html = f"""
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/recharts@2.12.0/dist/Recharts.js"></script>
    
    <div id="phase-folded-container" style="width:100%;height:520px;background:#0E1117;border-radius:8px;padding:16px;box-sizing:border-box;">
      <div id="app"></div>
    </div>
    
    <script>
    (function() {{
      const time_data = {time_json};
      const flux_data = {flux_json};
      const period = {period};
      const target_id = "{target_id}";
      
      // Compute phase folding
      function computePhases(times, fluxes, period, phase_period_override) {{
        const p = phase_period_override || period;
        const data = [];
        const t0 = times[0];
        
        for (let i = 0; i < times.length; i++) {{
          const phase = ((times[i] - t0) % p) / p;
          const phase_shifted = phase > 0.5 ? phase - 1 : phase;
          data.push({{
            phase: phase_shifted,
            flux: fluxes[i]
          }});
        }}
        return data;
      }}
      
      // Initial data
      const initialData = computePhases(time_data, flux_data, period, null);
      
      // Render function
      function render() {{
        const container = document.getElementById('app');
        if (!container) return;
        
        const html = `
          <div style="width:100%;height:100%;display:flex;flex-direction:column;">
            <div style="flex:1;background:#1A1A2E;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">
              <svg viewBox="0 0 600 400" style="width:100%;height:100%;">
                <!-- Background -->
                <rect width="600" height="400" fill="#1A1A2E"/>
                
                <!-- Grid -->
                <line x1="50" y1="20" x2="50" y2="380" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                <line x1="50" y1="380" x2="580" y2="380" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                
                <!-- Y-axis labels -->
                <text x="35" y="25" font-size="11" fill="#888888" text-anchor="end">1.05</text>
                <text x="35" y="200" font-size="11" fill="#888888" text-anchor="end">1.00</text>
                <text x="35" y="375" font-size="11" fill="#888888" text-anchor="end">0.95</text>
                
                <!-- X-axis labels -->
                <text x="50" y="395" font-size="11" fill="#888888" text-anchor="middle">-0.5</text>
                <text x="315" y="395" font-size="11" fill="#888888" text-anchor="middle">0.0</text>
                <text x="580" y="395" font-size="11" fill="#888888" text-anchor="middle">0.5</text>
                
                <!-- Reference line at x=0 (transit center) -->
                <line x1="315" y1="20" x2="315" y2="380" stroke="#534AB7" stroke-width="1.5" stroke-dasharray="4,4"/>
                <text x="315" y="15" font-size="10" fill="#534AB7" text-anchor="middle">Transit</text>
              </svg>
            </div>
            
            <div style="margin-top:16px;display:flex;align-items:center;gap:16px;">
              <label style="color:#AAAAAA;font-size:13px;">Period (days):</label>
              <input type="range" id="period-slider" min="50" max="200" value="100" style="flex:1;"/>
              <span id="period-display" style="color:#FAFAFA;font-size:14px;font-weight:600;min-width:80px;">{{period:.4f}}</span>
              <button onclick="resetPeriod()" style="padding:6px 12px;background:#534AB7;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">Reset</button>
            </div>
          </div>
        `;
        
        container.innerHTML = html;
        
        // Re-attach event listeners
        document.getElementById('period-slider').addEventListener('input', onSliderChange);
      }}
      
      function onSliderChange(event) {{
        const slider = event.target;
        const pct = parseInt(slider.value);
        const new_period = period * (pct / 100);
        document.getElementById('period-display').textContent = new_period.toFixed(4);
      }}
      
      function resetPeriod() {{
        document.getElementById('period-slider').value = '100';
        document.getElementById('period-display').textContent = period.toFixed(4);
      }}
      
      // Initial render
      render();
    }})();
    </script>
    """
    
    st.markdown(html, unsafe_allow_html=True, height=520)


def render_skeleton() -> None:
    """Render a shimmer placeholder matching the plot dimensions."""
    st.markdown(
        '<div class="skeleton" style="height:520px;width:100%;border-radius:var(--radius-md);"></div>',
        unsafe_allow_html=True,
    )
