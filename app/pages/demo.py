"""Demo page for offline/cached candidate analysis."""
import os
import time
import streamlit as st
from app import state, api_client
from app.utils import load_csv

# Candidate sparklines
SPARKLINE_A = """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,12 10,12 12,12 14,22 18,28 22,22 24,12 40,12 42,12 44,22 48,28 52,22 54,12 70,12 72,12 74,22 78,28 82,22 84,12 100,12 102,12 104,22 108,28 112,22 114,12 120,12"
    fill="none" stroke="rgba(138,129,242,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
"""

SPARKLINE_B = """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,8 15,8 20,8 30,36 40,8 55,8 60,8 70,36 80,8 95,8 100,8 110,36 120,8"
    fill="none" stroke="rgba(180,80,60,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
"""

SPARKLINE_C = """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,18 5,14 10,20 15,16 20,22 25,19 30,24 35,17 40,21 45,15 50,23 55,20 60,25 65,18 70,22 75,16 80,20 85,24 90,19 95,22 100,17 105,21 110,18 115,23 120,20"
    fill="none" stroke="rgba(136,135,128,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
"""

CANDIDATE_CARDS = [
    {
        "id": "a",
        "name": "Candidate A",
        "expected": "exoplanet_transit",
        "desc": "A shallow 1.3% periodic dip every 3.42 days consistent with a Jupiter-sized planet.",
        "sparkline": SPARKLINE_A,
        "accent": "var(--class-planet)",
    },
    {
        "id": "b",
        "name": "Candidate B",
        "expected": "eclipsing_binary",
        "desc": "A deep 18% V-shaped eclipse every 1.87 days characteristic of an eclipsing stellar binary.",
        "sparkline": SPARKLINE_B,
        "accent": "var(--class-binary)",
    },
    {
        "id": "c",
        "name": "Candidate C",
        "expected": "stellar_variability_or_other",
        "desc": "No periodic signal detected. Correlated red noise simulating stellar variability.",
        "sparkline": SPARKLINE_C,
        "accent": "var(--class-noise)",
    },
]

def render():
    st.markdown("## Interactive Demo")
    st.markdown("Select a candidate below to run the exoplanet detection and vetting pipeline.")
    
    # Render demo candidate cards with sparklines
    cols = st.columns(len(CANDIDATE_CARDS))
    for i, col in enumerate(cols):
        with col:
            card = CANDIDATE_CARDS[i]
            html = f"""
            <div style="border:1px solid rgba(255,255,255,0.08);border-left:4px solid {card['accent']};
                        border-radius:var(--radius-lg);padding:var(--space-md);margin-bottom:var(--space-md);
                        background:var(--bg-card);">
              {card['sparkline']}
              <div style="margin-top:var(--space-sm);margin-bottom:var(--space-md);">
                <div style="font-weight:600;font-size:var(--font-heading);color:var(--text-primary);margin-bottom:4px;">
                  {card['name']}
                </div>
                <div style="font-size:var(--font-body);color:var(--text-secondary);line-height:1.4;">
                  {card['desc']}
                </div>
              </div>
            </div>
            """
            st.markdown(html, unsafe_allow_html=True)
            
            if st.button(f"Analyze {card['name']}", key=f"demo_btn_{card['id']}", use_container_width=True):
                _run_demo_analysis(card['id'])
    
    # Comparison panel expander
    with st.expander("🔍 Compare all candidates side by side"):
        _show_comparison_panel()
    
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
    result = None
    
    try:
        if cid == "live_real":
            # Running live TESS MAST download and analysis
            for event in api_client.analyze_streaming(None, None, target_id="261136679", metadata={"source": "live_tess"}):
                progress_bar.progress(min(100, event["pct"]) / 100)
                status_text.text(event["msg"])
                if "result" in event:
                    result = event["result"]
        elif cid == "cached_real":
            # Running cached real offline fallback
            for event in api_client.analyze_streaming(None, None, target_id="TIC-364072092", metadata={"source": "cached_real"}):
                progress_bar.progress(min(100, event["pct"]) / 100)
                status_text.text(event["msg"])
                if "result" in event:
                    result = event["result"]
            st.session_state["using_fallback"] = True
        else:
            # Synthetic candidates
            csv_path = os.path.join("demo_data", f"candidate_{cid}.csv")
            time_arr, flux_arr = load_csv(csv_path)
            
            for event in api_client.analyze_streaming(time_arr, flux_arr, target_id=f"candidate_{cid}"):
                progress_bar.progress(min(100, event["pct"]) / 100)
                status_text.text(event["msg"])
                if "result" in event:
                    result = event["result"]
        
        if result:
            state.set_result(result)
            state.set_analysis_running(False)
            state.set_page("results")
            st.rerun()
        else:
            st.error("Analysis completed but no result returned.")
            state.set_analysis_running(False)
        
    except Exception as e:
        st.error(f"Analysis failed: {str(e)}")
        state.set_analysis_running(False)


def _show_comparison_panel():
    """Load and display side-by-side comparison of all candidates."""
    from app.components import comparison_panel
    
    all_results = {}
    for i, card in enumerate(CANDIDATE_CARDS):
        cid = card['id']
        try:
            result = api_client._load_fallback_result(f"candidate_{cid}")
            if result:
                all_results[f"candidate_{cid}"] = result
        except Exception:
            pass
    
    if all_results:
        comparison_panel.render(all_results)
    else:
        st.info("No candidate results available. Run an analysis first.")
