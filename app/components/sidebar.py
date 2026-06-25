"""Sidebar with navigation and status."""
import streamlit as st
from app import state
from app.utils import class_display_name, class_emoji, format_confidence

def render():
    with st.sidebar:
        # Navigation
        st.markdown("### Navigation")
        
        pages = {
            "home": "🏠 Home",
            "demo": "🔭 Demo",
            "upload": "📤 Upload",
            "results": "📊 Results",
            "about": "ℹ️ About"
        }
        
        current_page = state.get_page()
        
        for p, label in pages.items():
            is_active = (p == current_page)
            if st.button(label, key=f"nav_{p}", type="primary" if is_active else "secondary"):
                state.set_page(p)
                st.rerun()
                
        # Connection status
        st.markdown("---")
        st.markdown("### ml-core Status")
        
        is_connected = state.get_mlcore_connected()
        is_fallback = state.get_using_fallback()
        config = state.get_config()
        
        mlcore_url = "http://127.0.0.1:8000"
        if config and "mlcore" in config:
            mlcore_url = config["mlcore"].get("base_url", mlcore_url)
        
        if is_fallback:
            dot_class = "fallback"
            status_text = "using cached results"
        elif is_connected:
            dot_class = "connected"
            status_text = "connected"
        else:
            dot_class = "disconnected"
            status_text = "not reachable"
            
        html = f'''
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
            <span class="status-dot {dot_class}"></span> {status_text}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">
            {mlcore_url}
        </div>
        '''
        st.markdown(html, unsafe_allow_html=True)
        
        # Current result summary
        result = state.get_result()
        if result:
            st.markdown("---")
            st.markdown("### Current Analysis")
            
            target_id = result.get("target_id", "Unknown")
            predicted_class = result.get("predicted_class", "noise_or_other")
            conf = result.get("confidence", 0.0)
            
            name = class_display_name(predicted_class)
            emoji = class_emoji(predicted_class)
            conf_pct = int(conf * 100)
            
            st.markdown(f"**{target_id}**")
            st.markdown(f"{emoji} {name}")
            st.markdown(f"Confidence: {conf_pct}%")
            
            if st.button("View Full Results →", key="sidebar_view_results"):
                state.set_page("results")
                st.rerun()
