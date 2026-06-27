"""Analysis Workspace - Default first page of TransitLens Platform."""
import streamlit as st
import time
import os
import numpy as np
from app import state, api_client
from app.utils import load_csv, InvalidCSVError

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
        candidates = [
            ("candidate_a", "🪐 Candidate A", "Shallow 1.3% transit candidate (Exoplanet Transit)"),
            ("candidate_b", "⭐ Candidate B", "Deep 18% primary + secondary eclipses (Eclipsing Binary)"),
            ("candidate_c", "📊 Candidate C", "Pure stellar variability and red noise (Variability / Other)"),
        ]
        
        cols = st.columns(3)
        for idx, (cid, label, desc) in enumerate(candidates):
            with cols[idx]:
                if st.button(f"{label}\n\n{desc}", key=f"bundled_btn_{cid}", use_container_width=True):
                    st.session_state["selected_candidate"] = cid
                    
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

    steps = [
        (10, "1. Loading target dataset..."),
        (25, "2. Preprocessing: outlier removal and detrending..."),
        (45, "3. Searching for periodic dips via BLS..."),
        (60, "4. Extracting 16 physical signal features..."),
        (75, "5. Running classifier model & rules..."),
        (90, "6. Fitting transit shape parameters & uncertainties..."),
        (100, "7. Generating diagnostic plots & evidence pack...")
    ]

    try:
        # Step progress representation
        for pct, msg in steps[:4]:
            progress_bar.progress(pct)
            status_text.text(msg)
            time.sleep(0.3)

        result = None
        if source_mode == "Bundled Demonstration Targets":
            result = api_client.analyze(time_arr, flux_arr, target_id=target_id, config_override=config_override)
        elif source_mode == "TESS Target Identifier (MAST)":
            clean_id = target_id.replace("TIC-", "").strip()
            # Clean numeric extraction
            clean_id = "".join(filter(str.isdigit, clean_id))
            result = api_client.analyze_tess(clean_id)
        else:
            if file_uploaded.name.lower().endswith('.csv'):
                t_arr, f_arr = load_csv(file_uploaded)
                result = api_client.analyze(t_arr, f_arr, target_id=target_id, config_override=config_override)
            else:
                result = api_client.analyze_file(file_uploaded, target_id=target_id)

        for pct, msg in steps[4:]:
            progress_bar.progress(pct)
            status_text.text(msg)
            time.sleep(0.3)

        if result:
            state.set_result(result)
            state.set_page("results")
            st.rerun()

    except InvalidCSVError as exc:
        st.error(f"Invalid CSV layout: {exc}")
    except Exception as exc:
        st.error(f"Pipeline Execution Failed: {exc}")
