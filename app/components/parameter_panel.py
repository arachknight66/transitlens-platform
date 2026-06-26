"""Rich parameter panel showing physical parameters, uncertainties, fit quality, and FAP."""
import streamlit as st
from app.utils import format_period, format_depth, format_duration

def render(result: dict):
    if not result:
        return

    detected = result.get("candidate_detected", False)
    
    # First row: primary parameters + uncertainties
    st.markdown("#### Primary Transit Parameters")
    cols1 = st.columns(4)

    with cols1[0]:
        if detected:
            val = format_period(result.get("period_days", 0))
            err = result.get("period_uncertainty_days")
            delta = f"± {err:.5f} d" if err is not None else None
            st.metric("Orbital Period", val, delta=delta, delta_color="off")
        else:
            st.metric("Orbital Period", "—")

    with cols1[1]:
        if detected:
            val = format_depth(result.get("depth", 0))
            err = result.get("depth_uncertainty")
            delta = f"± {err * 100:.3f}%" if err is not None else None
            st.metric("Transit Depth", val, delta=delta, delta_color="off")
        else:
            st.metric("Transit Depth", "—")

    with cols1[2]:
        if detected:
            val = format_duration(result.get("duration_days", 0))
            err = result.get("duration_uncertainty_days")
            delta = f"± {err * 24.0:.2f} hr" if err is not None else None
            st.metric("Duration", val, delta=delta, delta_color="off")
        else:
            st.metric("Duration", "—")

    with cols1[3]:
        if detected and result.get("snr") is not None:
            st.metric("Signal-to-Noise Ratio", f'{result["snr"]:.1f}σ')
        else:
            st.metric("Signal-to-Noise Ratio", "—")

    if detected:
        st.write("")
        st.markdown("#### Diagnostic & Fit Statistics")
        cols2 = st.columns(3)
        
        with cols2[0]:
            epoch = result.get("epoch_btjd")
            val_str = f"{epoch:.4f} BTJD" if epoch is not None else "—"
            st.metric("Epoch (T₀)", val_str)
            
        with cols2[1]:
            r2 = result.get("fit_quality")
            val_str = f"{r2:.3f}" if r2 is not None else "—"
            st.metric("Fit Quality (R²)", val_str)
            
        with cols2[2]:
            fap = result.get("bootstrap_fap")
            val_str = f"{fap:.4f}" if fap is not None else "—"
            # Highlight if FAP is small (highly significant)
            st.metric("False Alarm Prob (FAP)", val_str)
