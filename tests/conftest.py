"""
Shared pytest fixtures for TransitLens platform tests.
"""

import json
import os
from unittest.mock import patch, MagicMock

import pytest


DEMO_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "demo_data",
)


@pytest.fixture
def sample_results():
    """Load the full sample_results.json."""
    json_path = os.path.join(DEMO_DATA_DIR, "sample_results.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture
def sample_result_a(sample_results):
    """Pre-computed result for Candidate A (exoplanet-like)."""
    return sample_results["candidate_a"]


@pytest.fixture
def sample_result_b(sample_results):
    """Pre-computed result for Candidate B (eclipsing binary-like)."""
    return sample_results["candidate_b"]


@pytest.fixture
def sample_result_c(sample_results):
    """Pre-computed result for Candidate C (noise)."""
    return sample_results["candidate_c"]


@pytest.fixture
def mock_api_client(sample_result_a):
    """Mock version of api_client.analyze() that returns sample_result_a."""
    with patch("app.api_client.analyze", return_value=sample_result_a) as mock:
        yield mock


@pytest.fixture
def candidate_a_csv_path():
    """Path to demo_data/candidate_a.csv."""
    return os.path.join(DEMO_DATA_DIR, "candidate_a.csv")
