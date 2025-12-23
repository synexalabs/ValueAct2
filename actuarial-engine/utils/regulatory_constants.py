"""
Regulatory Constants for Actuarial Calculations

This module contains documented regulatory parameters from:
- Solvency II Delegated Regulation (EU) 2015/35
- IFRS 17 Insurance Contracts Standard
- EIOPA Guidelines

All values are sourced from official regulatory documents and should be
reviewed periodically for updates.
"""

# ==============================================================================
# SOLVENCY II STANDARD FORMULA - DELEGATED REGULATION (EU) 2015/35
# ==============================================================================

# Article 169 - Equity Risk Shock Parameters
EQUITY_SHOCKS = {
    "type_1": 0.39,  # Listed equities in EEA/OECD countries
    "type_2": 0.49,  # Other equities (unlisted, emerging markets)
    "strategic_participations": 0.22,  # Strategic participations >20% holding
    "duration_based": 0.22,  # Duration-based equity risk sub-module
    "infrastructure_qualifying": 0.30,  # Qualifying infrastructure equities
    "infrastructure_corporate": 0.36   # Qualifying infrastructure corporates
}

# Article 172 - Symmetric Adjustment to Equity Shock
EQUITY_SYMMETRIC_ADJUSTMENT = {
    "max_positive": 0.10,   # +10% maximum adjustment
    "max_negative": -0.10,  # -10% minimum adjustment
    "reference_period_years": 3  # Rolling 3-year average
}

# Article 137 - Life Underwriting Risk - Mortality Risk
MORTALITY_SHOCK = 0.15  # 15% permanent increase in mortality rates

# Article 138 - Life Underwriting Risk - Longevity Risk
LONGEVITY_SHOCK = 0.20  # 20% permanent decrease in mortality rates

# Article 139 - Life Underwriting Risk - Disability/Morbidity Risk
DISABILITY_SHOCKS = {
    "inception_increase": 0.35,  # 35% increase in disability inception
    "recovery_decrease": 0.20    # 20% decrease in recovery rates
}

# Article 142 - Life Underwriting Risk - Lapse Risk
LAPSE_SHOCKS = {
    "mass_lapse": 0.40,    # 40% mass lapse shock
    "up_shock": 0.50,      # 50% increase in lapse rates
    "down_shock": 0.50     # 50% decrease in lapse rates
}

# Article 145 - Life Underwriting Risk - Expense Risk
EXPENSE_SHOCKS = {
    "expense_increase": 0.10,    # 10% increase in expenses
    "inflation_increase": 0.01   # 1pp increase in expense inflation
}

# Article 147 - Life Underwriting Risk - Catastrophe Risk
LIFE_CATASTROPHE_SHOCK = 0.0015  # 0.15% increase in mortality for 1 year

# Article 142 - Minimum Capital Requirement (MCR) Absolute Floors
# Values in EUR as of last update
MCR_ABSOLUTE_FLOORS = {
    "life_reinsurance": 3_700_000,     # €3.7M for life/reinsurance
    "non_life": 2_500_000,              # €2.5M for non-life
    "composite": 3_700_000,             # €3.7M for composite
    "captive_reinsurance": 1_200_000   # €1.2M for captive reinsurance
}

# MCR Linear Formula Factors (Article 248-250)
MCR_LINEAR_FACTORS = {
    "life": {
        "technical_provisions_guaranteed": 0.0450,  # 4.5%
        "technical_provisions_other": 0.0085       # 0.85%
    },
    "capital_at_risk": 0.00150  # 0.15%
}

# Interest Rate Shock Term Structure (Article 166)
# Dictionary of absolute shocks by maturity (years)
INTEREST_RATE_SHOCKS = {
    # year: (up_shock, down_shock)
    0.25: (0.70, -0.75),
    0.5:  (0.70, -0.75),
    1:    (0.70, -0.75),
    2:    (0.70, -0.65),
    3:    (0.64, -0.56),
    4:    (0.59, -0.50),
    5:    (0.55, -0.46),
    6:    (0.52, -0.42),
    7:    (0.49, -0.39),
    8:    (0.47, -0.36),
    9:    (0.44, -0.33),
    10:   (0.42, -0.31),
    11:   (0.39, -0.30),
    12:   (0.37, -0.29),
    13:   (0.35, -0.28),
    14:   (0.34, -0.28),
    15:   (0.33, -0.27),
    16:   (0.31, -0.28),
    17:   (0.30, -0.28),
    18:   (0.29, -0.28),
    19:   (0.27, -0.29),
    20:   (0.26, -0.29),
    90:   (0.20, -0.20)  # Ultimate rate
}

# Property Risk (Article 174)
PROPERTY_SHOCK = 0.25  # 25% instantaneous decrease

# Currency Risk (Article 188)
CURRENCY_SHOCK = 0.25  # 25% change in exchange rate

# Spread Risk Duration-Based Factors (Article 176)
SPREAD_RISK_FACTORS = {
    "AAA": {"factor": 0.009, "modified_duration_multiplier": 1.0},
    "AA":  {"factor": 0.011, "modified_duration_multiplier": 1.0},
    "A":   {"factor": 0.014, "modified_duration_multiplier": 1.0},
    "BBB": {"factor": 0.025, "modified_duration_multiplier": 1.0},
    "BB":  {"factor": 0.045, "modified_duration_multiplier": 1.0},
    "B":   {"factor": 0.075, "modified_duration_multiplier": 1.0},
    "CCC_or_lower": {"factor": 0.075, "modified_duration_multiplier": 1.0},
    "unrated": {"factor": 0.030, "modified_duration_multiplier": 1.0}
}

