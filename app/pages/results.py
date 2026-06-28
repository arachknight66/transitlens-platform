"""Results page showing full analysis output with scientific review tabs."""
import streamlit as st
from app import state
from app.components import (result_card, parameter_panel, plot_raw, 
                           plot_cleaned, plot_periodogram, plot_phase_folded, 
                           feature_table, confidence_triplet)
from app.utils import get_class_config, get_class_color_hex, class_display_name
from export import generate_html, generate_csv, generate_pdf

def render():
    result = state.get_result()
    
    if not result:
        result_card.render(result)
        return
    
    # Show skeleton loading states if analysis is still running
    if state.get_analysis_running():
        result_card.render_skeleton()
        parameter_panel.render_skeleton()
        c1, c2 = st.columns(2)
        with c1:
            plot_phase_folded.render_skeleton()
        with c2:
            plot_raw.render_skeleton()
        st.stop()
    
    # Wrap entire content in page-content div for animations
    st.markdown('<div class="page-content">', unsafe_allow_html=True)
    
    # ── Section 1: Hero verdict bar (full width) ──────────────────────────────
    _render_hero_verdict_bar(result)
    
    # ── Section 2: Two-column hero ──────────────────────────────────────────
    _render_hero_section(result)
    
    st.write("")
    
    # ── Section 3: Parameter strip ──────────────────────────────────────────
    parameter_panel.render(result)
    
    st.write("")
    
    # ── Section 4: Three tabs ──────────────────────────────────────────
    tab_detection, tab_fit, tab_blend = st.tabs([
        "🔍 Detection evidence",
        "📐 Fit parameters",
        "👥 Blend diagnostics"
    ])
    
    with tab_detection:
        _render_detection_tab(result)
    
    with tab_fit:
        _render_fit_tab(result)
    
    with tab_blend:
        _render_blend_tab(result)
    
    st.write("")
    
    # ── Section 5: Secondary plot row ──────────────────────────────────────
    _render_secondary_plots(result)
    
    st.write("")
    
    # ── Section 6: Export strip ────────────────────────────────────────────
    _render_export_tab(result)
    
    st.markdown('</div>', unsafe_allow_html=True)


