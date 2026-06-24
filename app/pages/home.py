"""The home page with hero section and feature overview."""
import streamlit as st
from app import state

def render():
    # Hero section
    st.markdown('<div class="hero-section">', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        try:
            st.image("static/logo.svg", width=300)
        except Exception:
            st.markdown('<h1 style="font-size: 3em; color: var(--primary-color);">TransitLens</h1>', unsafe_allow_html=True)
        
        st.markdown('<p class="hero-tagline">AI-assisted exoplanet transit detection from TESS light curves</p>', unsafe_allow_html=True)
        st.markdown('<p class="hero-subtagline">DETECT &middot; CLASSIFY &middot; EXPLAIN &middot; EXPORT</p>', unsafe_allow_html=True)
        
        st.write("")
        if st.button("Try the Demo →", type="primary", use_container_width=True):
            state.set_page("demo")
            st.rerun()
            
    st.markdown('</div>', unsafe_allow_html=True)
    
    st.write("---")
    
    # Feature overview
    cols = st.columns(3)
    
    with cols[0]:
        st.markdown("### 🔭 BLS Transit Detection")
        st.markdown("We run Box Least Squares (BLS) period search across thousands of period candidates to find periodic dips in the light curve.")
        
    with cols[1]:
        st.markdown("### 🤖 Interpretable Classification")
        st.markdown("Our system uses a rule-based + ML classifier to distinguish true exoplanet candidates from eclipsing binaries and noise.")
        
    with cols[2]:
        st.markdown("### 📋 Full Evidence Pack")
        st.markdown("Every detection comes with phase-folded plots, 11 extracted features, and an offline-ready HTML export for review.")
        
    st.write("---")
    
    # Statistics row
    stats = st.columns(3)
    
    with stats[0]:
        st.markdown('<div class="stat-card"><div class="stat-number">3</div><div class="stat-label">Target Classes</div></div>', unsafe_allow_html=True)
        
    with stats[1]:
        st.markdown('<div class="stat-card"><div class="stat-number">11</div><div class="stat-label">Extracted Features</div></div>', unsafe_allow_html=True)
        
    with stats[2]:
        st.markdown('<div class="stat-card"><div class="stat-number">4</div><div class="stat-label">Diagnostic Plots per Analysis</div></div>', unsafe_allow_html=True)
        
    # Footer
    st.markdown('<div class="footer-text">Bharatiya Antariksh Hackathon 2026 &middot; PS7 &middot; Team TransitLens</div>', unsafe_allow_html=True)
