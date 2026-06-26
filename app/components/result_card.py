"""Result card — top-of-page bar showing target, class, and confidence."""
import streamlit as st
from app import state
from app.utils import class_display_name, class_emoji, format_confidence
from app.components import confidence_badge

def render(result: dict = None):
    if result is None:
        st.info("No analysis result yet. Run an analysis to see results here.")
        if st.button("Go to Demo →", key="result_card_goto_demo"):
            state.set_page("demo")
            st.rerun()
        return

    target_id = result.get("target_id", "Unknown")
    predicted_class = result.get("predicted_class", "noise_or_other")
    conf = result.get("confidence", 0.0)
    color = {
        "exoplanet_transit": "#3C3489",
        "eclipsing_binary": "#712B13",
        "blend_contamination": "#D48B00",
        "stellar_variability_or_other": "#444441",
        "exoplanet_like": "#3C3489",
        "eclipsing_binary_like": "#712B13",
        "noise_or_other": "#444441",
    }.get(predicted_class, "#444441")
    name = class_display_name(predicted_class)
    emoji = class_emoji(predicted_class)
    cached = " <span style='color:#888;font-size:12px;'>(cached)</span>" if state.get_using_fallback() else ""
    conf_pct = int(conf * 100)

    html = f'''
    <div style="
        display: flex; align-items: center; justify-content: space-between;
        background: rgba(83, 74, 183, 0.08);
        border-radius: 8px; padding: 16px 24px; margin-bottom: 16px;
    ">
        <div style="font-size: 18px; font-weight: 500; color: #FAFAFA;">
            {target_id}{cached}
        </div>
        <div>
            <span style="
                background-color: {color}; color: #FFF;
                padding: 6px 18px; border-radius: 20px;
                font-size: 15px; font-weight: 500;
            ">{emoji} {name}</span>
        </div>
        <div style="font-size: 28px; font-weight: 600; color: {color};">
            {conf_pct}%
        </div>
    </div>
    '''
    st.markdown(html, unsafe_allow_html=True)
