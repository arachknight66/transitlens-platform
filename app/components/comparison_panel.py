"""Side-by-side comparison of all three demo candidates."""
import streamlit as st
from app import state
from app.utils import get_class_config, format_period, format_depth

# Import sparkline constants (same as in demo.py)
SPARKLINES = {
    "candidate_a": """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,12 10,12 12,12 14,22 18,28 22,22 24,12 40,12 42,12 44,22 48,28 52,22 54,12 70,12 72,12 74,22 78,28 82,22 84,12 100,12 102,12 104,22 108,28 112,22 114,12 120,12"
    fill="none" stroke="rgba(138,129,242,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
""",
    "candidate_b": """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,8 15,8 20,8 30,36 40,8 55,8 60,8 70,36 80,8 95,8 100,8 110,36 120,8"
    fill="none" stroke="rgba(180,80,60,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
""",
    "candidate_c": """
<svg viewBox="0 0 120 40" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <polyline
    points="0,18 5,14 10,20 15,16 20,22 25,19 30,24 35,17 40,21 45,15 50,23 55,20 60,25 65,18 70,22 75,16 80,20 85,24 90,19 95,22 100,17 105,21 110,18 115,23 120,20"
    fill="none" stroke="rgba(136,135,128,0.7)" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
""",
}


def render(results_dict: dict) -> None:
    """
    results_dict: {"candidate_a": result, "candidate_b": result, "candidate_c": result}
    Renders a three-column comparison grid.
    """
    if not results_dict:
        st.info("No candidates loaded for comparison.")
        return

    st.markdown("#### Side-by-side candidate comparison")
    cols = st.columns(3)

    for col, (tid, result) in zip(cols, results_dict.items()):
        with col:
            if result is None:
                st.info(f"No result for {tid}")
                continue
                
            cls    = result.get("predicted_class", "stellar_variability_or_other")
            cfg    = get_class_config(cls)
            period = result.get("period_days")
            depth  = result.get("depth")
            conf   = result.get("confidence", 0.0)

            period_str = format_period(period) if period else "No signal"
            depth_str  = format_depth(depth)   if depth  else "—"

            header_html = f"""
            <div style="border:1px solid rgba(255,255,255,0.08);border-left:4px solid {cfg['color_hex']};
                        border-radius:var(--radius-lg);padding:var(--space-md);margin-bottom:var(--space-sm);
                        background:var(--bg-card);">
              {SPARKLINES.get(tid, "")}
              <div style="margin-top:var(--space-sm);">
                <span style="background:{cfg['color_hex']};color:#fff;padding:3px 10px;
                             border-radius:var(--radius-pill);font-size:var(--font-caption);
                             font-weight:500;">{cfg['display']}</span>
              </div>
              <div style="margin-top:var(--space-sm);font-size:var(--font-body);color:var(--text-secondary);">
                Period: <strong style="color:var(--text-primary);">{period_str}</strong><br>
                Depth: <strong style="color:var(--text-primary);">{depth_str}</strong><br>
                Confidence: <strong style="color:var(--text-primary);">{int(conf*100)}%</strong>
              </div>
            </div>
            """
            st.markdown(header_html, unsafe_allow_html=True)

            if st.button("Load full results", key=f"compare_load_{tid}", use_container_width=True):
                state.set_result(result)
                state.set_page("results")
                st.rerun()
