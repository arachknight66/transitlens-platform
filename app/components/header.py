"""Page header appearing at top of every page."""
import streamlit as st
from app import state

def render(current_page: str):
    page_display_name = current_page.capitalize()
    
    is_connected = state.get_mlcore_connected()
    is_fallback = state.get_using_fallback()
    
    if is_fallback:
        dot_class = "fallback"
    elif is_connected:
        dot_class = "connected"
    else:
        dot_class = "disconnected"
        
    html = f'''
    <div class="header-breadcrumb">
        <span class="wordmark">TransitLens</span> / {page_display_name}
        <span style="float: right;">
            <span class="status-dot {dot_class}"></span>
        </span>
    </div>
    '''
    st.markdown(html, unsafe_allow_html=True)
