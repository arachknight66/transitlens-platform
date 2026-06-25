"""Upload page for custom data."""
import streamlit as st
import time
from app import state, api_client
from app.utils import load_csv, InvalidCSVError

def render():
    st.markdown("## Analyze Custom Data")
    
    tab1, tab2 = st.tabs(["Upload CSV", "TESS Target"])
    
    with tab1:
        st.markdown("Upload a light curve file (CSV or FITS) to run it through the TransitLens pipeline.")
        st.info("If CSV: must have `time` and `flux` columns. If FITS: will be parsed automatically.")
        
        uploaded_file = st.file_uploader("Choose a data file", type=["csv", "fits", "fit", "fits.gz"])
        target_name = st.text_input("Target Name (optional)", placeholder="e.g. TIC 123456789")
        
        if st.button("Analyse Data", type="primary", disabled=uploaded_file is None):
            _handle_upload(uploaded_file, target_name)
            
    with tab2:
        st.markdown("Fetch data directly from MAST for a given TESS Input Catalog (TIC) ID.")
        st.warning("Requires internet connection and ml-core to be running.")
        
        tic_id = st.text_input("TIC ID", placeholder="e.g. 261136679", key="upload_tic")
        
        st.markdown("Quick select:")
        cols = st.columns(3)
        if cols[0].button("TIC 261136679 (Pi Mensae c)"):
            st.session_state["upload_tic"] = "261136679"
            st.rerun()
        if cols[1].button("TIC 112838241 (WASP-126 b)"):
            st.session_state["upload_tic"] = "112838241"
            st.rerun()
        if cols[2].button("TIC 25155310 (WASP-18 b)"):
            st.session_state["upload_tic"] = "25155310"
            st.rerun()
            
        if st.button(
            "Fetch & Analyse",
            type="primary",
            disabled=not tic_id.strip(),
            help="Fetch TESS light curve from MAST or cache and run the pipeline."
        ):
            _handle_tess(tic_id)

def _handle_upload(uploaded_file, target_name):
    try:
        name = target_name if target_name else uploaded_file.name
        
        if uploaded_file.name.lower().endswith('.csv'):
            time_arr, flux_arr = load_csv(uploaded_file)
            with st.spinner("Analyzing light curve from CSV..."):
                result = api_client.analyze(time_arr, flux_arr, target_id=name)
        else:
            with st.spinner("Parsing and analyzing FITS file..."):
                result = api_client.analyze_file(uploaded_file, target_id=name)
            
        state.set_result(result)
        state.set_page("results")
        st.rerun()
        
    except InvalidCSVError as e:
        st.error(f"Invalid CSV format: {str(e)}")
    except Exception as e:
        st.error(f"Analysis failed: {str(e)}")

def _handle_tess(tic_id):
    try:
        clean_id = tic_id.upper().replace("TIC", "").replace("-", "").strip()
        with st.spinner(f"Fetching and analyzing TESS target TIC {clean_id}..."):
            result = api_client.analyze_tess(clean_id)
            
        state.set_result(result)
        state.set_page("results")
        st.rerun()
    except Exception as e:
        st.error(f"TESS Analysis failed: {str(e)}")

