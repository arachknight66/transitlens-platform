"""
main.py — Streamlit entry point, page router, CSS injector.
This file does exactly four things:
1. Streamlit page config (must be the very first st call)
2. CSS injection from static/style.css
3. Session state initialisation
4. Page routing based on st.session_state.page
"""

import os
import streamlit as st

from app import state
from app.utils import load_config
from app.pages import home, demo, upload, results, about
from app.components import sidebar, header


# ── Task 1 — Streamlit page config (MUST be the first st call) ──
st.set_page_config(
    page_title="TransitLens",
    page_icon="🔭",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ── Task 2 — CSS injection ──
css_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


# ── Task 3 — Session state initialisation ──
state.init()

# Load config into session state if not already loaded
if state.get_config() is None:
    config = load_config()
    state.set_config(config)


# ── Render sidebar and header (appear on every page) ──
sidebar.render()
header.render(current_page=state.get_page())


# ── Task 4 — Page routing ──
PAGE_ROUTES = {
    "home": home.render,
    "demo": demo.render,
    "upload": upload.render,
    "results": results.render,
    "about": about.render,
}

current_page = state.get_page()
route_fn = PAGE_ROUTES.get(current_page, home.render)
route_fn()
