"""Result card — top-of-page bar showing target, class, and confidence."""
import streamlit as st
from app import state
from app.utils import class_display_name

def render(result: dict = None):
    if result is None:
        st.info("No analysis result yet. Run an analysis to see results here.")
        if st.button("Go to Demo →", key="result_card_goto_demo"):
            state.set_page("demo")
            st.rerun()
        return

    target_id = result.get("target_id", "Unknown")
    cached = " <span style='color:#888;font-size:12px;'>(cached)</span>" if state.get_using_fallback() else ""
    
    st.markdown(f"### 🎯 Target: {target_id}{cached}", unsafe_allow_html=True)
    
    # 5-column layout for scientific separation
    cols = st.columns(5)
    
    # 1. Periodic Event Detected
    detected = result.get("candidate_detected", False)
    with cols[0]:
        val = "Yes" if detected else "No"
        st.metric("Event Detected", val, help="Indicates if a periodic transit-like signal was recovered by BLS")
        
    # 2. Astrophysical Class
    pred_class = result.get("predicted_class", "stellar_variability_or_other")
    with cols[1]:
        display_name = class_display_name(pred_class)
        st.metric("Astrophysical Class", display_name, help="Predicted class based on rules and calibrated ML classifier")
        
    # 3. Calibrated Probability
    conf = result.get("confidence", 0.0)
    with cols[2]:
        val = f"{int(conf * 100)}%" if detected or pred_class != "stellar_variability_or_other" else "—"
        st.metric("Calibrated Probability", val, help="Calibrated probability of the predicted class")
        
    # 4. Fit Status
    fit_status = result.get("fit_status", "SUCCESS")
    with cols[3]:
        if not detected:
            val = "N/A"
        elif fit_status == "SUCCESS":
            val = "Converged"
        elif fit_status in ("APPROXIMATE", "SUCCESS_WITH_WARNINGS"):
            val = "Approximate"
        else:
            val = "Failed"
        st.metric("Transit Fit Status", val, help="Convergence status of the Mandel-Agol physical model fit")
        
    # 5. Follow-up / Review
    with cols[4]:
        quality_flags = result.get("quality_flags", [])
        if pred_class == "review_required":
            val = "Required ⚠"
        elif not detected:
            val = "None"
        elif fit_status == "FAILED" or len(quality_flags) > 0:
            val = "Recommended ⚡"
        else:
            val = "None"
        st.metric("Review Requirement", val, help="Urgency of human review/vetting based on OOD/warnings")
        
    st.write("")


def render_skeleton() -> None:
    """Render a shimmer placeholder matching the result card dimensions."""
    st.markdown(
        '<div class="skeleton" style="height:64px;width:100%;margin-bottom:16px;"></div>',
        unsafe_allow_html=True,
    )
