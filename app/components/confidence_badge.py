"""Coloured class badge with confidence percentage."""
import streamlit as st
from app.utils import class_display_name, class_emoji, get_class_color_hex

def render(predicted_class: str, confidence: float):
    """Render a coloured pill with class name, emoji, and confidence."""
    color = get_class_color_hex(predicted_class)
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
