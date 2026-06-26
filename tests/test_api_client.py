"""
Tests for app/api_client.py — API client and fallback logic.
"""

import json
import os
from unittest.mock import patch, MagicMock

import pytest


class TestAnalyzeFallback:
    """Test the offline fallback path (no ml-core needed)."""

    def test_analyze_fallback_returns_valid_result(self, sample_result_a):
        """analyze() with target_id='candidate_a' returns a dict with all required keys."""
        # Patch streamlit session_state and health_check
        with patch("app.api_client.st") as mock_st:
            mock_st.session_state = {}
            with patch("app.api_client.health_check", return_value=False):
                from app.api_client import analyze
                import numpy as np

                time = np.linspace(0, 27, 1000)
                flux = np.ones_like(time)
                result = analyze(time, flux, "candidate_a")

                assert isinstance(result, dict)
                required_keys = [
                    "target_id", "candidate_detected", "predicted_class",
                    "confidence", "period_days", "features", "plots",
                    "explanation",
                ]
                for key in required_keys:
                    assert key in result, f"Missing key: {key}"

    def test_health_check_returns_false_unreachable(self):
        """health_check() returns False when given an unreachable URL."""
        with patch("app.api_client._get_config", return_value={
            "base_url": "http://localhost:99999",
            "health_check_timeout": 1,
        }):
            from app.api_client import health_check
            assert health_check() is False

    @pytest.mark.skipif(
        not os.environ.get("MLCORE_RUNNING"),
        reason="ml-core not available (set MLCORE_RUNNING=1 to enable)",
    )
    def test_health_check_returns_true_when_running(self):
        """health_check() returns True when ml-core is running."""
        from app.api_client import health_check
        assert health_check() is True

    def test_fallback_loads_from_sample_results(self):
        """Fallback correctly loads from sample_results.json."""
        from app.api_client import _load_fallback_result
        result = _load_fallback_result("candidate_a")
        assert result is not None
        assert result["predicted_class"] == "exoplanet_transit"

        result_b = _load_fallback_result("candidate_b")
        assert result_b is not None
        assert result_b["predicted_class"] == "eclipsing_binary"

        result_c = _load_fallback_result("candidate_c")
        assert result_c is not None
        assert result_c["predicted_class"] == "stellar_variability_or_other"

    def test_analyze_raises_when_no_fallback(self):
        """analyze() raises MLCoreUnavailableError when ml-core unreachable and fallback disabled."""
        with patch("app.api_client.st") as mock_st:
            mock_st.session_state = {}
            with patch("app.api_client._get_config", return_value={
                "base_url": "http://localhost:99999",
                "timeout_seconds": 1,
                "demo_fallback": False,
                "health_check_timeout": 1,
            }):
                from app.api_client import analyze, MLCoreUnavailableError
                import numpy as np

                time = np.linspace(0, 27, 100)
                flux = np.ones_like(time)
                with pytest.raises(MLCoreUnavailableError):
                    analyze(time, flux, "nonexistent_target")
