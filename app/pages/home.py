"""Analysis Workspace - Default first page of TransitLens Platform."""
import streamlit as st
import time
import os
import numpy as np
from app import state, api_client
from app.utils import load_csv, InvalidCSVError

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
        "id": "candidate_a",
        "name": "Candidate A",
        "expected": "exoplanet_transit",
        "desc": "Shallow 1.3% transit candidate (Exoplanet Transit)",
        "sparkline": SPARKLINE_A,
        "accent": "var(--class-planet)",
    },
    {
        "id": "candidate_b",
        "name": "Candidate B",
        "expected": "eclipsing_binary",
        "desc": "Deep 18% primary + secondary eclipses (Eclipsing Binary)",
        "sparkline": SPARKLINE_B,
        "accent": "var(--class-binary)",
    },
    {
        "id": "candidate_c",
        "name": "Candidate C",
        "expected": "stellar_variability_or_other",
        "desc": "Pure stellar variability and red noise (Variability / Other)",
        "sparkline": SPARKLINE_C,
        "accent": "var(--class-noise)",
    },
]

def render():
    st.markdown("## 🔭 Analysis Workspace")
    st.markdown("Configure and execute exoplanet detection, transit fitting, and classification pipeline.")

    # 1. Target Selection
    st.markdown("### 1. Select Light Curve Source")
    source_mode = st.radio(
        "Data Source Type",
        ["Bundled Demonstration Targets", "TESS Target Identifier (MAST)", "Upload Custom Light Curve (CSV/FITS)"],
        horizontal=True
    )

    selected_target_id = None
    time_arr, flux_arr = None, None
    file_uploaded = None

    if source_mode == "Bundled Demonstration Targets":
        st.markdown("Select a predefined candidate case:")
        
        cols = st.columns(3)
        for idx, card in enumerate(CANDIDATE_CARDS):
            with cols[idx]:
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
                
                if st.button(f"Select {card['name']}", key=f"bundled_btn_{card['id']}", use_container_width=True):
                    st.session_state["selected_candidate"] = card['id']
                
        curr_cid = st.session_state.get("selected_candidate")
        if curr_cid:
            st.success(f"Selected: **{curr_cid.replace('_', ' ').capitalize()}**")
            selected_target_id = f"{curr_cid}"
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "demo_data", f"{curr_cid}.csv")
            if os.path.exists(csv_path):
                time_arr, flux_arr = load_csv(csv_path)

    elif source_mode == "TESS Target Identifier (MAST)":
        st.markdown("Fetch Sector photometry directly from MAST using target TIC ID:")
        
        def _set_tic(val):
            st.session_state["upload_tic"] = val
            
        st.markdown("Quick select:")
        cols = st.columns(3)
        cols[0].button("TIC 261136679 (Pi Mensae c)", on_click=_set_tic, args=("261136679",))
        cols[1].button("TIC 112838241 (WASP-126 b)", on_click=_set_tic, args=("112838241",))
        cols[2].button("TIC 25155310 (WASP-18 b)", on_click=_set_tic, args=("25155310",))

        tic_id = st.text_input("TIC ID", placeholder="e.g. 261136679", key="upload_tic").strip()
        selected_target_id = f"TIC-{tic_id}" if tic_id else None

    else:
        st.markdown("Upload a light curve file:")
        file_uploaded = st.file_uploader("Choose CSV or FITS file", type=["csv", "fits", "fits.gz"])
        if file_uploaded:
            selected_target_id = file_uploaded.name

    # 2. Pipeline settings
    st.write("")
    st.markdown("### 2. Configuration & Advanced Settings")
    
    col_mode, col_info = st.columns([1, 2])
    with col_mode:
        fit_level = st.radio(
            "Fitting Profile",
            ["quick", "standard", "rigorous"],
            help="Quick: Deterministic fit. Standard: Covariance uncertainties. Rigorous: MCMC sampler."
        )

    # Advanced Settings panel
    with st.expander("Advanced settings & thresholds"):
        col_adv1, col_adv2 = st.columns(2)
        with col_adv1:
            detrend_method = st.selectbox("Detrend Method", ["running_median", "polynomial"])
            detrend_window = st.number_input("Detrend Window (days)", min_value=0.1, max_value=10.0, value=1.5, step=0.1)
            bls_power_threshold = st.slider("BLS Power Threshold", 0.05, 0.50, 0.15, 0.01)
        with col_adv2:
            period_min = st.number_input("BLS Min Period (days)", min_value=0.1, max_value=50.0, value=0.5, step=0.1)
            period_max = st.number_input("BLS Max Period (days) [0 for Auto]", min_value=0.0, max_value=100.0, value=0.0, step=1.0)
            random_seed = st.number_input("Random Seed", min_value=1, max_value=99999, value=42)

    # Assemble config override dict
    config_override = {
        "preprocessing": {
            "detrend_method": detrend_method,
            "detrend_window_days": detrend_window
        },
        "bls": {
            "period_min_days": period_min,
            "bls_power_threshold": bls_power_threshold
        },
        "fitting": {
            "fitting_level": fit_level,
            "random_seed": int(random_seed)
        }
    }
    try:
        is_greater = float(period_max) > 0.0
    except (TypeError, ValueError):
        is_greater = False
    if is_greater:
        config_override["bls"]["period_max_days"] = period_max

    # 3. Action / Run Button
    st.write("")
    st.markdown("### 3. Run Pipeline")
    
    is_ready = (selected_target_id is not None) or (source_mode == "TESS Target Identifier (MAST)" and tic_id)
    run_btn = st.button("Run analysis 🔭", type="primary", disabled=not is_ready, use_container_width=True)

    if run_btn:
        _execute_pipeline(source_mode, selected_target_id, time_arr, flux_arr, file_uploaded, config_override)


def _execute_pipeline(source_mode, target_id, time_arr, flux_arr, file_uploaded, config_override):
    # Setup step-by-step progress tracking
    progress_bar = st.progress(0)
    status_text = st.empty()

    result = None

    try:
        if source_mode == "Bundled Demonstration Targets":
            for event in api_client.analyze_streaming(time_arr, flux_arr, target_id=target_id, config_override=config_override):
                progress_bar.progress(min(100, event["pct"]) / 100)
                status_text.text(event["msg"])
                if "result" in event:
                    result = event["result"]
        elif source_mode == "TESS Target Identifier (MAST)":
            clean_id = target_id.replace("TIC-", "").strip()
            # Clean numeric extraction
            clean_id = "".join(filter(str.isdigit, clean_id))
            for event in api_client.analyze_streaming(None, None, target_id=clean_id, metadata={"source": "tess_mast"}):
                progress_bar.progress(min(100, event["pct"]) / 100)
                status_text.text(event["msg"])
                if "result" in event:
                    result = event["result"]
        else:
            if file_uploaded.name.lower().endswith('.csv'):
                t_arr, f_arr = load_csv(file_uploaded)
                for event in api_client.analyze_streaming(t_arr, f_arr, target_id=target_id, config_override=config_override):
                    progress_bar.progress(min(100, event["pct"]) / 100)
                    status_text.text(event["msg"])
                    if "result" in event:
                        result = event["result"]
            else:
                st.error("File upload for non-CSV not yet supported in streaming mode.")
                return

        if result:
            state.set_result(result)
            state.set_page("results")
            st.rerun()
        else:
            st.error("Analysis completed but no result returned.")

    except InvalidCSVError as exc:
        st.error(f"Invalid CSV layout: {exc}")
    except Exception as exc:
        st.error(f"Pipeline Execution Failed: {exc}")
