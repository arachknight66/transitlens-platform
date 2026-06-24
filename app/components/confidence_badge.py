"""Coloured class badge with confidence percentage."""
import streamlit as st
from app.utils import class_display_name, class_emoji

COLOR_MAP = {
    "exoplanet_like": "#3C3489",
    "eclipsing_binary_like": "#712B13",
    "noise_or_other": "#444441",
}

def render(predicted_class: str, confidence: float):
    """Render a coloured pill with class name, emoji, and confidence."""
    color = COLOR_MAP.get(predicted_class, "#444441")
    name = class_display_name(predicted_class)
    emoji = class_emoji(predicted_class)
    conf_pct = int(confidence * 100)
    html = f'''
    <span style="
        background-color: {color};
        color: #FFFFFF;
        padding: 6px 18px;
        border-radius: 20px;
        font-size: 15px;
        font-weight: 500;
        display: inline-block;
        letter-spacing: 0.3px;
    ">{emoji} {name} &middot; {conf_pct}%</span>
    '''
    st.markdown(html, unsafe_allow_html=True)
