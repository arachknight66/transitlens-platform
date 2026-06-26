"""Results page showing full analysis output with scientific review tabs."""
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
    
    # 3. Scientific tabs
    tab_overview, tab_detection, tab_fit, tab_blend, tab_export = st.tabs([
        "📊 Overview", "🔍 Detection", "📐 Fit Parameters", 
        "👥 Blend Diagnostics", "📦 Export"
    ])
    
    with tab_overview:
        _render_overview_tab(result)
    
    with tab_detection:
        _render_detection_tab(result)
    
    with tab_fit:
        _render_fit_tab(result)
    
    with tab_blend:
        _render_blend_tab(result)
    
    with tab_export:
        _render_export_tab(result)


def _render_overview_tab(result):
    """Overview tab with plots and classification reasoning."""
    
    # Class probabilities bar
    class_probs = result.get("class_probabilities", {})
    if class_probs:
        st.markdown("#### Class Probabilities")
        _render_class_probability_chart(class_probs)
        st.write("")
    
    # Plot grid
    st.markdown("#### Diagnostic Plots")
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
        
    # Explanation
    st.markdown("#### Classification Reasoning")
    st.markdown(f'<div class="explanation-box">{result.get("explanation", "")}</div>', unsafe_allow_html=True)


def _render_detection_tab(result):
    """Detection evidence tab with features and classification path."""
    det_cols = st.columns(2)
    with det_cols[0]:
        st.markdown("#### Extracted Features")
        feature_table.render(result)
        
    with det_cols[1]:
        st.markdown("#### Classification Path")
        _render_classification_path(result)


def _render_fit_tab(result):
    """Fit parameters tab with uncertainty details."""
    detected = result.get("candidate_detected", False)
    
    if not detected:
        st.info("No transit candidate detected — fit parameters are not available.")
        return
    
    st.markdown("#### Transit Parameter Estimates with Uncertainties")
    
    # Parameter table with uncertainties
    params = [
        ("Orbital Period", result.get("period_days"), result.get("period_uncertainty_days"), "days"),
        ("Transit Depth", result.get("depth"), result.get("depth_uncertainty"), "fractional"),
        ("Transit Duration", result.get("duration_days"), result.get("duration_uncertainty_days"), "days"),
        ("Epoch (T₀)", result.get("epoch_btjd"), None, "BTJD"),
    ]
    
    html = '<table class="feature-table"><thead><tr><th>Parameter</th><th>Value</th><th>Uncertainty</th><th>Unit</th></tr></thead><tbody>'
    for name, val, unc, unit in params:
        val_str = f"{val:.6f}" if val is not None else "—"
        unc_str = f"± {unc:.6f}" if unc is not None else "—"
        html += f'<tr><td><strong>{name}</strong></td><td>{val_str}</td><td>{unc_str}</td><td>{unit}</td></tr>'
    html += '</tbody></table>'
    st.markdown(html, unsafe_allow_html=True)
    
    st.write("")
    
    # Fit quality and significance
    st.markdown("#### Fit Quality & Significance")
    cols = st.columns(3)
    with cols[0]:
        r2 = result.get("fit_quality")
        st.metric("Fit Quality (R²)", f"{r2:.4f}" if r2 is not None else "—")
    with cols[1]:
        fap = result.get("bootstrap_fap")
        st.metric("Bootstrap FAP", f"{fap:.4f}" if fap is not None else "—")
    with cols[2]:
        snr = result.get("snr")
        st.metric("Signal-to-Noise", f"{snr:.1f}σ" if snr is not None else "—")
    
    # Significance interpretation
    fap = result.get("bootstrap_fap")
    if fap is not None:
        if fap < 0.01:
            st.success(f"**High significance**: FAP = {fap:.4f} — this signal has < 1% probability of arising from noise alone.")
        elif fap < 0.1:
            st.warning(f"**Moderate significance**: FAP = {fap:.4f} — signal is suggestive but requires additional confirmation.")
        else:
            st.error(f"**Low significance**: FAP = {fap:.4f} — signal cannot be confidently distinguished from noise.")


