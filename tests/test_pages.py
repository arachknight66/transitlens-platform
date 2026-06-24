"""
Tests for page rendering — verifies pages render without errors.
Uses mocks for all Streamlit calls.
"""

from unittest.mock import patch, MagicMock

import pytest


def _make_mock_st():
    """Create a comprehensive mock for streamlit."""
    mock = MagicMock()
    mock.session_state = {
        "page": "home",
        "result": None,
        "selected_candidate": None,
        "analysis_running": False,
        "using_fallback": False,
        "upload_filename": None,
        "mlcore_connected": False,
        "last_health_check": None,
        "export_html_ready": False,
        "config": {
            "mlcore": {"base_url": "http://localhost:8000", "demo_fallback": True},
            "ui": {"confidence_colors": {
                "exoplanet_like": "#3C3489",
                "eclipsing_binary_like": "#712B13",
                "noise_or_other": "#444441",
            }},
            "export": {"pdf_enabled": False},
        },
    }
    def mock_columns(spec):
        if isinstance(spec, int):
            return [MagicMock() for _ in range(spec)]
        return [MagicMock() for _ in spec]
    mock.columns.side_effect = mock_columns
    mock.tabs.return_value = [MagicMock(), MagicMock()]
    return mock


class TestHomePageRender:
    """Test home page rendering."""

    def test_home_render(self):
        """Home page render() completes without errors."""
        with patch("app.pages.home.st", _make_mock_st()):
            with patch("app.pages.home.state"):
                from app.pages.home import render
                render()  # Should not raise


class TestDemoPageRender:
    """Test demo page rendering."""

    def test_demo_render(self):
        """Demo page render() completes without errors."""
        with patch("app.pages.demo.st", _make_mock_st()):
            with patch("app.pages.demo.state") as mock_state:
                mock_state.get_last_health_check.return_value = None
                mock_state.get_mlcore_connected.return_value = False
                mock_state.get_using_fallback.return_value = False
                with patch("app.pages.demo.api_client"):
                    from app.pages.demo import render
                    render()  # Should not raise


class TestResultsPageRender:
    """Test results page rendering."""

    def test_results_render_no_result(self):
        """Results page shows empty-state message when no result."""
        mock_st = _make_mock_st()
        with patch("app.pages.results.st", mock_st):
            with patch("app.pages.results.state") as mock_state:
                mock_state.get_result.return_value = None
                with patch("app.pages.results.result_card") as mock_rc:
                    from app.pages.results import render
                    render()

    def test_results_render_with_result(self, sample_result_a):
        """Results page renders fully with a sample result."""
        mock_st = _make_mock_st()
        mock_st.session_state["result"] = sample_result_a
        with patch("app.pages.results.st", mock_st):
            with patch("app.pages.results.state") as mock_state:
                mock_state.get_result.return_value = sample_result_a
                mock_state.get_config.return_value = mock_st.session_state["config"]
                with patch("app.pages.results.result_card"):
                    with patch("app.pages.results.parameter_panel"):
                        with patch("app.pages.results.plot_raw"):
                            with patch("app.pages.results.plot_cleaned"):
                                with patch("app.pages.results.plot_periodogram"):
                                    with patch("app.pages.results.plot_phase_folded"):
                                        with patch("app.pages.results.feature_table"):
                                            from app.pages.results import render
                                            render()


class TestAboutPageRender:
    """Test about page rendering."""

    def test_about_render(self):
        """About page render() completes without errors."""
        with patch("app.pages.about.st", _make_mock_st()):
            from app.pages.about import render
            render()  # Should not raise