# Correlation Matrix - Main SCR Modules (Annex IV)
SCR_CORRELATION_MATRIX = {
    ("market", "default"):        0.25,
    ("market", "life"):           0.25,
    ("market", "health"):         0.25,
    ("market", "non_life"):       0.25,
    ("default", "life"):          0.25,
    ("default", "health"):        0.25,
    ("default", "non_life"):      0.50,
    ("life", "health"):           0.25,
    ("life", "non_life"):         0.00,
    ("health", "non_life"):       0.00
}

# Correlation Matrix - Market Risk (Annex IV)
MARKET_RISK_CORRELATIONS = {
    ("interest_rate_up", "equity"):      0.00,
    ("interest_rate_up", "property"):    0.00,
    ("interest_rate_up", "spread"):      0.00,
    ("interest_rate_up", "currency"):    0.25,
    ("interest_rate_down", "equity"):    0.50,
    ("interest_rate_down", "property"):  0.50,
    ("interest_rate_down", "spread"):    0.50,
    ("interest_rate_down", "currency"):  0.25,
    ("equity", "property"):              0.75,
    ("equity", "spread"):                0.75,
    ("equity", "currency"):              0.25,
    ("property", "spread"):              0.50,
    ("property", "currency"):            0.25,
    ("spread", "currency"):              0.25
}

# Correlation Matrix - Life Underwriting Risk (Annex IV)
LIFE_UNDERWRITING_CORRELATIONS = {
    ("mortality", "longevity"):          -0.25,
    ("mortality", "disability"):          0.25,
    ("mortality", "lapse"):               0.00,
    ("mortality", "expense"):             0.25,
    ("mortality", "revision"):            0.00,
    ("mortality", "catastrophe"):         0.25,
    ("longevity", "disability"):          0.00,
    ("longevity", "lapse"):               0.25,
    ("longevity", "expense"):             0.25,
    ("longevity", "revision"):            0.25,
    ("longevity", "catastrophe"):         0.00,
    ("disability", "lapse"):              0.00,
    ("disability", "expense"):            0.50,
    ("disability", "revision"):           0.00,
    ("disability", "catastrophe"):        0.25,
    ("lapse", "expense"):                 0.50,
    ("lapse", "revision"):                0.00,
    ("lapse", "catastrophe"):             0.25,
    ("expense", "revision"):              0.50,
    ("expense", "catastrophe"):           0.25,
    ("revision", "catastrophe"):          0.00
}


# ==============================================================================
# IFRS 17 PARAMETERS
# ==============================================================================

# Risk Adjustment - Cost of Capital rates by region
IFRS17_COC_RATES = {
    "EU": 0.06,        # 6% - Aligned with Solvency II
    "US": 0.06,        # 6% - Common practice
    "UK": 0.06,        # 6% - Aligned with pre-Brexit Solvency II
    "Asia": 0.06,      # 6% - Common practice
    "default": 0.06    # 6% default
}

# Risk Adjustment - Confidence Level Reference Points
IFRS17_CONFIDENCE_LEVELS = {
    "lower_bound": 0.70,   # 70th percentile - lower end of typical range
    "common": 0.75,        # 75th percentile - most common choice
    "higher": 0.85,        # 85th percentile - higher risk aversion
    "upper_bound": 0.95    # 95th percentile - upper end of typical range
}

# PAA Eligibility - Coverage Period Threshold (IFRS 17.53)
PAA_COVERAGE_PERIOD_THRESHOLD = 12  # months - PAA allowed if coverage ≤ 12 months


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def get_interest_rate_shock(maturity: float, direction: str = "up") -> float:
    """
    Get interpolated interest rate shock for a given maturity.
    
    Args:
        maturity: Maturity in years
        direction: "up" or "down"
        
    Returns:
        Absolute shock factor
    """
    maturities = sorted(INTEREST_RATE_SHOCKS.keys())
    
    if maturity <= maturities[0]:
        shocks = INTEREST_RATE_SHOCKS[maturities[0]]
        return shocks[0] if direction == "up" else shocks[1]
    
    if maturity >= maturities[-1]:
        shocks = INTEREST_RATE_SHOCKS[maturities[-1]]
        return shocks[0] if direction == "up" else shocks[1]
    
    # Linear interpolation
    for i in range(len(maturities) - 1):
        if maturities[i] <= maturity <= maturities[i + 1]:
            t1, t2 = maturities[i], maturities[i + 1]
            s1 = INTEREST_RATE_SHOCKS[t1][0 if direction == "up" else 1]
            s2 = INTEREST_RATE_SHOCKS[t2][0 if direction == "up" else 1]
            ratio = (maturity - t1) / (t2 - t1)
            return s1 + ratio * (s2 - s1)
    
    return 0.0


def get_equity_shock_with_symmetric_adjustment(
    base_shock: float,
    current_equity_index: float,
    reference_equity_index: float
) -> float:
    """
    Calculate equity shock including symmetric adjustment per Article 172.
    
    Args:
        base_shock: Base equity shock (e.g., 0.39 for Type 1)
        current_equity_index: Current equity index level
        reference_equity_index: 3-year rolling average reference level
        
    Returns:
        Adjusted equity shock
    """
    # Calculate raw symmetric adjustment
    raw_adjustment = 0.5 * ((current_equity_index / reference_equity_index) - 1)
    
    # Apply caps
    symmetric_adjustment = max(
        EQUITY_SYMMETRIC_ADJUSTMENT["max_negative"],
        min(EQUITY_SYMMETRIC_ADJUSTMENT["max_positive"], raw_adjustment)
    )
    
    return base_shock + symmetric_adjustment
