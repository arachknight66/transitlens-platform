"""
Tests for components and utility functions.
"""

from unittest.mock import patch, MagicMock

import pytest


class TestUtilsFunctions:
    """Test utility formatting functions."""

    def test_format_period_days(self):
        """format_period(3.42) returns '3.42 days'."""
        from app.utils import format_period
        assert format_period(3.42) == "3.42 days"

    def test_format_period_hours(self):
        """format_period(0.46) returns '11.0 hours'."""
        from app.utils import format_period
        result = format_period(0.46)
        assert result == "11.0 hours"

    def test_format_depth(self):
        """format_depth(0.013) returns '1.3%'."""
        from app.utils import format_depth
        assert format_depth(0.013) == "1.3%"

    def test_format_confidence(self):
        """format_confidence(0.88) returns '88%'."""
        from app.utils import format_confidence
        assert format_confidence(0.88) == "88%"

    def test_load_csv_returns_arrays(self, candidate_a_csv_path):
        """load_csv returns two numpy arrays of equal length."""
        from app.utils import load_csv
        import numpy as np
        time, flux = load_csv(candidate_a_csv_path)
        assert isinstance(time, np.ndarray)
        assert isinstance(flux, np.ndarray)
        assert len(time) == len(flux)
        assert len(time) > 0

    def test_class_display_name(self):
        """class_display_name converts internal names to display names."""
        from app.utils import class_display_name
        assert class_display_name("exoplanet_like") == "Exoplanet Transit"
        assert class_display_name("eclipsing_binary_like") == "Eclipsing Binary"
        assert class_display_name("noise_or_other") == "Stellar Variability / Other"
        assert class_display_name("exoplanet_transit") == "Exoplanet Transit"
        assert class_display_name("eclipsing_binary") == "Eclipsing Binary"
        assert class_display_name("blend_contamination") == "Blend / Contamination"
        assert class_display_name("stellar_variability_or_other") == "Stellar Variability / Other"

    def test_class_emoji(self):
        """class_emoji returns correct emojis."""
        from app.utils import class_emoji
        assert class_emoji("exoplanet_like") == "🪐"
        assert class_emoji("eclipsing_binary_like") == "⭐"
        assert class_emoji("noise_or_other") == "📊"
        assert class_emoji("exoplanet_transit") == "🪐"
        assert class_emoji("eclipsing_binary") == "⭐"
        assert class_emoji("blend_contamination") == "👥"
        assert class_emoji("stellar_variability_or_other") == "📊"


class TestConfidenceBadge:
    """Test the confidence badge component."""

    def test_confidence_badge_render(self, sample_result_a):
        """confidence_badge.render() calls st.markdown with correct colour."""
        with patch("app.components.confidence_badge.st") as mock_st:
            from app.components.confidence_badge import render
            render("exoplanet_transit", 0.88)
            mock_st.markdown.assert_called_once()
            call_args = mock_st.markdown.call_args
            html = call_args[0][0]
            assert "#3C3489" in html
