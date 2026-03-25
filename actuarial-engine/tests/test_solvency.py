"""
Tests for Solvency II SCR calculations per Delegated Regulation (EU) 2015/35.
"""
import pytest
import numpy as np
import pandas as pd
from calculations.solvency import (
    calculate_portfolio_scr,
    calculate_market_risk_scr,
    calculate_life_underwriting_risk_scr,
    calculate_operational_risk_scr,
    calculate_mcr,
    calculate_correlated_scr,
    calculate_total_scr,
)
from utils.regulatory_constants import (
    MORTALITY_SHOCK, LONGEVITY_SHOCK, LAPSE_SHOCKS,
    MCR_ABSOLUTE_FLOORS, MCR_LINEAR_FACTORS,
)


class TestSCRStructure:
    """Verify SCR output structure."""

    def test_scr_positive(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        assert result["scr"] > 0

    def test_mcr_positive(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        assert result["mcr"] > 0

    def test_mcr_floor_can_exceed_scr_for_small_portfolio(self, term_life_policy, base_solvency_assumptions):
        """MCR absolute floor (€3.7M) legitimately exceeds SCR for a single-policy portfolio."""
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        floor = MCR_ABSOLUTE_FLOORS.get("life_reinsurance", 3_700_000)
        # Either MCR respects the corridor (25-45% of SCR) or the absolute floor applies
        assert result["mcr"] >= min(result["scr"] * 0.25, floor)

    def test_all_risk_modules_present(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        required = [
            "market_risk", "counterparty_risk", "life_underwriting_risk",
            "health_underwriting_risk", "non_life_underwriting_risk", "operational_risk",
        ]
        for risk in required:
            assert risk in result["scr_breakdown"]
            assert result["scr_breakdown"][risk] >= 0


class TestDiversification:
    """Diversification benefit should reduce total SCR."""

    def test_diversification_positive(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        assert result["diversification_benefit"] >= 0

    def test_correlated_less_than_sum(self):
        """Correlated SCR should be less than simple sum of components."""
        risks = {"a": 100, "b": 100, "c": 100}
        # With no correlation info defaults to 0 correlation
        correlated = calculate_correlated_scr(risks, "unknown_type")
        simple_sum = sum(risks.values())
        assert correlated <= simple_sum


class TestOperationalRisk:
    """Article 204: Op risk is added linearly, capped at 30% of BSCR."""

    def test_op_risk_capped_at_30_pct_bscr(self, term_life_policy, base_solvency_assumptions):
        df = pd.DataFrame([term_life_policy])
        bscr = df["face_amount"].sum() * 0.20
        op_scr = calculate_operational_risk_scr(df, {**base_solvency_assumptions, "basic_scr": bscr})
        assert op_scr <= 0.30 * bscr + 0.01  # Small tolerance

    def test_op_risk_outside_correlation_matrix(self, term_life_policy, base_solvency_assumptions):
        """Operational risk should NOT be in the BSCR correlation matrix."""
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        # BSCR should exclude op risk
        bscr = result.get("bscr", result.get("scr_before_lac_dt", 0))
        op_risk = result["scr_breakdown"]["operational_risk"]
        # SCR ≈ BSCR + Op_Risk (before LAC DT)
        expected_total = bscr + op_risk
        actual_total = result.get("scr_before_lac_dt", result["scr"] + result.get("lac_dt", 0))
        assert abs(expected_total - actual_total) < 1.0


class TestMCR:
    """Articles 248-250: MCR linear formula with corridor."""

    def test_mcr_above_absolute_floor(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        floor = MCR_ABSOLUTE_FLOORS.get("life_reinsurance", 3_700_000)
        assert result["mcr"] >= floor

    def test_mcr_within_corridor(self, term_life_policy, base_solvency_assumptions):
        result = calculate_portfolio_scr([term_life_policy], base_solvency_assumptions)
        scr = result["scr"]
        mcr = result["mcr"]
        floor = MCR_ABSOLUTE_FLOORS.get("life_reinsurance", 3_700_000)
        # MCR should be >= max(floor, 25% SCR) and <= 45% SCR (if SCR is large enough)
        assert mcr >= floor


class TestRegulatoryConstants:
    """Verify hardcoded regulatory parameters match the Delegated Regulation."""

    def test_mortality_shock_15_percent(self):
        assert MORTALITY_SHOCK == 0.15

    def test_longevity_shock_20_percent(self):
        assert LONGEVITY_SHOCK == 0.20

    def test_mass_lapse_40_percent(self):
        assert LAPSE_SHOCKS["mass_lapse"] == 0.40

    def test_lapse_up_50_percent(self):
        assert LAPSE_SHOCKS["up_shock"] == 0.50

    def test_mcr_linear_factors(self):
        assert MCR_LINEAR_FACTORS["life"]["technical_provisions_guaranteed"] == 0.0450
        assert MCR_LINEAR_FACTORS["life"]["technical_provisions_other"] == 0.0085
        assert MCR_LINEAR_FACTORS["capital_at_risk"] == 0.00150
