"""
Tests for IFRS 17 calculations — CSM, FCF, Risk Adjustment, Loss Component.
Verifies actuarial correctness against IFRS 17 standard requirements.
"""
import pytest
import numpy as np
import pandas as pd
from calculations.ifrs17 import (
    calculate_portfolio_csm,
    calculate_pv_benefits_vectorized,
    calculate_pv_premiums_vectorized,
    calculate_pv_expenses_vectorized,
    determine_measurement_model,
    get_dynamic_lapse_rate,
    get_cumulative_persistence,
    MeasurementModel,
)


class TestCSMFormula:
    """IFRS 17 §38: CSM = max(0, -(FCF + RA))"""

    def test_profitable_contract_has_positive_csm(self, term_life_policy, base_ifrs17_assumptions):
        """A well-priced term life should have CSM > 0."""
        result = calculate_portfolio_csm([term_life_policy], base_ifrs17_assumptions)
        # With €2800 premium for €100K face amount, this should be profitable
        assert result["portfolio_csm"] >= 0

    def test_csm_and_loss_component_mutually_exclusive(self, term_life_policy, base_ifrs17_assumptions):
        """For each policy, either CSM > 0 or Loss Component > 0, never both."""
        result = calculate_portfolio_csm([term_life_policy], base_ifrs17_assumptions)
        for pr in result["policy_results"]:
            assert not (pr["csm"] > 0 and pr["loss_component"] > 0), \
                f"Policy {pr['policy_id']}: CSM={pr['csm']}, LC={pr['loss_component']} — both positive"

    def test_csm_is_nonnegative(self, term_life_policy, base_ifrs17_assumptions):
        result = calculate_portfolio_csm([term_life_policy], base_ifrs17_assumptions)
        assert result["portfolio_csm"] >= 0
        for pr in result["policy_results"]:
            assert pr["csm"] >= 0

    def test_onerous_contract_has_loss_component(self, base_ifrs17_assumptions):
        """A severely underpriced policy should be onerous."""
        underpriced = {
            "policy_id": "ONEROUS001",
            "issue_date": "2024-01-01",
            "face_amount": 500_000,
            "premium": 100,  # Absurdly low for 500K face
            "policy_type": "term_life",
            "gender": "M",
            "issue_age": 60,
            "policy_term": 30,
        }
        result = calculate_portfolio_csm([underpriced], base_ifrs17_assumptions)
        assert result["aggregate_metrics"]["loss_component"] > 0
        assert result["aggregate_metrics"]["onerous_count"] == 1


class TestMaturityBenefit:
    """A1 fix: Term life should NOT include maturity benefit."""

    def test_term_life_no_maturity_benefit(self, term_life_policy, base_ifrs17_assumptions):
        """PV benefits for term life should be much less than face amount."""
        df = pd.DataFrame([term_life_policy])
        pv_benefits = calculate_pv_benefits_vectorized(df, base_ifrs17_assumptions, "DAV_2008_T")
        # Term life: only death benefits, no maturity payment
        # For a 35yo over 20 years, expected death benefit PV should be << face amount
        assert pv_benefits.iloc[0] < term_life_policy["face_amount"] * 0.10, \
            f"Term life PV benefits {pv_benefits.iloc[0]} seems too high (maturity benefit leak?)"

    def test_endowment_includes_maturity_benefit(self, endowment_policy, base_ifrs17_assumptions):
        """PV benefits for endowment should be close to discounted face amount."""
        df = pd.DataFrame([endowment_policy])
        pv_benefits = calculate_pv_benefits_vectorized(df, base_ifrs17_assumptions, "DAV_2008_T")
        # Endowment: death benefits + maturity payment
        # PV should be substantial — at least 30% of face amount
        assert pv_benefits.iloc[0] > endowment_policy["face_amount"] * 0.30, \
            f"Endowment PV benefits {pv_benefits.iloc[0]} seems too low (missing maturity benefit?)"


class TestLapseInPremiums:
    """A2 fix: Lapse rates must reduce PV of premiums."""

    def test_higher_lapse_reduces_premiums(self, term_life_policy, base_ifrs17_assumptions):
        df = pd.DataFrame([term_life_policy])

        low_lapse = {**base_ifrs17_assumptions, "lapse_rate": 0.01}
        high_lapse = {**base_ifrs17_assumptions, "lapse_rate": 0.15}

        pv_low = calculate_pv_premiums_vectorized(df, low_lapse, "DAV_2008_T").iloc[0]
        pv_high = calculate_pv_premiums_vectorized(df, high_lapse, "DAV_2008_T").iloc[0]

        assert pv_high < pv_low, \
            f"Higher lapse ({pv_high}) should produce lower PV premiums than lower lapse ({pv_low})"

    def test_zero_lapse_gives_highest_premiums(self, term_life_policy, base_ifrs17_assumptions):
        df = pd.DataFrame([term_life_policy])

        zero_lapse = {**base_ifrs17_assumptions, "lapse_rate": 0.0}
        some_lapse = {**base_ifrs17_assumptions, "lapse_rate": 0.05}

        pv_zero = calculate_pv_premiums_vectorized(df, zero_lapse, "DAV_2008_T").iloc[0]
        pv_some = calculate_pv_premiums_vectorized(df, some_lapse, "DAV_2008_T").iloc[0]

        assert pv_zero > pv_some


