"""
app/api_client.py — The bridge to ml-core.
One public function (analyze) and one private helper (health_check).
Implements the offline fallback path using demo_data/sample_results.json.
"""

import json
import os
import time

import numpy as np
import requests
import streamlit as st

from app.utils import load_config


class MLCoreUnavailableError(Exception):
    """Raised when ml-core is unreachable and no fallback is available."""
    pass


def _get_config():
    """Load the mlcore section of config.yaml."""
    config = load_config()
    return config.get("mlcore", {})


def _load_fallback_result(target_id: str):
    """Load a pre-computed result from demo_data/sample_results.json.
    Returns the result dict for the given target_id, or None if not found.
    """
    json_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "demo_data",
        "sample_results.json",
    )
    if not os.path.exists(json_path):
        return None
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            all_results = json.load(f)
        return all_results.get(target_id, None)
    except (json.JSONDecodeError, IOError):
        return None


def health_check() -> bool:
    """Call GET {base_url}/health with a short timeout.
    Returns True if HTTP 200 with {"status": "ok"}, False otherwise.
    Never raises an exception to the caller.
    """
    cfg = _get_config()
    base_url = cfg.get("base_url", "http://127.0.0.1:8000")
    timeout = cfg.get("health_check_timeout", 3)
    try:
        resp = requests.get(f"{base_url}/health", timeout=timeout)
        if resp.status_code == 200:
            body = resp.json()
            return body.get("status") == "ok"
        return False
    except Exception:
        return False


def analyze(time_arr, flux_arr, target_id: str, metadata=None, config_override=None) -> dict:
    """The only function the rest of the platform ever calls to get analysis results.

    Steps:
    1. If demo_fallback enabled AND pre-computed result exists — check health first.
       If unhealthy, return fallback. If healthy, proceed to step 2.
    2. Build request payload.
    3. POST /analyze with timeout.
    4. On failure: return fallback or raise MLCoreUnavailableError.
    """
    cfg = _get_config()
    base_url = cfg.get("base_url", "http://127.0.0.1:8000")
    timeout = cfg.get("timeout_seconds", 30)
    demo_fallback = cfg.get("demo_fallback", True)

    fallback_result = _load_fallback_result(target_id) if demo_fallback else None

    # Step 1 — Check health if fallback is available
    if fallback_result is not None:
        is_healthy = health_check()
        if not is_healthy:
            st.session_state["using_fallback"] = True
            st.session_state["mlcore_connected"] = False
            return fallback_result
        st.session_state["mlcore_connected"] = True
    else:
        is_healthy = health_check()
        st.session_state["mlcore_connected"] = is_healthy

    # Step 2 — Build request payload
    time_list = time_arr.tolist() if isinstance(time_arr, np.ndarray) else list(time_arr)
    flux_list = flux_arr.tolist() if isinstance(flux_arr, np.ndarray) else list(flux_arr)

    payload = {
        "time": time_list,
        "flux": flux_list,
        "target_id": target_id,
        "metadata": metadata,
    }
    if config_override is not None:
        payload["config"] = config_override

    # Step 3 — Send POST /analyze (with 1 retry on timeout)
    last_error = None
    for attempt in range(2):
        try:
            resp = requests.post(
                f"{base_url}/analyze",
                json=payload,
                timeout=timeout,
            )
            if resp.status_code == 200:
                st.session_state["using_fallback"] = False
                return resp.json()
            elif resp.status_code == 422:
                error_detail = resp.json().get("detail", "Validation error")
                raise MLCoreUnavailableError(f"ml-core validation error: {error_detail}")
            else:
                last_error = f"ml-core returned HTTP {resp.status_code}"
        except requests.exceptions.Timeout:
            last_error = "ml-core request timed out"
            if attempt == 0:
                continue  # Retry once on timeout
        except requests.exceptions.ConnectionError:
            last_error = "ml-core is not reachable"
            break  # No retry on connection error
        except MLCoreUnavailableError:
            raise  # Re-raise validation errors
        except Exception as e:
            last_error = str(e)
            break

    # Step 4 — Fallback or raise
    if fallback_result is not None:
        st.session_state["using_fallback"] = True
        return fallback_result

    raise MLCoreUnavailableError(
        f"ml-core is unavailable ({last_error}). "
        "No cached results available for this target. "
        "Try the Demo page for pre-computed results."
    )


def analyze_file(uploaded_file, target_id: str, metadata=None) -> dict:
    """Uploads a FITS file directly to ml-core's file analysis endpoint."""
    cfg = _get_config()
    base_url = cfg.get("base_url", "http://127.0.0.1:8000")
    timeout = cfg.get("timeout_seconds", 30)

    is_healthy = health_check()
    st.session_state["mlcore_connected"] = is_healthy

    files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "application/octet-stream")}
    data = {
        "target_id": target_id,
        "metadata": json.dumps(metadata or {})
    }

    last_error = None
    for attempt in range(2):
        try:
            resp = requests.post(
                f"{base_url}/analyze/file",
                files=files,
                data=data,
                timeout=timeout,
            )
            if resp.status_code == 200:
                st.session_state["using_fallback"] = False
                return resp.json()
            elif resp.status_code == 422:
                error_detail = resp.json().get("detail", "Validation error")
                raise MLCoreUnavailableError(f"ml-core validation error: {error_detail}")
            else:
                last_error = f"ml-core returned HTTP {resp.status_code}"
        except requests.exceptions.Timeout:
            last_error = "ml-core request timed out"
            if attempt == 0:
                continue
        except requests.exceptions.ConnectionError:
            last_error = "ml-core is not reachable"
            break
        except MLCoreUnavailableError:
            raise
        except Exception as e:
            last_error = str(e)
            break

    raise MLCoreUnavailableError(
        f"ml-core is unavailable ({last_error}). "
        "Try the Demo page for pre-computed results."
    )


def analyze_tess(tic_id: str, sector: int = None, metadata=None) -> dict:
    """Sends a request to ml-core's TESS analysis endpoint by TIC ID."""
    cfg = _get_config()
    base_url = cfg.get("base_url", "http://127.0.0.1:8000")
    timeout = cfg.get("timeout_seconds", 30)

    is_healthy = health_check()
    st.session_state["mlcore_connected"] = is_healthy

    data = {
        "tic_id": tic_id,
        "metadata": json.dumps(metadata or {})
    }
    if sector is not None:
        data["sector"] = sector

    last_error = None
    for attempt in range(2):
        try:
            resp = requests.post(
                f"{base_url}/analyze/tess",
                data=data,
                timeout=timeout,
            )
            if resp.status_code == 200:
                st.session_state["using_fallback"] = False
                return resp.json()
            elif resp.status_code == 422:
                error_detail = resp.json().get("detail", "Validation error")
                raise MLCoreUnavailableError(f"ml-core validation error: {error_detail}")
            else:
                last_error = f"ml-core returned HTTP {resp.status_code}"
        except requests.exceptions.Timeout:
            last_error = "ml-core request timed out"
            if attempt == 0:
                continue
        except requests.exceptions.ConnectionError:
            last_error = "ml-core is not reachable"
            break
        except MLCoreUnavailableError:
            raise
        except Exception as e:
            last_error = str(e)
            break

    raise MLCoreUnavailableError(
        f"ml-core is unavailable ({last_error}). "
        "Try the Demo page for pre-computed results."
    )

