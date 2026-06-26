"""
app/utils.py — Shared utility functions used across pages and components.
No state access, no Streamlit calls — pure functions only.
"""

import base64
import io
import os

import numpy as np
import pandas as pd
import yaml
from PIL import Image


class InvalidCSVError(Exception):
    """Raised when a CSV file does not meet the required format."""
    pass


def format_period(days: float) -> str:
    """Format a period value for display.
    Returns '3.42 days' for values >= 1.0, '11.0 hours' for values < 1.0.
    """
    if days >= 1.0:
        return f"{days:.2f} days"
    else:
        hours = days * 24.0
        return f"{hours:.1f} hours"


def format_depth(depth: float) -> str:
    """Format a transit depth. Returns '1.3%' (multiplied by 100, one decimal place)."""
    return f"{depth * 100:.1f}%"


def format_duration(days: float) -> str:
    """Format a duration. Returns '3.8 hours' (converted from days)."""
    hours = days * 24.0
    return f"{hours:.1f} hours"


def format_confidence(conf: float) -> str:
    """Returns '88%' (multiplied by 100, no decimal)."""
    return f"{int(conf * 100)}%"


def decode_plot(b64_string: str):
    """Decode a base64 PNG string to a PIL Image object for display in Streamlit."""
    if not b64_string:
        return None
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data))


def load_csv(file_or_path) -> tuple:
    """Accept either a file path string or a Streamlit UploadedFile object.
    Returns (time_array, flux_array) as numpy arrays.
    Validates that the CSV has 'time' and 'flux' columns, has at least 500 finite
    points, has strictly monotonic time timestamps, and no infinite values.
    Raises InvalidCSVError if validation fails.
    """
    try:
        if isinstance(file_or_path, str):
            df = pd.read_csv(file_or_path)
        else:
            # Streamlit UploadedFile
            df = pd.read_csv(file_or_path)
    except Exception as e:
        raise InvalidCSVError(f"Could not read CSV file: {e}")

    # Normalise column names to lowercase
    df.columns = [c.strip().lower() for c in df.columns]

    if "time" not in df.columns:
        raise InvalidCSVError("CSV must have a 'time' column with BTJD timestamps")
    if "flux" not in df.columns:
        raise InvalidCSVError("CSV must have a 'flux' column with normalised flux values")

    try:
        time_arr = df["time"].to_numpy(dtype=float)
        flux_arr = df["flux"].to_numpy(dtype=float)
    except (ValueError, TypeError) as e:
        raise InvalidCSVError(f"time and flux columns must contain numeric values: {e}")

    # Step 1: Check length mismatch
    if len(time_arr) != len(flux_arr):
        raise InvalidCSVError(f"time and flux columns must have equal length, got time={len(time_arr)}, flux={len(flux_arr)}")

    # Step 2: Check infinities
    if np.any(np.isinf(time_arr)):
        raise InvalidCSVError("time column contains infinite values")
    if np.any(np.isinf(flux_arr)):
        raise InvalidCSVError("flux column contains infinite values")

    # Step 3: Filter NaNs to check final size
    valid_mask = np.isfinite(time_arr) & np.isfinite(flux_arr)
    time_clean = time_arr[valid_mask]
    flux_clean = flux_arr[valid_mask]
    
    if len(time_clean) < 500:
        raise InvalidCSVError(f"CSV must contain at least 500 finite data points, found {len(time_clean)}")

    # Step 4: Check monotonicity on the cleaned time array (after NaN removal)
    diffs = np.diff(time_clean)
    if np.any(diffs <= 0):
        n_bad = int(np.sum(diffs <= 0))
        raise InvalidCSVError(f"time column must be strictly monotonically increasing; found {n_bad} non-increasing step(s)")

    # Step 5: Check normalization (median range [0.8, 1.2])
    med_flux = float(np.median(flux_clean))
    if not (0.8 <= med_flux <= 1.2):
        raise InvalidCSVError(f"Flux values appear un-normalised (median = {med_flux:.4f}). Please normalise flux around 1.0.")

    return time_arr, flux_arr


def load_config(path: str = None) -> dict:
    """Read and parse config.yaml. Called once in main.py and stored in state.config."""
    if path is None:
        # Resolve relative to the project root
        path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config.yaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def class_display_name(class_str: str) -> str:
    """Convert internal class string to display-friendly name."""
    mapping = {
        "exoplanet_transit": "Exoplanet Transit",
        "eclipsing_binary": "Eclipsing Binary",
        "blend_contamination": "Blend / Contamination",
        "stellar_variability_or_other": "Stellar Variability / Other",
        "exoplanet_like": "Exoplanet Transit",
        "eclipsing_binary_like": "Eclipsing Binary",
        "noise_or_other": "Stellar Variability / Other",
    }
    return mapping.get(class_str, class_str)


def class_emoji(class_str: str) -> str:
    """Return emoji for a given class string."""
    mapping = {
        "exoplanet_transit": "🪐",
        "eclipsing_binary": "⭐",
        "blend_contamination": "👥",
        "stellar_variability_or_other": "📊",
        "exoplanet_like": "🪐",
        "eclipsing_binary_like": "⭐",
        "noise_or_other": "📊",
    }
    return mapping.get(class_str, "❓")

