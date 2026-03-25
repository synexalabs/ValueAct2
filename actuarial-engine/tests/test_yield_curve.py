"""Tests for EIOPA yield curve and Smith-Wilson extrapolation."""
import pytest
from utils.eiopa_yield_curve import (
    get_eiopa_yield_curve, get_curve_summary,
    smith_wilson_extrapolation, UFR_RATES, EIOPA_EUR_RFR_BASE,
)


class TestEIOPAYieldCurve:

    def test_ufr_eur_is_345(self):
        assert UFR_RATES["EUR"] == 0.0345

    def test_curve_has_positive_rates(self):
        summary = get_curve_summary("EUR", "DE")
        for maturity, rate in summary["spot_rates"].items():
            assert rate > 0, f"Rate at maturity {maturity} should be positive"

    def test_long_end_converges_to_ufr(self):
        curve = get_eiopa_yield_curve("EUR", "DE", max_maturity=150, include_va=False)
        rate_100 = curve.get_spot_rate(100)
        rate_150 = curve.get_spot_rate(150)
        ufr = UFR_RATES["EUR"]
        # At 100+ years, rate should be close to UFR
        assert abs(rate_150 - ufr) < 0.005, \
            f"Rate at 150y ({rate_150}) should be close to UFR ({ufr})"

    def test_discount_factor_decreasing(self):
        curve = get_eiopa_yield_curve("EUR", "DE", max_maturity=50)
        df_5 = curve.get_discount_factor(5)
        df_20 = curve.get_discount_factor(20)
        df_50 = curve.get_discount_factor(50)
        assert df_5 > df_20 > df_50 > 0

    def test_va_increases_rates(self):
        curve_no_va = get_eiopa_yield_curve("EUR", "DE", include_va=False, max_maturity=20)
        curve_va = get_eiopa_yield_curve("EUR", "DE", include_va=True, max_maturity=20)
        rate_no_va = curve_no_va.get_spot_rate(10)
        rate_va = curve_va.get_spot_rate(10)
        assert rate_va > rate_no_va
