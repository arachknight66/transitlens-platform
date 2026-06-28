"""Confidence triplet — shows SNR, classifier confidence, and transit count as three linked values."""
import streamlit as st
from app.utils import get_class_color_hex

def _status_color(value, thresholds: tuple) -> str:
    """Return a CSS custom property name for green/amber/red status."""
    lo, hi = thresholds
    if value is None:
        return "var(--text-muted)"
    if value >= hi:
        return "var(--status-green)"
    if value >= lo:
        return "var(--status-amber)"
    return "var(--status-red)"

def render(result: dict) -> None:
    """Render the three-value confidence triplet inline."""
    snr        = result.get("snr")
    confidence = result.get("confidence", 0.0)
    features   = result.get("features", {})
    t_count    = features.get("transit_count")
    detected   = result.get("candidate_detected", False)

    snr_color   = _status_color(snr,        thresholds=(4.0, 7.0))
    conf_color  = _status_color(confidence, thresholds=(0.5, 0.75))
    count_color = _status_color(t_count,    thresholds=(2,   3))

    snr_str     = f"{snr:.1f}" if snr is not None and detected else "—"
    conf_str    = f"{int(confidence * 100)}"
    count_str   = str(int(t_count)) if t_count is not None and detected else "—"

    html = f"""
    <div class="confidence-triplet">
      <div class="confidence-value-block">
        <div style="width:6px;height:6px;border-radius:50%;background:{snr_color};
                    display:inline-block;margin-bottom:4px;"></div>
        <div class="value">{snr_str}</div>
        <div class="unit">Detection SNR</div>
      </div>
      <div class="confidence-triplet-divider"></div>
      <div class="confidence-value-block">
        <div style="width:6px;height:6px;border-radius:50%;background:{conf_color};
                    display:inline-block;margin-bottom:4px;"></div>
        <div class="value">{conf_str}<span style="font-size:16px;font-weight:400;color:var(--text-muted)">%</span></div>
        <div class="unit">Classifier confidence</div>
      </div>
      <div class="confidence-triplet-divider"></div>
      <div class="confidence-value-block">
        <div style="width:6px;height:6px;border-radius:50%;background:{count_color};
                    display:inline-block;margin-bottom:4px;"></div>
        <div class="value">{count_str}</div>
        <div class="unit">Transit count</div>
      </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)
