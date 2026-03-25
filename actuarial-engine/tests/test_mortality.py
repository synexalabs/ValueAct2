"""
Tests for mortality tables — DAV 2008 T, DAV 2004 R, and CSO tables.
Verifies rates, survival probabilities, and EU Gender Directive compliance.
"""
import pytest
from data.mortality_tables import get_mortality_rate, get_survival_probability, get_mortality_table, MORTALITY_TABLES
from data.dav_mortality_tables import (
    DAV_2008_T_MALE, DAV_2008_T_FEMALE, DAV_2008_T_UNISEX,
    DAV_2004_R_MALE, DAV_2004_R_FEMALE, DAV_2004_R_UNISEX,
    get_dav_mortality_rate, get_dav_survival_probability, get_dav_life_expectancy,
    DAV_MORTALITY_TABLES,
)


class TestDAVTableValues:
    """Spot-check DAV table rates against published values."""

    def test_dav_2008_t_male_age_0(self):
        assert DAV_2008_T_MALE["rates"][0] == 3.620  # per mille

    def test_dav_2008_t_male_age_35(self):
        assert DAV_2008_T_MALE["rates"][35] == 1.360

    def test_dav_2008_t_male_age_50(self):
        assert DAV_2008_T_MALE["rates"][50] == 6.450

    def test_dav_2008_t_male_age_65(self):
        assert DAV_2008_T_MALE["rates"][65] == 35.970

    def test_dav_2008_t_male_age_80(self):
        assert DAV_2008_T_MALE["rates"][80] == 213.730

    def test_dav_2008_t_female_lower_than_male(self):
        """Female mortality should be lower than male at most working ages."""
        for age in [30, 40, 50, 60, 70]:
            assert DAV_2008_T_FEMALE["rates"][age] < DAV_2008_T_MALE["rates"][age], \
                f"Female should have lower mortality at age {age}"

    def test_dav_2004_r_lower_than_2008_t(self):
        """Annuity table should have lower mortality (conservative for longevity)."""
        for age in [40, 50, 60, 70]:
            assert DAV_2004_R_MALE["rates"][age] < DAV_2008_T_MALE["rates"][age], \
                f"DAV 2004 R should have lower mortality at age {age}"


class TestUnisexTables:
    """Verify EU Gender Directive compliance — unisex defaults."""

    def test_unisex_is_average_of_male_female(self):
        """Unisex rate should be 50/50 blend of male and female."""
        for age in [25, 35, 50, 65, 80]:
            expected = (DAV_2008_T_MALE["rates"][age] + DAV_2008_T_FEMALE["rates"][age]) / 2
            actual = DAV_2008_T_UNISEX["rates"][age]
            assert abs(actual - expected) < 0.01, \
                f"Unisex rate at age {age}: expected {expected}, got {actual}"

    def test_dav_default_is_unisex_in_dav_module(self):
        """DAV module registry should default to unisex."""
        assert DAV_MORTALITY_TABLES["DAV_2008_T"] is DAV_2008_T_UNISEX
        assert DAV_MORTALITY_TABLES["DAV_2004_R"] is DAV_2004_R_UNISEX

    def test_main_registry_default_is_unisex(self):
        """Main MORTALITY_TABLES registry should also default to unisex."""
        table = MORTALITY_TABLES["DAV_2008_T"]
        assert table["gender"] == "unisex", \
            f"DAV_2008_T default should be unisex, got {table['gender']}"

    def test_gender_specific_lookup(self):
        """Requesting specific gender should return gendered table."""
        male_table = get_mortality_table("DAV_2008_T", gender="male")
        assert male_table["gender"] == "male"
        female_table = get_mortality_table("DAV_2008_T", gender="female")
        assert female_table["gender"] == "female"


class TestMortalityRateConversion:
    """Verify per-mille to decimal conversion."""

    def test_rate_is_decimal_not_permille(self):
        """get_mortality_rate should return decimal (0.00136), not per-mille (1.36)."""
        rate = get_dav_mortality_rate("DAV_2008_T", 35, "male")
        assert 0.001 < rate < 0.002, f"Expected ~0.00136, got {rate}"

    def test_rate_from_main_module(self):
        """Main module get_mortality_rate should also return decimal."""
        rate = get_mortality_rate("DAV_2008_T", 35, "M")
        assert rate < 0.01, f"Rate should be decimal (<0.01), got {rate}"
        assert rate > 0.0005, f"Rate should be positive, got {rate}"


class TestSurvivalProbability:
    """Test survival probability calculations."""

    def test_one_year_survival_high(self):
        prob = get_dav_survival_probability("DAV_2008_T", 35, 1, "male")
        assert 0.998 < prob < 1.0

    def test_survival_decreases_with_term(self):
        prob_5 = get_dav_survival_probability("DAV_2008_T", 35, 5, "male")
        prob_20 = get_dav_survival_probability("DAV_2008_T", 35, 20, "male")
        assert prob_20 < prob_5

    def test_survival_zero_term_is_one(self):
        prob = get_dav_survival_probability("DAV_2008_T", 35, 0, "male")
        assert prob == 1.0

    def test_survival_very_old_near_zero(self):
        prob = get_dav_survival_probability("DAV_2008_T", 90, 20, "male")
        assert prob < 0.01


class TestLifeExpectancy:
    """Test life expectancy calculations."""

    def test_life_expectancy_reasonable(self):
        """Life expectancy for 35yo male should be roughly 40-50 years."""
        ex = get_dav_life_expectancy("DAV_2008_T", 35, "male")
        assert 35 < ex < 55, f"Life expectancy at 35: {ex} years seems unreasonable"

    def test_female_lives_longer(self):
        ex_m = get_dav_life_expectancy("DAV_2008_T", 35, "male")
        ex_f = get_dav_life_expectancy("DAV_2008_T", 35, "female")
        assert ex_f > ex_m

    def test_annuity_table_longer_life(self):
        """Annuity table should show longer life expectancy (conservative for longevity)."""
        ex_t = get_dav_life_expectancy("DAV_2008_T", 50, "male")
        ex_r = get_dav_life_expectancy("DAV_2004_R", 50, "male")
        assert ex_r > ex_t
