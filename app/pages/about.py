"""About page for TransitLens."""
import streamlit as st

def render():
    # Hero / Header
    st.markdown('''
    <div style="text-align: center; padding: 40px 0; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 40px;">
        <h1 style="font-size: 3rem; margin-bottom: 10px; color: #FFFFFF;">About TransitLens</h1>
        <p style="font-size: 1.2rem; color: #A0A0A0; max-width: 600px; margin: 0 auto;">
            A unified platform for AI-assisted exoplanet detection, interpretation, and analysis.
        </p>
    </div>
    ''', unsafe_allow_html=True)

    # Section 1: The Hackathon
    col1, col2 = st.columns([1.2, 1], gap="large")
    
    with col1:
        st.markdown('''
        <h3 style="color: #FAFAFA; border-bottom: 2px solid #534ab7; padding-bottom: 10px; display: inline-block;">
            🇮🇳 Bharatiya Antariksh Hackathon 2026
        </h3>
        ''', unsafe_allow_html=True)
        st.markdown("""
        **Problem Statement 7 (PS7)** challenges participants with developing an AI-assisted pipeline to detect exoplanet transits from TESS (Transiting Exoplanet Survey Satellite) light curves.

        The cosmos is vast, and TESS generates an immense amount of data. Manual inspection is no longer feasible. We need intelligent systems that not only find the proverbial needle in the haystack but also explain *why* it's a needle.
        """)
        
    with col2:
        st.info('''
        **Our Mission**  
        To build a platform that bridges the gap between raw astronomical data and interpretable, actionable insights for researchers. TransitLens acts as a multiplier for astronomers, highlighting the most promising candidates while providing the evidence needed to make informed decisions.
        ''')

    st.markdown("<br><br>", unsafe_allow_html=True)

    # Section 2: Architecture
    st.markdown('''
    <h3 style="color: #FAFAFA; border-bottom: 2px solid #534ab7; padding-bottom: 10px; display: inline-block; margin-bottom: 20px;">
        ⚙️ Platform Architecture
    </h3>
    ''', unsafe_allow_html=True)

    st.markdown("""
    TransitLens is divided into two primary, decoupled systems communicating via REST APIs. This ensures high availability, scalability, and robust offline capabilities.
    """)

    arch_col1, arch_col2 = st.columns(2)

    with arch_col1:
        st.markdown('''
        <div style="background: rgba(83, 74, 183, 0.05); border: 1px solid rgba(83, 74, 183, 0.2); border-radius: 8px; padding: 20px; height: 100%;">
            <h4 style="margin-top: 0; color: #8A81F2;">💻 Streamlit Frontend (This App)</h4>
            <p style="color: #D1D5DB; font-size: 0.95rem;">
                A highly interactive, state-driven dashboard that acts as the user interface. It is responsible for handling file uploads, rendering interactive plots, generating offline evidence packs, and managing the user session.
            </p>
            <ul style="color: #A0A0A0; font-size: 0.9rem;">
                <li>Stateful UI using <code>st.session_state</code></li>
                <li>Dynamic layout caching & plot rendering</li>
                <li>Jinja2 driven HTML report exports</li>
            </ul>
        </div>
        ''', unsafe_allow_html=True)

    with arch_col2:
        st.markdown('''
        <div style="background: rgba(255, 107, 107, 0.05); border: 1px solid rgba(255, 107, 107, 0.2); border-radius: 8px; padding: 20px; height: 100%;">
            <h4 style="margin-top: 0; color: #FF6B6B;">🧠 ML Core Backend</h4>
            <p style="color: #D1D5DB; font-size: 0.95rem;">
                A high-performance FastAPI server running in an isolated environment. It performs heavy computational tasks including signal preprocessing, Box-Least Squares (BLS) period searching, and model inference.
            </p>
            <ul style="color: #A0A0A0; font-size: 0.9rem;">
                <li>FastAPI + Uvicorn REST interfaces</li>
                <li>Rule-based + ML classifier pipeline</li>
                <li>Astropy + Lightkurve operations</li>
            </ul>
        </div>
        ''', unsafe_allow_html=True)

    st.markdown("<br><br>", unsafe_allow_html=True)

    # Section 3: The Team
    st.markdown('''
    <div style="text-align: center; margin-bottom: 30px;">
        <h3 style="color: #FAFAFA; border-bottom: 2px solid #534ab7; padding-bottom: 10px; display: inline-block;">
            👨‍🚀 Team TransitLens
        </h3>
        <p style="color: #A0A0A0; margin-top: 15px;">
            Built with ❤️ for the Hackathon by developers passionate about exploring the stars.
        </p>
    </div>
    ''', unsafe_allow_html=True)
    
    st.markdown('''
    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <div style="background: #1E1E1E; padding: 15px 30px; border-radius: 50px; border: 1px solid #333;">
            <span style="font-size: 1.1rem; color: #FFF;">✨ AI/ML Engineers</span>
        </div>
        <div style="background: #1E1E1E; padding: 15px 30px; border-radius: 50px; border: 1px solid #333;">
            <span style="font-size: 1.1rem; color: #FFF;">🚀 Frontend Devs</span>
        </div>
        <div style="background: #1E1E1E; padding: 15px 30px; border-radius: 50px; border: 1px solid #333;">
            <span style="font-size: 1.1rem; color: #FFF;">🔭 Astrophysicists</span>
        </div>
    </div>
    ''', unsafe_allow_html=True)
