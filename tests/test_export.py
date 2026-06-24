"""
Tests for export module — HTML and CSV generation.
"""

import csv
import io
from html.parser import HTMLParser

import pytest


class TestHTMLExport:
    """Test HTML evidence pack generation."""

    def test_generate_html_returns_bytes(self, sample_result_a):
        """generate_html() returns a non-empty bytes object."""
        from export.html_report import generate_html
        result = generate_html(sample_result_a)
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_html_contains_class_label(self, sample_result_a):
        """Generated HTML contains the class label."""
        from export.html_report import generate_html
        html = generate_html(sample_result_a).decode("utf-8")
        assert "exoplanet" in html.lower() or "Exoplanet" in html

    def test_html_contains_embedded_plots(self, sample_result_a):
        """Generated HTML contains base64-embedded plot images."""
        from export.html_report import generate_html
        html = generate_html(sample_result_a).decode("utf-8")
        assert "data:image/png;base64" in html

    def test_html_parses_without_errors(self, sample_result_a):
        """Generated HTML can be parsed without errors."""
        from export.html_report import generate_html
        html = generate_html(sample_result_a).decode("utf-8")

        errors = []

        class StrictParser(HTMLParser):
            def handle_starttag(self, tag, attrs):
                pass

            def handle_endtag(self, tag):
                pass

            def handle_data(self, data):
                pass

        parser = StrictParser()
        parser.feed(html)  # Should not raise


class TestCSVExport:
    """Test CSV result export."""

    def test_generate_csv_returns_bytes(self, sample_result_a):
        """generate_csv() returns a bytes object that can be decoded."""
        from export.csv_export import generate_csv
        result = generate_csv(sample_result_a)
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_csv_has_expected_columns(self, sample_result_a):
        """CSV has all 18 expected column names."""
        from export.csv_export import generate_csv
        csv_bytes = generate_csv(sample_result_a)
        reader = csv.reader(io.StringIO(csv_bytes.decode("utf-8")))
        headers = next(reader)

        expected_columns = [
            "target_id", "candidate_detected", "predicted_class", "confidence",
            "period_days", "duration_days", "depth", "snr", "transit_count",
            "bls_power", "odd_even_depth_delta", "v_shape_score", "local_noise",
            "depth_to_noise_ratio", "phase_shape_kurtosis", "explanation",
            "processing_time_ms", "pipeline_version",
        ]
        for col in expected_columns:
            assert col in headers, f"Missing column: {col}"

    def test_csv_has_one_data_row(self, sample_result_a):
        """CSV has exactly one data row (plus header)."""
        from export.csv_export import generate_csv
        csv_bytes = generate_csv(sample_result_a)
        reader = csv.reader(io.StringIO(csv_bytes.decode("utf-8")))
        rows = list(reader)
        assert len(rows) == 2, f"Expected 2 rows (header + data), got {len(rows)}"
