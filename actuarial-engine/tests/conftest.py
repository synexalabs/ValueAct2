"""Shared fixtures for actuarial engine tests."""
import sys
import os
import pytest

# Ensure actuarial-engine root is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


@pytest.fixture
def term_life_policy():
    """Standard German term life policy for testing."""
    return {
        "policy_id": "T001",
        "issue_date": "2024-01-01",
        "face_amount": 100_000,
        "premium": 2_800,
        "policy_type": "term_life",
        "gender": "M",
        "issue_age": 35,
        "policy_term": 20,
    }


@pytest.fixture
def endowment_policy():
    """Standard endowment policy for testing."""
    return {
        "policy_id": "E001",
        "issue_date": "2024-01-01",
        "face_amount": 100_000,
        "premium": 4_500,
        "policy_type": "endowment",
        "gender": "F",
        "issue_age": 40,
        "policy_term": 25,
    }


@pytest.fixture
def annuity_policy():
    """Annuity policy for testing."""
    return {
        "policy_id": "A001",
        "issue_date": "2024-01-01",
        "face_amount": 200_000,
        "premium": 6_000,
        "policy_type": "annuity",
        "gender": "M",
        "issue_age": 50,
        "policy_term": 15,
    }


@pytest.fixture
def base_ifrs17_assumptions():
    """Standard IFRS 17 assumptions for German market."""
    return {
        "discount_rate": 0.035,
        "lapse_rate": 0.05,
        "mortality_table": "DAV_2008_T",
        "expense_inflation": 0.02,
        "risk_adjustment_factor": 0.02,
        "expense_loading": 0.05,
        "confidence_level": 0.75,
        "use_dynamic_lapse": True,
    }


@pytest.fixture
def base_solvency_assumptions():
    """Standard Solvency II assumptions."""
    return {
        "confidence_level": 0.995,
        "time_horizon": 1,
        "market_risk_factor": 0.25,
        "credit_risk_factor": 0.15,
        "underwriting_risk_factor": 0.20,
        "operational_risk_factor": 0.10,
        "own_funds": 500_000,
    }