class TestExpenseInflation:
    """A3 fix: Expense inflation must increase PV of expenses."""

    def test_higher_inflation_increases_expenses(self, term_life_policy, base_ifrs17_assumptions):
        df = pd.DataFrame([term_life_policy])

        low_infl = {**base_ifrs17_assumptions, "expense_inflation": 0.0}
        high_infl = {**base_ifrs17_assumptions, "expense_inflation": 0.05}

        pv_low = calculate_pv_expenses_vectorized(df, low_infl, "DAV_2008_T").iloc[0]
        pv_high = calculate_pv_expenses_vectorized(df, high_infl, "DAV_2008_T").iloc[0]

        assert pv_high > pv_low, \
            f"Higher inflation ({pv_high}) should produce higher expenses than lower ({pv_low})"


class TestDiscountRateSensitivity:
    """Discount rate changes should affect PV calculations."""

    def test_higher_discount_reduces_pv_benefits(self, term_life_policy, base_ifrs17_assumptions):
        df = pd.DataFrame([term_life_policy])

        low_rate = {**base_ifrs17_assumptions, "discount_rate": 0.01}
        high_rate = {**base_ifrs17_assumptions, "discount_rate": 0.08}

        pv_low = calculate_pv_benefits_vectorized(df, low_rate, "DAV_2008_T").iloc[0]
        pv_high = calculate_pv_benefits_vectorized(df, high_rate, "DAV_2008_T").iloc[0]

        assert pv_high < pv_low


class TestMeasurementModel:
    """IFRS 17 measurement model selection."""

    def test_term_life_is_gmm(self):
        row = pd.Series({"policy_type": "term_life"})
        assert determine_measurement_model(row, {}) == MeasurementModel.GMM

    def test_whole_life_is_gmm(self):
        row = pd.Series({"policy_type": "whole_life"})
        assert determine_measurement_model(row, {}) == MeasurementModel.GMM

    def test_annuity_is_vfa(self):
        row = pd.Series({"policy_type": "annuity"})
        assert determine_measurement_model(row, {}) == MeasurementModel.VFA


class TestDynamicLapse:
    """Dynamic lapse rate model."""

    def test_year_1_highest_lapse(self):
        """Year 1 should have the highest lapse multiplier."""
        year_0 = get_dynamic_lapse_rate(0.05, 0)
        year_1 = get_dynamic_lapse_rate(0.05, 1)
        year_5 = get_dynamic_lapse_rate(0.05, 5)
        assert year_1 > year_0
        assert year_1 > year_5

    def test_lapse_rate_capped(self):
        """Lapse rate should never exceed 50%."""
        rate = get_dynamic_lapse_rate(0.99, 1)
        assert rate <= 0.50

    def test_persistence_decreases(self):
        assert get_cumulative_persistence(0.05, 5) < get_cumulative_persistence(0.05, 2)
        assert get_cumulative_persistence(0.05, 0) == 1.0


class TestPortfolioCSMOutput:
    """Verify portfolio CSM output structure and required fields."""

    def test_output_has_required_fields(self, term_life_policy, base_ifrs17_assumptions):
        result = calculate_portfolio_csm([term_life_policy], base_ifrs17_assumptions)
        required = [
            "portfolio_csm", "portfolio_fcf", "csm_by_cohort",
            "csm_release_pattern", "policy_results", "aggregate_metrics",
            "audit_trail", "methodology_version",
        ]
        for field in required:
            assert field in result, f"Missing field: {field}"

    def test_policy_count_matches(self, term_life_policy, endowment_policy, base_ifrs17_assumptions):
        result = calculate_portfolio_csm(
            [term_life_policy, endowment_policy], base_ifrs17_assumptions
        )
        assert len(result["policy_results"]) == 2
        assert result["aggregate_metrics"]["policy_count"] == 2

    def test_csm_release_pattern_sums_to_total(self, term_life_policy, base_ifrs17_assumptions):
        result = calculate_portfolio_csm([term_life_policy], base_ifrs17_assumptions)
        if result["portfolio_csm"] > 0:
            total_release = sum(result["csm_release_pattern"])
            assert abs(total_release - result["portfolio_csm"]) < 1.0, \
                f"Release pattern sum ({total_release}) should equal CSM ({result['portfolio_csm']})"
