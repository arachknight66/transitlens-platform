"""Four metric cards: period, depth, duration, SNR."""
import streamlit as st
from app.utils import format_period, format_depth, format_duration

def render(result: dict):
    if not result:
        return

    detected = result.get("candidate_detected", False)
    cols = st.columns(4)

    with cols[0]:
        if detected:
            st.metric("Orbital Period", format_period(result.get("period_days", 0)))
        else:
            st.metric("Orbital Period", "—")

    with cols[1]:
        if detected:
            st.metric("Transit Depth", format_depth(result.get("depth", 0)))
        else:
            st.metric("Transit Depth", "—")

    with cols[2]:
        if detected:
            st.metric("Duration", format_duration(result.get("duration_days", 0)))
        else:
            st.metric("Duration", "—")

    with cols[3]:
        if detected and result.get("snr"):
            st.metric("SNR", f'{result["snr"]:.1f}σ')
        else:
            st.metric("SNR", "—")
