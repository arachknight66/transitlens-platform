"""Feature table component."""
import streamlit as st

def render(result: dict):
    if not result:
        return
        
    features = result.get("features", {})
    
    html = '<table class="feature-table"><thead><tr><th>Feature</th><th>Value</th><th>Indicator</th></tr></thead><tbody>'
    
    # helper for formatting and colors
    def add_row(name, val, color):
        if val is None:
            val_str = "N/A"
        elif isinstance(val, float):
            val_str = f"{val:.4g}"
        else:
            val_str = str(val)
            
        return f'<tr><td>{name}</td><td>{val_str}</td><td><div style="width: 20px; height: 10px; background-color: {color}; border-radius: 2px;"></div></td></tr>'

    
    coral = "#FF6B6B"
    green = "#4CAF50"
    blue = "#534AB7"
    grey = "#888888"
    
    html += add_row("BLS Power", features.get("bls_power"), green)
    html += add_row("SNR", features.get("snr"), green)
    
    depth = features.get("depth", 0)
    depth_color = coral if depth is not None and depth > 0.05 else green
    html += add_row("Depth", features.get("depth"), depth_color)
    
    html += add_row("Odd/Even Depth Delta", features.get("odd_even_depth_delta"), coral)
    html += add_row("V-Shape Score", features.get("v_shape_score"), coral)
    html += add_row("Transit Count", features.get("transit_count"), blue)
    html += add_row("Local Noise", features.get("local_noise"), grey)
    html += add_row("Depth to Noise Ratio", features.get("depth_to_noise_ratio"), green)
    html += add_row("Phase Shape Kurtosis", features.get("phase_shape_kurtosis"), blue)
    html += add_row("Period (days)", features.get("period_days"), blue)
    html += add_row("Duration (days)", features.get("duration_days"), blue)
    
    html += '</tbody></table>'
    st.markdown(html, unsafe_allow_html=True)