def _render_blend_tab(result):
    """Blend and crowding diagnostics tab."""
    features = result.get("features", {})
    detected = result.get("candidate_detected", False)
    
    if not detected:
        st.info("No transit candidate detected — blend diagnostics are not applicable.")
        return
    
    st.markdown("#### Crowding & Contamination Diagnostics")
    
    cols = st.columns(3)
    
    crowding = features.get("crowding_metric", 1.0)
    centroid = features.get("centroid_shift", 0.0)
    secondary = features.get("secondary_depth", 0.0)
    
    with cols[0]:
        color = "normal" if crowding >= 0.8 else "inverse"
        st.metric("Crowding Metric", f"{crowding:.3f}", 
                  delta="OK" if crowding >= 0.8 else "⚠ Low",
                  delta_color=color)
        
    with cols[1]:
        color = "normal" if centroid <= 0.015 else "inverse"
        st.metric("Centroid Shift", f"{centroid:.4f}", 
                  delta="OK" if centroid <= 0.015 else "⚠ High",
                  delta_color=color)
    
    with cols[2]:
        depth = features.get("depth", 0)
        ratio = secondary / depth if depth > 0 and secondary > 0 else 0.0
        st.metric("Secondary/Primary Ratio", f"{ratio:.3f}",
                  delta="OK" if ratio < 0.5 else "⚠ EB-like",
                  delta_color="normal" if ratio < 0.5 else "inverse")
    
    st.write("")
    
    # Interpretation panel
    st.markdown("#### Interpretation")
    warnings = []
    
    if crowding < 0.8:
        warnings.append(
            f"**Crowding metric** ({crowding:.3f}) is below the 0.80 threshold. "
            f"The photometric aperture may contain flux from nearby sources, "
            f"diluting the observed transit depth."
        )
    
    if centroid > 0.015:
        warnings.append(
            f"**Centroid shift** ({centroid:.4f}) exceeds the 0.015 threshold. "
            f"The transit signal source may be offset from the target star's position, "
            f"suggesting a nearby eclipsing contaminant."
        )
    
    if secondary > 0 and depth > 0 and (secondary / depth) > 0.5:
        warnings.append(
            f"**Secondary eclipse** detected with depth {secondary:.4f} "
            f"(ratio to primary: {secondary/depth:.2f}). This is characteristic "
            f"of an eclipsing binary system rather than a planet transit."
        )
    
    if warnings:
        for w in warnings:
            st.warning(w)
    else:
        st.success("All blend/crowding diagnostics are within normal bounds. "
                   "No evidence of contamination or nearby source confusion.")


def _render_export_tab(result):
    """Export evidence pack tab."""
    st.markdown("#### Export Evidence Pack")
    st.markdown("Download a complete evidence package for this analysis, "
               "including parameters, uncertainties, plots, model version, "
               "and dataset provenance.")
    
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
    
    # JSON provenance
    st.write("")
    st.markdown("#### Raw JSON Response")
    with st.expander("View raw pipeline output"):
        import json
        # Remove plot data from display (too large)
        display_result = {k: v for k, v in result.items() if k != "plots"}
        st.json(display_result)


def _render_class_probability_chart(class_probs: dict):
    """Renders a horizontal bar chart of class probabilities."""
    display_names = {
        "exoplanet_transit": "🪐 Exoplanet Transit",
        "eclipsing_binary": "⭐ Eclipsing Binary",
        "blend_contamination": "👥 Blend / Contamination",
        "stellar_variability_or_other": "📊 Variability / Other",
    }
    
    colors = {
        "exoplanet_transit": "#3C3489",
        "eclipsing_binary": "#712B13",
        "blend_contamination": "#D48B00",
        "stellar_variability_or_other": "#444441",
    }
    
    html_parts = []
    for cls in ["exoplanet_transit", "eclipsing_binary", "blend_contamination", "stellar_variability_or_other"]:
        prob = class_probs.get(cls, 0.0)
        pct = prob * 100
        name = display_names.get(cls, cls)
        color = colors.get(cls, "#666")
        
        html_parts.append(f'''
        <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-size: 13px;">{name}</span>
                <span style="font-size: 13px; font-weight: 600;">{pct:.1f}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.08); border-radius: 4px; height: 16px; overflow: hidden;">
                <div style="width: {pct}%; height: 100%; background: {color}; border-radius: 4px; transition: width 0.3s;"></div>
            </div>
        </div>
        ''')
    
    st.markdown("".join(html_parts), unsafe_allow_html=True)


def _render_classification_path(result):
    features = result.get("features", {})
    detected = result.get("candidate_detected", False)
    p_class = result.get("predicted_class", "")
    
    rules = [
        ("BLS Power > 0.01", features.get("bls_power", 0) > 0.01),
        ("SNR > 5.0", features.get("snr", 0) > 5.0),
    ]
    
    if detected:
        is_exo = p_class in ("exoplanet_like", "exoplanet_transit")
        is_blend = p_class == "blend_contamination"
        
        rules.extend([
            ("Depth < 0.05", features.get("depth", 1.0) < 0.05 if (is_exo or is_blend) else features.get("depth", 0) > 0.05),
            ("V-Shape Score < 0.4", features.get("v_shape_score", 1.0) < 0.4 if (is_exo or is_blend) else features.get("v_shape_score", 0) > 0.4),
            ("Odd/Even Delta < 0.02", features.get("odd_even_depth_delta", 1.0) < 0.02 if (is_exo or is_blend) else features.get("odd_even_depth_delta", 0) > 0.02),
        ])
        if is_blend:
            rules.append(("Centroid Shift > 0.015 OR Crowding < 0.8", features.get("centroid_shift", 0.0) > 0.015 or features.get("crowding_metric", 1.0) < 0.8))
        
    for name, passed in rules:
        icon = "✅" if passed else "❌"
        color = "#4CAF50" if passed else "#FF6B6B"
        st.markdown(f'<div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 3px solid {color};">{icon} <strong>{name}</strong></div>', unsafe_allow_html=True)
