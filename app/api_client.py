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


# ── Lazy-loaded cache for demo data ────────────────────────────────────────────

_METADATA_CACHE: dict | None = None
_PLOTS_CACHE: dict[str, dict] = {}


def _get_demo_data_dir() -> str:
    """Return the absolute path to the demo_data directory."""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo_data")


def _load_metadata() -> dict:
    """Load the metadata file (with plots removed) on first access."""
    global _METADATA_CACHE
    if _METADATA_CACHE is None:
        path = os.path.join(_get_demo_data_dir(), "sample_metadata.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                _METADATA_CACHE = json.load(f)
        else:
            # Fallback: load from monolithic file if split has not been run
            mono = os.path.join(_get_demo_data_dir(), "sample_results.json")
            if os.path.exists(mono):
                with open(mono, "r", encoding="utf-8") as f:
                    full = json.load(f)
                _METADATA_CACHE = {k: {kk: vv for kk, vv in v.items() if kk != "plots"}
                                   for k, v in full.items()}
            else:
                _METADATA_CACHE = {}
    return _METADATA_CACHE


def _load_plots(target_id: str) -> dict:
    """Load plots for a specific target_id on first access."""
    if target_id not in _PLOTS_CACHE:
        path = os.path.join(_get_demo_data_dir(), f"{target_id}_plots.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                _PLOTS_CACHE[target_id] = json.load(f)
        else:
            # Fallback: extract from monolithic file
            mono = os.path.join(_get_demo_data_dir(), "sample_results.json")
            if os.path.exists(mono):
                with open(mono, "r", encoding="utf-8") as f:
                    full = json.load(f)
                _PLOTS_CACHE[target_id] = full.get(target_id, {}).get("plots", {})
            else:
                _PLOTS_CACHE[target_id] = {}
    return _PLOTS_CACHE[target_id]


def _load_fallback_result(target_id: str) -> dict | None:
    """Load a pre-computed result from split demo data files.
    Returns the result dict for the given target_id, or None if not found.
    """
    meta = _load_metadata()
    if target_id not in meta:
        return None
    result = dict(meta[target_id])
    result["plots"] = _load_plots(target_id)
    return result


class MLCoreUnavailableError(Exception):
    """Raised when ml-core is unreachable and no fallback is available."""
    pass


def _get_config():
    """Load the mlcore section of config.yaml."""
    config = load_config()
    return config.get("mlcore", {})


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


def analyze_streaming(time_arr, flux_arr, target_id: str, metadata=None, config_override=None):
    """
    Generator that yields progress event dicts as the analysis runs.
    Each yielded dict has keys: stage (str), pct (int), msg (str).
    The final dict additionally has key: result (dict).

    Falls back to synchronous analyze() if SSE endpoint is unavailable.
    """
    cfg = _get_config()
    base_url = cfg.get("base_url", "http://127.0.0.1:8000")
    timeout = cfg.get("timeout_seconds", 30)

    time_list = time_arr.tolist() if isinstance(time_arr, np.ndarray) else list(time_arr)
    flux_list = flux_arr.tolist() if isinstance(flux_arr, np.ndarray) else list(flux_arr)

    payload = {
        "time": time_list,
        "flux": flux_list,
        "target_id": target_id,
        "metadata": metadata,
    }
    if config_override:
        payload["config"] = config_override

    try:
        with requests.post(
            f"{base_url}/analyze/stream",
            json=payload,
            stream=True,
            timeout=timeout,
        ) as resp:
            if resp.status_code != 200:
                raise requests.exceptions.ConnectionError(f"HTTP {resp.status_code}")

            result = None
            for raw_line in resp.iter_lines():
                if not raw_line:
                    continue
                line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                if line.startswith("data:"):
                    event = json.loads(line[5:].strip())
                    if "result" in event:
                        result = event["result"]
                    yield event

            if result is None:
                raise ValueError("Stream ended without a result")

    except Exception:
        # SSE not available -- fall back to synchronous call with synthetic events
        synthetic_steps = [
            (10,  "preprocessing", "Loading and preprocessing light curve..."),
            (30,  "bls_search",    "Running BLS period search..."),
            (55,  "features",      "Extracting 16 diagnostic features..."),
            (70,  "classify",      "Classifying signal type..."),
            (85,  "fitting",       "Fitting transit parameters..."),
            (95,  "plots",         "Generating diagnostic plots..."),
        ]
        for pct, stage, msg in synthetic_steps:
            yield {"pct": pct, "stage": stage, "msg": msg}

        result = analyze(time_arr, flux_arr, target_id, metadata, config_override)
        yield {"pct": 100, "stage": "complete", "msg": "Analysis complete.", "result": result}


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


def get_fallback_result(target_id: str) -> dict | None:
    """Retrieve fallback result directly from demo_data/sample_results.json."""
    return _load_fallback_result(target_id)

