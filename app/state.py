"""
app/state.py — Session state manager.
Thin wrapper around st.session_state that defines all keys and their defaults,
provides typed getter/setter functions, and initialises all keys idempotently.
"""

import streamlit as st


# Complete session state schema — every key, type, and default defined in one place
DEFAULTS = {
    "page": "home",                    # str — current active page
    "result": None,                    # dict or None — most recent analysis result
    "selected_candidate": None,        # str or None — which demo candidate ("a", "b", "c")
    "analysis_running": False,         # bool — True while api_client.analyze() is in progress
    "using_fallback": False,           # bool — True if current result came from demo_data fallback
    "upload_filename": None,           # str or None — name of user-uploaded file
    "mlcore_connected": False,         # bool — last known health check result
    "last_health_check": None,         # float or None — Unix timestamp of last health check
    "export_html_ready": False,        # bool — True if HTML export generated for current result
    "upload_tic": "",                  # str — entered TIC ID in the upload page
    "config": None,                    # dict — platform configuration from config.yaml
}


def init():
    """Initialise all session state keys with their defaults if they don't already exist.
    Idempotent — safe to call on every rerun.
    """
    for key, default in DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = default


# ── Typed getters ──────────────────────────────────────────────

def get_page() -> str:
    return st.session_state.get("page", DEFAULTS["page"])

def get_result():
    return st.session_state.get("result", DEFAULTS["result"])

def get_selected_candidate():
    return st.session_state.get("selected_candidate", DEFAULTS["selected_candidate"])

def get_analysis_running() -> bool:
    return st.session_state.get("analysis_running", DEFAULTS["analysis_running"])

def get_using_fallback() -> bool:
    return st.session_state.get("using_fallback", DEFAULTS["using_fallback"])

def get_upload_filename():
    return st.session_state.get("upload_filename", DEFAULTS["upload_filename"])

def get_mlcore_connected() -> bool:
    return st.session_state.get("mlcore_connected", DEFAULTS["mlcore_connected"])

def get_last_health_check():
    return st.session_state.get("last_health_check", DEFAULTS["last_health_check"])

def get_export_html_ready() -> bool:
    return st.session_state.get("export_html_ready", DEFAULTS["export_html_ready"])

def get_config() -> dict:
    return st.session_state.get("config", DEFAULTS["config"])


# ── Typed setters ──────────────────────────────────────────────

def set_page(value: str):
    st.session_state["page"] = value

def set_result(value):
    st.session_state["result"] = value

def set_selected_candidate(value):
    st.session_state["selected_candidate"] = value

def set_analysis_running(value: bool):
    st.session_state["analysis_running"] = value

def set_using_fallback(value: bool):
    st.session_state["using_fallback"] = value

def set_upload_filename(value):
    st.session_state["upload_filename"] = value

def set_mlcore_connected(value: bool):
    st.session_state["mlcore_connected"] = value

def set_last_health_check(value):
    st.session_state["last_health_check"] = value

def set_export_html_ready(value: bool):
    st.session_state["export_html_ready"] = value

def set_config(value: dict):
    st.session_state["config"] = value
