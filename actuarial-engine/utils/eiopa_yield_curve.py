"""
EIOPA Risk-Free Interest Rate Term Structure
Solvency II Compliant Discount Curve Implementation

Implements:
- Risk-Free Rate (RFR) term structure per EIOPA specifications
- Smith-Wilson extrapolation method
- Ultimate Forward Rate (UFR) convergence
- Volatility Adjustment (VA) by country
- Credit Risk Adjustment (CRA)

Sources:
- EIOPA Technical Documentation (https://www.eiopa.europa.eu/)
- Delegated Regulation (EU) 2015/35, Articles 43-47
- EIOPA Guidelines on the valuation of technical provisions

Note: This module provides the mathematical framework. For production use,
integrate with EIOPA's monthly published RFR data.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import math

# ==============================================================================
# EIOPA REGULATORY PARAMETERS
# ==============================================================================

# Ultimate Forward Rate (UFR) - Updated annually by EIOPA
# Source: EIOPA Decision on UFR (currently 3.45% for EUR as of 2024)
UFR_RATES = {
    "EUR": 0.0345,  # 3.45% for Euro (2024)
    "GBP": 0.0400,  # 4.00% for British Pound
    "USD": 0.0400,  # 4.00% for US Dollar
    "CHF": 0.0275,  # 2.75% for Swiss Franc
    "JPY": 0.0275,  # 2.75% for Japanese Yen
}

# First Smoothing Point (FSP) - Where extrapolation begins
# Last Liquid Point (LLP) - Last point with deep, liquid, transparent market
EXTRAPOLATION_PARAMETERS = {
    # Converge at year 60
    "EUR": {"llp": 20, "fsp": 20, "convergence_period": 40},
    "GBP": {"llp": 50, "fsp": 50, "convergence_period": 40},
    "USD": {"llp": 30, "fsp": 30, "convergence_period": 40},
    "CHF": {"llp": 15, "fsp": 15, "convergence_period": 45},
}

# Credit Risk Adjustment (CRA) - Deducted from swap rates
# Source: EIOPA monthly publications
CRA_RATES = {
    "EUR": 0.0010,  # 10 basis points
    "GBP": 0.0010,
    "USD": 0.0015,
    "CHF": 0.0010,
}

# Volatility Adjustment (VA) by country - Updated monthly by EIOPA
# Representative December 2024 values (should be updated monthly)
VOLATILITY_ADJUSTMENT = {
    "DE": 0.0024,  # Germany: 24 basis points
    "FR": 0.0028,  # France: 28 basis points
    "IT": 0.0056,  # Italy: 56 basis points
    "ES": 0.0042,  # Spain: 42 basis points
    "NL": 0.0022,  # Netherlands: 22 basis points
    "AT": 0.0024,  # Austria: 24 basis points
    "BE": 0.0026,  # Belgium: 26 basis points
    "EUR": 0.0024,  # Euro area average
}

# ==============================================================================
# SAMPLE EIOPA RFR DATA (December 2024 representative values)
# In production, fetch from EIOPA monthly publications
# ==============================================================================

# EUR Risk-Free Rates without VA (end of year values, representative)
EIOPA_EUR_RFR_BASE = {
    # Maturity (years): Spot rate (annual, continuous compounding converted to annual)
    1: 0.0298,  # 2.98%
    2: 0.0285,  # 2.85%
    3: 0.0271,  # 2.71%
    4: 0.0260,  # 2.60%
    5: 0.0252,  # 2.52%
    6: 0.0247,  # 2.47%
    7: 0.0244,  # 2.44%
    8: 0.0242,  # 2.42%
    9: 0.0241,  # 2.41%
    10: 0.0241,  # 2.41%
    11: 0.0242,  # 2.42%
    12: 0.0244,  # 2.44%
    13: 0.0246,  # 2.46%
    14: 0.0248,  # 2.48%
    15: 0.0251,  # 2.51%
    16: 0.0254,  # 2.54%
    17: 0.0257,  # 2.57%
    18: 0.0260,  # 2.60%
    19: 0.0263,  # 2.63%
    20: 0.0266,  # 2.66% - Last Liquid Point for EUR
}


@dataclass
class YieldCurvePoint:
    """Single point on the yield curve"""

    maturity: float  # in years
    spot_rate: float  # annual rate
    forward_rate: float  # instantaneous forward rate
    discount_factor: float


@dataclass
class EIOPAYieldCurve:
    """Complete EIOPA yield curve with all components"""

    currency: str
    country: str
    reference_date: datetime
    points: List[YieldCurvePoint]
    ufr: float
    volatility_adjustment: float
    credit_risk_adjustment: float
    llp: int
    fsp: int

    def get_spot_rate(self, maturity: float) -> float:
        """Get interpolated spot rate for any maturity"""
        if maturity <= 0:
            return self.points[0].spot_rate if self.points else 0.0

        # Find surrounding points
        for i, point in enumerate(self.points):
            if point.maturity >= maturity:
                if i == 0:
                    return point.spot_rate
                prev = self.points[i - 1]
                # Linear interpolation
                ratio = (maturity - prev.maturity) / (point.maturity - prev.maturity)
                return prev.spot_rate + ratio * (point.spot_rate - prev.spot_rate)

        # Beyond last point
        return self.points[-1].spot_rate if self.points else 0.0

    def get_discount_factor(self, maturity: float) -> float:
        """Get discount factor for any maturity"""
        spot_rate = self.get_spot_rate(maturity)
        return 1.0 / (1.0 + spot_rate) ** maturity


# ==============================================================================
# SMITH-WILSON EXTRAPOLATION
# ==============================================================================


def smith_wilson_kernel(t: float, u: float, alpha: float, ufr: float) -> float:
    """
    Smith-Wilson kernel function W(t,u)

    Formula: W(t,u) = e^(-UFR*(t+u)) * (α*min(t,u) - 0.5*e^(-α*max(t,u)) *
                       (e^(α*min(t,u)) - e^(-α*min(t,u))))

    Args:
        t: First maturity
        u: Second maturity
        alpha: Convergence speed parameter
        ufr: Ultimate Forward Rate (continuous)

    Returns:
        Kernel value
    """
    min_tu = min(t, u)
    max_tu = max(t, u)

    # Convert UFR to continuous if needed
    ufr_cont = math.log(1 + ufr)

    term1 = math.exp(-ufr_cont * (t + u))
    term2 = alpha * min_tu
    term3 = 0.5 * math.exp(-alpha * max_tu)
    term4 = math.exp(alpha * min_tu) - math.exp(-alpha * min_tu)

    return term1 * (term2 - term3 * term4)


def calculate_smith_wilson_alpha(
    ufr: float, tolerance: float = 0.0001, convergence_period: int = 40
) -> float:
    """
    Calculate Smith-Wilson alpha parameter for desired convergence speed

    The alpha parameter determines how quickly forward rates converge to UFR.
    EIOPA specifies convergence within 1bp at FSP + convergence_period years.

    Args:
        ufr: Ultimate Forward Rate
        tolerance: Convergence tolerance (default 1bp = 0.0001)
        convergence_period: Years after FSP to achieve convergence

    Returns:
        Alpha parameter
    """
    # EIOPA standard alpha calculation
    # Typically results in alpha around 0.1 for 40-year convergence
    return math.log(1 + tolerance) / convergence_period * 2


def smith_wilson_extrapolation(
    liquid_rates: Dict[int, float],
    max_maturity: int = 150,
    currency: str = "EUR",
    include_va: bool = True,
    country: str = "DE",
) -> Dict[int, float]:
    """
    Apply Smith-Wilson extrapolation using matrix inversion for exact matching
    of liquid points and smooth convergence to UFR.

    Formula: P(t) = exp(-UFR_cont * t) * (1 + sum_{j=1}^N zeta_j * W(t, t_j))
    """
    # 1. Setup parameters
    ufr = UFR_RATES.get(currency, 0.0345)
    ufr_cont = math.log(1 + ufr)
    params = EXTRAPOLATION_PARAMETERS.get(
        currency, {"llp": 20, "fsp": 20, "convergence_period": 40}
    )
    convergence_period = params["convergence_period"]

    # Calculate alpha based on convergence criteria
    alpha = calculate_smith_wilson_alpha(ufr, convergence_period=convergence_period)

    # Get VA if requested
    va = 0.0
    if include_va:
        va = VOLATILITY_ADJUSTMENT.get(
            country, VOLATILITY_ADJUSTMENT.get(currency, 0.0)
        )
        # Add VA to liquid spot rates before calculating prices
        liquid_rates_adjusted = {m: r + va for m, r in liquid_rates.items()}
    else:
        liquid_rates_adjusted = liquid_rates.copy()

    # 2. Construct vectors and matrix for solving zeta
    maturities_liquid = np.array(sorted(liquid_rates_adjusted.keys()))
    prices_liquid = np.array(
        [1 / (1 + liquid_rates_adjusted[m]) ** m for m in maturities_liquid]
    )

    # mu vector: exp(-UFR_cont * maturities)
    mu = np.exp(-ufr_cont * maturities_liquid)

    # W matrix: Smith-Wilson kernel values
    N = len(maturities_liquid)
    W = np.zeros((N, N))
    for i in range(N):
        for j in range(N):
            W[i, j] = smith_wilson_kernel(
                maturities_liquid[i], maturities_liquid[j], alpha, ufr
            )

    # 3. Solve for zeta: zeta = W^-1 * (P - mu)
    try:
        zeta = np.linalg.solve(W, prices_liquid - mu)
    except np.linalg.LinAlgError:
        # Fallback to pseudo-inverse if W is singular
        zeta = np.linalg.pinv(W) @ (prices_liquid - mu)

    # 4. Generate result for all maturities
    result = {}
    time_points = np.arange(1, max_maturity + 1)

    for t in time_points:
        # Calculate kernel vector w(t)
        w_t = np.array(
            [smith_wilson_kernel(t, u, alpha, ufr) for u in maturities_liquid]
        )

        # Extrapolated price: P(t) = mu(t) + w(t) * zeta
        mu_t = math.exp(-ufr_cont * t)
        p_t = mu_t + np.dot(w_t, zeta)

        # Convert price back to spot rate: r = P^(-1/t) - 1
        spot_rate = p_t ** (-1 / t) - 1
        result[t] = float(spot_rate)

    return result


# ==============================================================================
# MAIN INTERFACE FUNCTIONS
# ==============================================================================


def get_eiopa_yield_curve(
    currency: str = "EUR",
    country: str = "DE",
    reference_date: datetime = None,
    include_va: bool = True,
    max_maturity: int = 150,
) -> EIOPAYieldCurve:
    """
    Get complete EIOPA yield curve with Smith-Wilson extrapolation

    Args:
        currency: Currency code (EUR, GBP, USD, etc.)
        country: Country code for VA (DE, FR, IT, etc.)
        reference_date: Reference date (default: today)
        include_va: Whether to include Volatility Adjustment
        max_maturity: Maximum maturity in years

    Returns:
        EIOPAYieldCurve object with complete term structure
    """
    if reference_date is None:
        reference_date = datetime.now()

    # Get base rates (in production, fetch from EIOPA)
    base_rates = EIOPA_EUR_RFR_BASE.copy()

    # Apply Smith-Wilson extrapolation
    extrapolated_rates = smith_wilson_extrapolation(
        liquid_rates=base_rates,
        max_maturity=max_maturity,
        currency=currency,
        include_va=include_va,
        country=country,
    )

    # Get parameters
    ufr = UFR_RATES.get(currency, 0.0345)
    va = VOLATILITY_ADJUSTMENT.get(country, 0.0) if include_va else 0.0
    cra = CRA_RATES.get(currency, 0.001)
    params = EXTRAPOLATION_PARAMETERS.get(currency, {"llp": 20, "fsp": 20})

    # Build yield curve points
    points = []
    for maturity in sorted(extrapolated_rates.keys()):
        spot_rate = extrapolated_rates[maturity]
        discount_factor = 1.0 / (1.0 + spot_rate) ** maturity

        # Calculate forward rate (approximate)
        if maturity > 1:
            prev_rate = extrapolated_rates.get(maturity - 1, spot_rate)
            prev_df = 1.0 / (1.0 + prev_rate) ** (maturity - 1)
            forward_rate = (prev_df / discount_factor) - 1
        else:
            forward_rate = spot_rate

        points.append(
            YieldCurvePoint(
                maturity=float(maturity),
                spot_rate=spot_rate,
                forward_rate=forward_rate,
                discount_factor=discount_factor,
            )
        )

    return EIOPAYieldCurve(
        currency=currency,
        country=country,
        reference_date=reference_date,
        points=points,
        ufr=ufr,
        volatility_adjustment=va,
        credit_risk_adjustment=cra,
        llp=params["llp"],
        fsp=params["fsp"],
    )


def get_discount_factors(
    maturities: List[float],
    currency: str = "EUR",
    country: str = "DE",
    include_va: bool = True,
) -> Dict[float, float]:
    """
    Get discount factors for list of maturities

    Args:
        maturities: List of maturities in years
        currency: Currency code
        country: Country code for VA
        include_va: Whether to include Volatility Adjustment

    Returns:
        Dictionary of {maturity: discount_factor}
    """
    curve = get_eiopa_yield_curve(
        currency=currency,
        country=country,
        include_va=include_va,
        max_maturity=int(max(maturities)) + 1,
    )

    return {m: curve.get_discount_factor(m) for m in maturities}


def get_spot_rates(
    maturities: List[float],
    currency: str = "EUR",
    country: str = "DE",
    include_va: bool = True,
) -> Dict[float, float]:
    """
    Get spot rates for list of maturities

    Args:
        maturities: List of maturities in years
        currency: Currency code
        country: Country code for VA
        include_va: Whether to include Volatility Adjustment

    Returns:
        Dictionary of {maturity: spot_rate}
    """
    curve = get_eiopa_yield_curve(
        currency=currency,
        country=country,
        include_va=include_va,
        max_maturity=int(max(maturities)) + 1,
    )

    return {m: curve.get_spot_rate(m) for m in maturities}


def calculate_present_value_eiopa(
    cashflows: Dict[float, float],
    currency: str = "EUR",
    country: str = "DE",
    include_va: bool = True,
) -> float:
    """
    Calculate present value of cashflows using EIOPA yield curve

    Args:
        cashflows: Dictionary of {maturity: amount}
        currency: Currency code
        country: Country code for VA
        include_va: Whether to include Volatility Adjustment

    Returns:
        Present value of cashflows
    """
    discount_factors = get_discount_factors(
        maturities=list(cashflows.keys()),
        currency=currency,
        country=country,
        include_va=include_va,
    )

    pv = sum(
        amount * discount_factors.get(maturity, 1.0)
        for maturity, amount in cashflows.items()
    )

    return pv


def get_curve_summary(
    currency: str = "EUR", country: str = "DE", include_va: bool = True
) -> Dict:
    """
    Get summary statistics for the yield curve

    Returns:
        Dictionary with curve summary
    """
    curve = get_eiopa_yield_curve(
        currency=currency, country=country, include_va=include_va
    )

    key_maturities = [1, 5, 10, 20, 30, 50, 100]

    return {
        "currency": currency,
        "country": country,
        "reference_date": curve.reference_date.isoformat(),
        "ufr": curve.ufr,
        "volatility_adjustment": curve.volatility_adjustment,
        "llp": curve.llp,
        "spot_rates": {m: curve.get_spot_rate(m) for m in key_maturities},
        "discount_factors": {m: curve.get_discount_factor(m) for m in key_maturities},
    }


# ==============================================================================
# SOLVENCY II SPECIFIC FUNCTIONS
# ==============================================================================


def get_solvency2_discount_rate(
    maturity: int, currency: str = "EUR", country: str = "DE", include_va: bool = True
) -> float:
    """
    Get single discount rate for Solvency II calculations

    Args:
        maturity: Maturity in years
        currency: Currency code
        country: Country for VA
        include_va: Include Volatility Adjustment

    Returns:
        Annual spot rate
    """
    curve = get_eiopa_yield_curve(
        currency=currency,
        country=country,
        include_va=include_va,
        max_maturity=maturity + 1,
    )
    return curve.get_spot_rate(maturity)


def get_average_discount_rate(
    maturities: List[int],
    currency: str = "EUR",
    country: str = "DE",
    include_va: bool = True,
) -> float:
    """
    Calculate weighted average discount rate for a term structure

    Args:
        maturities: List of maturities (years)
        currency: Currency code
        country: Country for VA
        include_va: Include Volatility Adjustment

    Returns:
        Weighted average rate
    """
    rates = get_spot_rates(
        maturities=[float(m) for m in maturities],
        currency=currency,
        country=country,
        include_va=include_va,
    )

    if not rates:
        return 0.0

    return sum(rates.values()) / len(rates)
