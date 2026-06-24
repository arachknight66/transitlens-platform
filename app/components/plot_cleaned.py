"""Plot component: cleaned lightcurve."""
import streamlit as st
from app.utils import decode_plot

def render(result: dict):
    if not result:
        return
    plots = result.get("plots", {})
    img_str = plots.get("cleaned_lightcurve")
    if img_str:
        img = decode_plot(img_str)
        st.image(img, use_container_width=True)
    else:
        st.info("Cleaned lightcurve plot not available.")
