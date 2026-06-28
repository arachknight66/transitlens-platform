"""Plot component: periodogram."""
import streamlit as st
from app.utils import decode_plot

def render(result: dict):
    if not result:
        return
    plots = result.get("plots", {})
    img_str = plots.get("periodogram")
    if img_str:
        img = decode_plot(img_str)
        st.image(img, use_container_width=True)
    else:
        st.info("Periodogram plot not available.")


def render_skeleton() -> None:
    """Render a shimmer placeholder matching the plot dimensions."""
    st.markdown(
        '<div class="skeleton" style="height:300px;width:100%;border-radius:var(--radius-md);"></div>',
        unsafe_allow_html=True,
    )
