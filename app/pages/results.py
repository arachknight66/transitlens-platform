"""Results page showing full analysis output."""
import streamlit as st
from app import state
from app.components import (result_card, parameter_panel, plot_raw, 
                           plot_cleaned, plot_periodogram, plot_phase_folded, 
                           feature_table)
from export import generate_html, generate_csv, generate_pdf

def render():
    result = state.get_result()
    
    # 1. Result card
    result_card.render(result)
    
    if not result:
        return
        
    # 2. Parameter panel
    parameter_panel.render(result)
    
    st.write("---")
    
    # 3. Plot grid
    st.markdown("### Diagnostic Plots")
    plot_cols1 = st.columns(2)
    with plot_cols1[0]:
        st.markdown("<div class='plot-container'>", unsafe_allow_html=True)
        plot_raw.render(result)
        st.markdown("</div>", unsafe_allow_html=True)
    with plot_cols1[1]:
        st.markdown("<div class='plot-container'>", unsafe_allow_html=True)
        plot_cleaned.render(result)
        st.markdown("</div>", unsafe_allow_html=True)
        
    plot_cols2 = st.columns(2)
    with plot_cols2[0]:
        st.markdown("<div class='plot-container'>", unsafe_allow_html=True)
        plot_periodogram.render(result)
        st.markdown("</div>", unsafe_allow_html=True)
    with plot_cols2[1]:
        st.markdown("<div class='plot-container'>", unsafe_allow_html=True)
        plot_phase_folded.render(result)
        st.markdown("</div>", unsafe_allow_html=True)
        
    # 4. Explanation text box
    st.markdown("### Classification Reasoning")
    st.markdown(f'<div class="explanation-box">{result.get("explanation", "")}</div>', unsafe_allow_html=True)
    
    st.write("---")
    
    # 5. Two-column detail
    det_cols = st.columns(2)
    with det_cols[0]:
        st.markdown("### Extracted Features")
        feature_table.render(result)
        
    with det_cols[1]:
        st.markdown("### Classification Path")
        _render_classification_path(result)
        
    st.write("---")
    
    # 6. Export buttons
    st.markdown("### Export Evidence Pack")
    exp_cols = st.columns(3)
    
    target_id = result.get("target_id", "target")
    
    with exp_cols[0]:
        html_bytes = generate_html(result)
        st.download_button(
            label="📄 Download HTML Report",
            data=html_bytes,
            file_name=f"transitlens_{target_id}_report.html",
            mime="text/html",
            use_container_width=True
        )
        
    with exp_cols[1]:
        csv_bytes = generate_csv(result)
        st.download_button(
            label="📊 Download CSV Data",
            data=csv_bytes,
            file_name=f"transitlens_{target_id}_features.csv",
            mime="text/csv",
            use_container_width=True
        )
        
    with exp_cols[2]:
        config = state.get_config()
        pdf_enabled = config.get("export", {}).get("pdf_enabled", False)
        
        if pdf_enabled:
            pdf_bytes = generate_pdf(result)
            st.download_button(
                label="📑 Download PDF Summary",
                data=pdf_bytes,
                file_name=f"transitlens_{target_id}_summary.pdf",
                mime="application/pdf",
                use_container_width=True
            )
        else:
            st.button("📑 PDF Export (Disabled)", disabled=True, use_container_width=True)

def _render_classification_path(result):
    features = result.get("features", {})
    detected = result.get("candidate_detected", False)
    p_class = result.get("predicted_class", "")
    
    rules = [
        ("BLS Power > 0.01", features.get("bls_power", 0) > 0.01),
        ("SNR > 5.0", features.get("snr", 0) > 5.0),
    ]
    
    if detected:
        is_exo = (p_class == "exoplanet_like")
        rules.extend([
            ("Depth < 0.05", features.get("depth", 1.0) < 0.05 if is_exo else features.get("depth", 0) > 0.05),
            ("V-Shape Score < 0.5", features.get("v_shape_score", 1.0) < 0.5 if is_exo else features.get("v_shape_score", 0) > 0.5),
            ("Odd/Even Delta < 0.02", features.get("odd_even_depth_delta", 1.0) < 0.02 if is_exo else features.get("odd_even_depth_delta", 0) > 0.02),
        ])
        
    for name, passed in rules:
        icon = "✅" if passed else "❌"
        color = "#4CAF50" if passed else "#FF6B6B"
        st.markdown(f'<div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 3px solid {color};">{icon} <strong>{name}</strong></div>', unsafe_allow_html=True)
