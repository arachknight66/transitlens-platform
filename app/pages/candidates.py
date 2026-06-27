"""Candidate Explorer page for reviewing and filtering target outputs."""
import streamlit as st
import pandas as pd
import json
import os
from app import state

def render():
    st.markdown("## 🔍 Candidate Explorer")
    st.markdown("Review and search across all processed targets in the evaluation splits and gold sample sets.")

    # Load targets from sample_results.json and manifests
    results_dict = {}
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "demo_data", "sample_results.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                results_dict = json.load(f)
        except Exception:
            pass

    records = []
    for tid, res in results_dict.items():
        features = res.get("features", {})
        predicted_class = res.get("predicted_class", "stellar_variability_or_other")
        
        # Calculate blend risk
        crowding = features.get("crowding_metric", 1.0)
        centroid = features.get("centroid_shift", 0.0)
        blend_risk = "Low"
        if crowding < 0.8 or centroid > 0.015:
            blend_risk = "Suspected"
            
        records.append({
            "Target ID": tid,
            "Sector": res.get("metadata", {}).get("sector", "1"),
            "Predicted Class": predicted_class.replace("_", " ").capitalize(),
            "Confidence": f"{int(res.get('confidence', 0.0) * 100)}%",
            "Period (days)": round(res.get("period_days") or 0.0, 4) if res.get("period_days") else None,
            "Depth (%)": round((res.get("depth") or 0.0) * 100, 2) if res.get("depth") else None,
            "Duration (hours)": round((res.get("duration_days") or 0.0) * 24.0, 1) if res.get("duration_days") else None,
            "SNR": round(res.get("snr") or 0.0, 1) if res.get("snr") else None,
            "Blend Risk": blend_risk,
            "Fit Status": "SUCCESS" if res.get("candidate_detected") else "SKIPPED",
            "Warning Count": len(res.get("metadata", {}).get("quality_flags", [])) if "metadata" in res else 0,
        })

    if not records:
        st.info("No candidates processed yet in sample database.")
        return

    df = pd.DataFrame(records)

    # Filtering Sidebar / Columns
    st.markdown("### Filters")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        classes = ["All"] + list(df["Predicted Class"].unique())
        selected_class = st.selectbox("Predicted Class", classes)
    with col2:
        blend_options = ["All"] + list(df["Blend Risk"].unique())
        selected_blend = st.selectbox("Blend Risk", blend_options)
    with col3:
        fit_options = ["All", "SUCCESS", "SKIPPED"]
        selected_fit = st.selectbox("Fit Status", fit_options)
    with col4:
        search_query = st.text_input("Search Target ID", "").strip()

    # Apply filters
    filtered_df = df.copy()
    if selected_class != "All":
        filtered_df = filtered_df[filtered_df["Predicted Class"] == selected_class]
    if selected_blend != "All":
        filtered_df = filtered_df[filtered_df["Blend Risk"] == selected_blend]
    if selected_fit != "All":
        filtered_df = filtered_df[filtered_df["Fit Status"] == selected_fit]
    if search_query:
        filtered_df = filtered_df[filtered_df["Target ID"].str.contains(search_query, case=False)]

    # Display results
    st.markdown(f"**Showing {len(filtered_df)} of {len(df)} candidates**")
    
    st.dataframe(filtered_df, use_container_width=True, hide_index=True)

    # Interactive selection to load results
    st.markdown("### Inspect Candidate Result")
    target_to_load = st.selectbox("Select Target to Inspect", [""] + list(filtered_df["Target ID"]))
    
    if target_to_load:
        if st.button("Load Results", type="primary"):
            raw_res = results_dict.get(target_to_load)
            if raw_res:
                state.set_result(raw_res)
                state.set_page("results")
                st.rerun()
