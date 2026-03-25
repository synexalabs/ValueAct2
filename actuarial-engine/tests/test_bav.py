"""Tests für bAV-Bewertungsmodul."""
import pytest
from calculations.bav import (
    calculate_dbo_ias19, calculate_dbo_hgb,
    calculate_bav_comparison, get_hgb_discount_rate, get_ias19_discount_rate,
)


@pytest.fixture
def standard_commitment():
    return {
        "id": "BAV001",
        "birth_date": "1975-06-15",
        "entry_date": "2000-01-01",
        "gender": "M",
        "annual_pension": 12000,
        "benefit_type": "festbetrag",
        "has_survivors_benefit": True,
        "survivors_fraction": 0.60,
        "has_invalidity_benefit": True,
    }


@pytest.fixture
def bav_assumptions():
    return {
        "retirement_age": 67,
        "pension_trend": 0.015,
        "salary_trend": 0.025,
        "fluctuation_rate": 0.03,
        "mortality_table": "DAV_2004_R",
        "marriage_probability": 0.80,
        "invalidity_rate": 0.005,
    }


class TestIAS19DBO:
    def test_dbo_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["dbo"] > 0

    def test_dbo_less_than_total_pension(self, standard_commitment, bav_assumptions):
        """DBO should be less than undiscounted total pension payments."""
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        # 12000/year × ~20 years of payments = 240000 max
        assert result["dbo"] < 300000

    def test_service_cost_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["current_service_cost"] > 0

    def test_interest_cost_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["interest_cost"] > 0

    def test_higher_rate_lower_dbo(self, standard_commitment, bav_assumptions):
        low = calculate_dbo_ias19(standard_commitment, {**bav_assumptions, "discount_rate": 0.02})
        high = calculate_dbo_ias19(standard_commitment, {**bav_assumptions, "discount_rate": 0.06})
        assert high["dbo"] < low["dbo"]

    def test_attribution_ratio_below_one(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert 0 < result["attribution_ratio"] <= 1.0

    def test_annuity_factor_reasonable(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        # Should be roughly 10-20 for a life annuity at age 67
        assert 5 < result["annuity_factor"] < 25

    def test_psvag_contribution(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["psvag_contribution"] > 0
        assert result["psvag_contribution"] < result["dbo"] * 0.01


class TestHGBDBO:
    def test_hgb_uses_lower_rate(self, standard_commitment, bav_assumptions):
        ias19 = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        hgb = calculate_dbo_hgb(standard_commitment, bav_assumptions)
        # HGB rate (~1.8%) is typically lower than IAS 19 (~3.4%), so HGB DBO is higher
        assert hgb["dbo"] > ias19["dbo"]

    def test_hgb_rate_positive(self):
        rate = get_hgb_discount_rate("2024-12-31", 7)
        assert 0.005 < rate < 0.05

    def test_hgb_10year_lower_than_7year(self):
        r7 = get_hgb_discount_rate("2024-12-31", 7)
        r10 = get_hgb_discount_rate("2024-12-31", 10)
        assert r10 < r7


class TestComparison:
    def test_comparison_has_both(self, standard_commitment, bav_assumptions):
        result = calculate_bav_comparison(standard_commitment, bav_assumptions)
        assert "ias19" in result
        assert "hgb" in result
        assert "difference" in result

    def test_difference_is_ias19_minus_hgb(self, standard_commitment, bav_assumptions):
        result = calculate_bav_comparison(standard_commitment, bav_assumptions)
        expected = result["ias19"]["dbo"] - result["hgb"]["dbo"]
        assert abs(result["difference"] - expected) < 1.0


class TestDiscountRates:
    def test_ias19_rate_positive(self):
        rate = get_ias19_discount_rate("2024-12-31")
        assert 0.01 < rate < 0.08

    def test_hgb_rate_exists_for_recent_dates(self):
        for d in ["2024-12-31", "2024-06-30", "2023-12-31"]:
            rate = get_hgb_discount_rate(d)
            assert rate > 0