def _render_hero_verdict_bar(result: dict) -> None:
    """Render the hero verdict bar with target ID, class badge, and confidence triplet."""
    target_id = result.get("target_id", "Target")
    predicted_class = result.get("predicted_class", "stellar_variability_or_other")
    cfg = get_class_config(predicted_class)
    using_fallback = state.get_using_fallback() if hasattr(state, 'get_using_fallback') else False
    
    badge_label = f"{cfg['display']}"
    cached_badge = '<span style="font-size:var(--font-caption);color:var(--text-muted);margin-left:4px;">(cached)</span>' if using_fallback else ''
    
    html = f"""
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--primary-ultra-light);
                border-radius:var(--radius-lg);padding:var(--space-lg);border:1px solid rgba(83,74,183,0.12);
                margin-bottom:var(--space-lg);">
      <div style="font-size:var(--font-heading);font-weight:600;color:var(--text-primary);">
        {target_id}{cached_badge}
      </div>
      <div style="background:{cfg['color_hex']};color:#fff;padding:6px 16px;border-radius:var(--radius-pill);
                  font-size:var(--font-body);font-weight:500;">{badge_label}</div>
      <div style=""></div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def _render_hero_section(result: dict) -> None:
    """Render two-column hero with plots and explanation."""
    col_left, col_right = st.columns([3, 2])
    
    # Left: phase-folded plot
    with col_left:
        plot_phase_folded.render(result)
        period = result.get("period_days")
        if period:
            st.caption(f"Period: {period:.4f} days")
    
    # Right: class probability + explanation
    with col_right:
        # Class probabilities bar
        class_probs = result.get("class_probabilities", {})
        if class_probs:
            st.markdown("**Classification probabilities**")
            _render_class_probability_chart(class_probs)
            st.write("")
        
        # Explanation with expander
        explanation = result.get("explanation", "")
        if explanation:
            st.markdown("**Classification reasoning**")
            preview = explanation[:200] + "..." if len(explanation) > 200 else explanation
            st.markdown(f'<div class="explanation-box">{preview}</div>', unsafe_allow_html=True)
            
            if len(explanation) > 200:
                with st.expander("Read full reasoning"):
                    st.markdown(explanation)


def _render_secondary_plots(result: dict) -> None:
    """Render secondary plot row (raw, cleaned, periodogram, transit stack)."""
    st.markdown("#### Diagnostic Plots")
    
    # First row: raw and cleaned lightcurves
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("##### Raw Lightcurve")
        plot_raw.render(result)
    with col2:
        st.markdown("##### Cleaned Lightcurve")
        plot_cleaned.render(result)
    
    # Second row: periodogram and transit stack (if available)
    col3, col4 = st.columns(2)
    with col3:
        st.markdown("##### Periodogram")
        plot_periodogram.render(result)
    with col4:
        plots = result.get("plots", {})
        if plots.get("transit_stack"):
            st.markdown("##### Transit Stack")
            from app.utils import decode_plot
            img = decode_plot(plots["transit_stack"])
            st.image(img, use_container_width=True)
        else:
            st.markdown("##### —")
            st.info("Transit stack plot not available")


def _render_detection_tab(result):
    """Detection evidence tab with features and classification path."""
    det_cols = st.columns(2)
    
    with det_cols[0]:
        st.markdown("#### Extracted Features")
        feature_table.render(result)
        
    with det_cols[1]:
        st.markdown("#### Classification Path")
        _render_classification_path(result)


def _render_overview_tab(result):
    """Removed — functionality moved to main layout."""
    pass


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
        ("Transit Depth (Observed)", result.get("observed_depth") or result.get("depth"), result.get("observed_depth_uncertainty") or result.get("depth_uncertainty"), "fractional"),
        ("Transit Depth (Corrected)", result.get("corrected_depth"), result.get("corrected_depth_uncertainty"), "fractional"),
        ("Transit Duration", result.get("duration_days"), result.get("duration_uncertainty_days"), "days"),
        ("Epoch (T₀)", result.get("epoch_btjd"), None, "BTJD"),
        ("Radius Ratio (Rp/R*)", result.get("rp_rstar"), (result.get("rp_rstar_err_lower"), result.get("rp_rstar_err_upper")), "dimensionless"),
        ("Observed Transit Count", result.get("observed_transits"), None, "counts"),
        ("Transit Depth SNR", result.get("snr"), None, "σ"),
        ("Residual RMS", result.get("residual_rms"), None, "fractional"),
        ("Red-Noise Beta Factor", result.get("beta_factor"), None, "dimensionless"),
        ("Contamination Estimate", result.get("features", {}).get("contamination_ratio") or result.get("diagnostics", {}).get("blend", {}).get("contamination_ratio"), None, "dimensionless"),
    ]
    
    html = '<table class="feature-table"><thead><tr><th>Parameter</th><th>Value</th><th>Uncertainty</th><th>Unit</th></tr></thead><tbody>'
    for name, val, unc, unit in params:
        val_str = f"{val:.6f}" if val is not None else "—"
        if isinstance(unc, tuple):
            u_l, u_u = unc
            if u_l is not None and u_u is not None:
                unc_str = f"+{u_u:.6f} / -{u_l:.6f}"
            else:
                unc_str = "—"
        else:
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

    # Render new Phase 7 plots in the fit parameters tab
    plots = result.get("plots", {})
    transit_stack = plots.get("transit_stack")
    posterior_corner = plots.get("posterior_corner")
    alias_comparison = plots.get("alias_comparison")
    
    if transit_stack or posterior_corner or alias_comparison:
        st.write("")
        st.write("---")
        st.markdown("#### Publication-Quality Fit Visualizations")
        
        from app.utils import decode_plot
        
        if transit_stack:
            img = decode_plot(transit_stack)
            st.image(img, use_container_width=True, caption="Individual Transit Event Stack (Cycle-to-Cycle variation)")
            
        if posterior_corner or alias_comparison:
            cols_plots = st.columns(2)
            with cols_plots[0]:
                if posterior_corner:
                    img = decode_plot(posterior_corner)
                    st.image(img, use_container_width=True, caption="MCMC Joint Posterior Distributions (corner plot)")
            with cols_plots[1]:
                if alias_comparison:
                    img = decode_plot(alias_comparison)
                    st.image(img, use_container_width=True, caption="Folding Diagnostic Grid (P/2, P, 2P comparisons)")



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
