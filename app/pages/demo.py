"""Demo page for offline/cached candidate analysis."""
import os
import time
import streamlit as st
from app import state, api_client
from app.utils import load_csv

def render():
    st.markdown("## Interactive Demo")
    st.markdown("Select a synthetic candidate below to run the analysis pipeline.")
    
    cols = st.columns(3)
    
    candidates = [
        {
            "id": "a",
            "emoji": "🪐",
            "name": "Candidate A",
            "expected": "exoplanet-like",
            "desc": "A shallow 1.3% periodic dip every 3.42 days — consistent with a Jupiter-sized planet"
        },
        {
            "id": "b",
            "emoji": "⭐",
            "name": "Candidate B",
            "expected": "eclipsing binary-like",
            "desc": "A deep 18% V-shaped eclipse every 1.87 days — characteristic of an eclipsing stellar binary"
        },
        {
            "id": "c",
            "emoji": "📊",
            "name": "Candidate C",
            "expected": "noise",
            "desc": "No periodic signal — correlated red noise simulating stellar variability"
        }
    ]
    
    for i, col in enumerate(cols):
        with col:
            c = candidates[i]
            st.markdown(f'<div class="candidate-card">', unsafe_allow_html=True)
            label = f"{c['emoji']} **{c['name']}**\n\n*Expected: {c['expected']}*\n\n{c['desc']}"
            if st.button(label, key=f"demo_btn_{c['id']}"):
                _run_demo_analysis(c['id'])
            st.markdown('</div>', unsafe_allow_html=True)
            
    if state.get_analysis_running():
        _show_progress()

def _run_demo_analysis(cid):
    state.set_selected_candidate(cid)
    state.set_analysis_running(True)
    st.rerun()

def _show_progress():
    cid = state.get_selected_candidate()
    if not cid:
        return
        
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    steps = [
        (15, "Loading light curve data..."),
        (30, "Preprocessing: removing outliers and detrending..."),
        (55, "Running BLS period search across 5,000+ period candidates..."),
        (70, "Extracting 11 diagnostic features from transit signal..."),
        (85, "Classifying signal type..."),
        (95, "Generating diagnostic plots..."),
        (100, "Building evidence pack...")
    ]
    
    try:
        csv_path = os.path.join("demo_data", f"candidate_{cid}.csv")
        time_arr, flux_arr = load_csv(csv_path)
        
        for pct, msg in steps:
            progress_bar.progress(pct)
            status_text.text(msg)
            time.sleep(0.4)
            
        result = api_client.analyze(time_arr, flux_arr, target_id=f"candidate_{cid}")
        state.set_result(result)
        state.set_analysis_running(False)
        state.set_page("results")
        st.rerun()
        
    except Exception as e:
        st.error(f"Analysis failed: {str(e)}")
        state.set_analysis_running(False)
