"""Rich parameter panel showing physical parameters, uncertainties, fit quality, and FAP."""
import streamlit as st
from app.utils import format_period, format_depth, format_duration

def render(result: dict):
    if not result:
        return

    detected = result.get("candidate_detected", False)
    fit_status = result.get("fit_status", "SUCCESS")
    quality_flags = result.get("quality_flags", [])

    # 1. Fit Status and Quality Flag Callout Banners
    if detected:
        if fit_status == "FAILED":
            st.error("❌ **Transit Fitting Failed**: Optimization failed to converge. Parameters shown below are approximate BLS grid values.")
        elif fit_status == "APPROXIMATE":
            st.info(f"ℹ️ **Approximate Fit**: Sampler or coverage constraints active. Warnings: {', '.join(quality_flags)}")
        elif fit_status == "SUCCESS_WITH_WARNINGS" or len(quality_flags) > 0:
            st.warning(f"⚠️ **Fit Succeeded with Warnings**: {', '.join(quality_flags)}")
        else:
            st.success("✅ **Scientific Fit Successful**: Parameters are converged with robust physical uncertainties.")

    # First row: primary parameters + uncertainties
    st.markdown("#### Primary Transit Parameters")
    cols1 = st.columns(4)

    with cols1[0]:
        if detected:
            val = format_period(result.get("period_days", 0))
            err = result.get("period_uncertainty_days")
            delta = f"± {err:.6f} d" if err is not None else None
            st.metric("Orbital Period", val, delta=delta, delta_color="off")
        else:
            st.metric("Orbital Period", "—")

    with cols1[1]:
        if detected:
            obs_depth = result.get("observed_depth")
            corr_depth = result.get("corrected_depth")
            depth_err = result.get("depth_uncertainty")
            
            val = format_depth(corr_depth if corr_depth is not None else result.get("depth", 0))
            delta = f"± {depth_err * 100:.3f}%" if depth_err is not None else None
            
            st.metric("Transit Depth (Corrected)", val, delta=delta, delta_color="off")
            if obs_depth and corr_depth and abs(obs_depth - corr_depth) > 1e-5:
                st.caption(f"Observed Depth: {obs_depth*100:.3f}%")
        else:
            st.metric("Transit Depth", "—")

    with cols1[2]:
        if detected:
            val = format_duration(result.get("duration_days", 0))
            err = result.get("duration_uncertainty_days")
            delta = f"± {err * 24.0:.2f} hr" if err is not None else None
            st.metric("Duration (T₁₄)", val, delta=delta, delta_color="off")
        else:
            st.metric("Duration", "—")

    with cols1[3]:
        if detected and result.get("snr") is not None:
            st.metric("Signal-to-Noise Ratio", f'{result["snr"]:.1f}σ')
        else:
            st.metric("Signal-to-Noise Ratio", "—")

    if detected:
        st.write("")
        st.markdown("#### Physical Companion & Orbit Properties")
        cols_phys = st.columns(4)
        
        with cols_phys[0]:
            rp_rstar = result.get("rp_rstar")
            rp_err_l = result.get("rp_rstar_err_lower")
            rp_err_u = result.get("rp_rstar_err_upper")
            if rp_rstar is not None:
                err_str = f" (+{rp_err_u:.4f} / -{rp_err_l:.4f})" if rp_err_l else ""
                st.metric("Radius Ratio (Rp/R*)", f"{rp_rstar:.4f}", delta=err_str if err_str else None, delta_color="off")
            else:
                st.metric("Radius Ratio (Rp/R*)", "—")
                
        with cols_phys[1]:
            rp_earth = result.get("planet_radius_earth")
            rpe_l = result.get("planet_radius_earth_err_lower")
            rpe_u = result.get("planet_radius_earth_err_upper")
            if rp_earth is not None:
                err_str = f" (+{rpe_u:.2f} / -{rpe_l:.2f}) R⊕" if rpe_l else " R⊕"
                st.metric("Planet Radius (Rp)", f"{rp_earth:.2f} R⊕", delta=err_str if err_str else None, delta_color="off")
            else:
                st.metric("Planet Radius (Rp)", "— (missing R*)")
                
        with cols_phys[2]:
            a_rstar = result.get("a_rstar")
            if a_rstar is not None:
                st.metric("Semi-major Axis (a/R*)", f"{a_rstar:.2f}")
            else:
                st.metric("Semi-major Axis (a/R*)", "—")
                
        with cols_phys[3]:
            inc = result.get("inclination_deg")
            b_val = result.get("b")
            if inc is not None:
                st.metric("Inclination (i)", f"{inc:.2f}°", delta=f"b = {b_val:.2f}" if b_val is not None else None, delta_color="off")
            else:
                st.metric("Inclination (i)", "—")

        st.write("")
        st.markdown("#### Diagnostic & Fit Statistics")
        cols2 = st.columns(4)
        
        with cols2[0]:
            epoch = result.get("epoch_btjd")
            val_str = f"{epoch:.4f} BTJD" if epoch is not None else "—"
            st.metric("Epoch (T₀)", val_str)
            
        with cols2[1]:
            r2 = result.get("fit_quality")
            val_str = f"{r2:.3f}" if r2 is not None else "—"
            reduced_chi2 = result.get("reduced_chi2")
            delta_str = f"χ²/dof = {reduced_chi2:.2f}" if reduced_chi2 is not None else None
            st.metric("Fit Quality (R²)", val_str, delta=delta_str, delta_color="off")
            
        with cols2[2]:
            fap = result.get("bootstrap_fap")
            val_str = f"{fap:.4f}" if fap is not None else "—"
            st.metric("False Alarm Prob (FAP)", val_str)
            
        with cols2[3]:
            mcmc_passed = result.get("mcmc_passed")
            rhat = result.get("mcmc_rhat")
            ess = result.get("mcmc_ess")
            if rhat is not None and ess is not None:
                status_str = "Passed" if mcmc_passed else "Warnings"
                st.metric("MCMC Convergence", status_str, delta=f"R̂={rhat:.2f}, ESS={ess}", delta_color="normal" if mcmc_passed else "inverse")
            else:
                st.metric("MCMC Convergence", "N/A (Quick Mode)")
