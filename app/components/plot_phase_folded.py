"""Plot component: phase folded."""
import streamlit as st
from app.utils import decode_plot

def render(result: dict):
    if not result:
        return
    plots = result.get("plots", {})
    img_str = plots.get("phase_folded")
    if img_str:
        img = decode_plot(img_str)
        if result.get("candidate_detected"):
            st.image(img, use_container_width=True, caption=f"Phase-folded at P = {result.get('period_days', 0):.4f} days")
        else:
            st.image(img, use_container_width=True, caption="Phase-folded")
    else:
        st.info("Phase-folded plot not available.")
