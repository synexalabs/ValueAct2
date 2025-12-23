"""
Risk Adjustment Calculation Module per IFRS 17.37

This module implements proper Risk Adjustment methodologies for non-financial risk
compensation as required by IFRS 17. Provides both Cost of Capital (CoC) and
Confidence Level approaches.

IFRS 17.37: "The risk adjustment for non-financial risk is the compensation 
an entity requires for bearing the uncertainty about the amount and timing 
of the cash flows that arises from non-financial risk."
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from scipy import stats
from functools import lru_cache


# Cost of Capital rates by jurisdiction and confidence level
COC_RATES = {
    "EU": 0.06,      # 6% - Solvency II standard
    "US": 0.06,      # 6% - Common US practice
    "UK": 0.06,      # 6% - UK Solvency II
    "default": 0.06  # 6% default
}

# Confidence level to percentile mapping
CONFIDENCE_PERCENTILES = {
    0.75: 0.675,   # 75th percentile z-score
    0.80: 0.842,
    0.85: 1.036,
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326
}


def calculate_risk_adjustment_coc(
    projected_scr: List[float],
    discount_rates: List[float],
    cost_of_capital_rate: float = 0.06,
    projection_years: int = None
) -> float:
    """
    Calculate Risk Adjustment using Cost of Capital (CoC) approach.
    
    This is the preferred approach under IFRS 17 as it provides a direct
    link to the capital required to support the insurance obligations.
    
    Formula: RA = CoC_rate × Σ(SCR_t × discount_factor_t)
    
    Args:
        projected_scr: List of projected SCR amounts by year
        discount_rates: List of discount rates by year (term structure)
        cost_of_capital_rate: Annual cost of capital rate (default 6%)
        projection_years: Number of years to project (defaults to len of SCR)
        
    Returns:
        Risk adjustment amount
        
    Example:
        >>> scr = [1000000, 950000, 900000, 850000, 800000]  # Declining SCR
        >>> rates = [0.03, 0.035, 0.04, 0.042, 0.045]  # Term structure
        >>> ra = calculate_risk_adjustment_coc(scr, rates)
    """
    if projection_years is None:
        projection_years = len(projected_scr)
    
    # Extend or truncate inputs to match projection years
    scr_values = projected_scr[:projection_years]
    if len(scr_values) < projection_years:
        # Extrapolate using last value
        last_scr = scr_values[-1] if scr_values else 0
        scr_values.extend([last_scr] * (projection_years - len(scr_values)))
    
    rates = discount_rates[:projection_years]
    if len(rates) < projection_years:
        # Extrapolate using last rate
        last_rate = rates[-1] if rates else 0.035
        rates.extend([last_rate] * (projection_years - len(rates)))
    
    # Calculate discounted SCR values
    pv_scr = 0.0
    for t, (scr, rate) in enumerate(zip(scr_values, rates)):
        discount_factor = 1 / (1 + rate) ** (t + 1)
        pv_scr += scr * discount_factor
    
    # Risk adjustment = CoC rate × PV of projected SCR
    risk_adjustment = cost_of_capital_rate * pv_scr
    
    return risk_adjustment


def calculate_risk_adjustment_confidence_level(
    fcf_mean: float,
    fcf_std: float,
    confidence_level: float = 0.75,
    distribution: str = "normal"
) -> float:
    """
    Calculate Risk Adjustment using Confidence Level approach.
    
    This approach calculates the compensation required to achieve a 
    specified confidence level for the fulfillment cash flows.
    
    Formula: RA = VaR_α(FCF) - E[FCF]
    
    Args:
        fcf_mean: Mean of fulfillment cash flows distribution
        fcf_std: Standard deviation of FCF distribution
        confidence_level: Target confidence level (0.75 recommended by IFRS 17)
        distribution: Assumed distribution ("normal", "lognormal")
        
    Returns:
        Risk adjustment amount
    """
    if confidence_level not in CONFIDENCE_PERCENTILES:
        # Interpolate z-score
        z_score = stats.norm.ppf(confidence_level)
    else:
        z_score = CONFIDENCE_PERCENTILES[confidence_level]
    
    if distribution == "normal":
        # VaR = mean + z * std
        var_value = fcf_mean + z_score * fcf_std
    elif distribution == "lognormal":
        # For lognormal, convert to log parameters
        sigma = np.sqrt(np.log(1 + (fcf_std / fcf_mean) ** 2))
        mu = np.log(fcf_mean) - 0.5 * sigma ** 2
        var_value = np.exp(mu + z_score * sigma)
    else:
        raise ValueError(f"Unsupported distribution: {distribution}")
    
    # Risk adjustment = VaR - Mean
    risk_adjustment = max(0, var_value - fcf_mean)
    
    return risk_adjustment


def calculate_projected_scr(
    portfolio_scr: float,
    projection_years: int,
    runoff_pattern: str = "linear"
) -> List[float]:
    """
    Project SCR values over the contract lifetime.
    
    Args:
        portfolio_scr: Current SCR for the portfolio
        projection_years: Number of years to project
        runoff_pattern: Pattern for SCR runoff ("linear", "exponential", "coverage_units")
        
    Returns:
        List of projected SCR values by year
    """
    if runoff_pattern == "linear":
        # Linear decrease to zero
        return [
            portfolio_scr * (1 - t / projection_years) 
            for t in range(projection_years)
        ]
    elif runoff_pattern == "exponential":
        # Exponential decay with 10% annual decrease
        decay_rate = 0.10
        return [
            portfolio_scr * np.exp(-decay_rate * t) 
            for t in range(projection_years)
        ]
    elif runoff_pattern == "coverage_units":
        # Based on sum assured in force pattern (typical for life insurance)
        # Assumes approximately 2% annual decrease in first years, accelerating later
        pattern = []
        remaining = 1.0
        for t in range(projection_years):
            pattern.append(portfolio_scr * remaining)
            if t < 5:
                remaining *= 0.98  # 2% decrease
            elif t < 10:
                remaining *= 0.95  # 5% decrease
            else:
                remaining *= 0.90  # 10% decrease
        return pattern
    else:
        raise ValueError(f"Unsupported runoff pattern: {runoff_pattern}")


def calculate_risk_adjustment_portfolio(
    portfolio_data: pd.DataFrame,
    assumptions: Dict[str, Any],
    method: str = "coc"
) -> Dict[str, Any]:
    """
    Calculate Risk Adjustment for a portfolio using specified method.
    
    This is the main entry point for risk adjustment calculations.
    
    Args:
        portfolio_data: DataFrame with policy data
        assumptions: Calculation assumptions including:
            - confidence_level: Target confidence (default 0.75)
            - cost_of_capital_rate: CoC rate (default 0.06)
            - discount_rate: Discount rate or term structure
            - jurisdiction: For CoC rate selection
        method: Calculation method ("coc" or "confidence_level")
        
    Returns:
        Dictionary containing:
            - risk_adjustment: Total RA amount
            - ra_by_policy: RA allocated to each policy
            - methodology: Method used
            - parameters: Parameters used
    """
    confidence_level = assumptions.get("confidence_level", 0.75)
    jurisdiction = assumptions.get("jurisdiction", "default")
    coc_rate = assumptions.get("cost_of_capital_rate", COC_RATES.get(jurisdiction, 0.06))
    discount_rate = assumptions.get("discount_rate", 0.035)
    
    # Calculate total FCF and variability
    total_fcf = portfolio_data.get("fcf", pd.Series([0])).sum() if "fcf" in portfolio_data.columns else 0
    fcf_std = abs(total_fcf) * 0.15  # Assume 15% coefficient of variation
    
    if method == "coc":
        # Estimate SCR from portfolio
        total_face_amount = portfolio_data["face_amount"].sum()
        estimated_scr = total_face_amount * 0.25  # Simplified SCR estimate
        
        # Get average policy term for projection
        avg_term = int(portfolio_data.get("policy_term", pd.Series([20])).mean())
        
        # Project SCR
        projected_scr = calculate_projected_scr(estimated_scr, avg_term, "coverage_units")
        
        # Use flat discount rate if term structure not provided
        discount_rates = [discount_rate] * avg_term
        
        total_ra = calculate_risk_adjustment_coc(
            projected_scr=projected_scr,
            discount_rates=discount_rates,
            cost_of_capital_rate=coc_rate
        )
        
    elif method == "confidence_level":
        total_ra = calculate_risk_adjustment_confidence_level(
            fcf_mean=abs(total_fcf),
            fcf_std=fcf_std,
            confidence_level=confidence_level
        )
    else:
        raise ValueError(f"Unsupported RA method: {method}")
    
    # Allocate RA to policies proportionally to face amount
    total_face = portfolio_data["face_amount"].sum()
    ra_by_policy = []
    
    for _, row in portfolio_data.iterrows():
        allocation = (row["face_amount"] / total_face) * total_ra if total_face > 0 else 0
        ra_by_policy.append({
            "policy_id": row.get("policy_id", "Unknown"),
            "risk_adjustment": float(allocation)
        })
    
    return {
        "risk_adjustment": float(total_ra),
        "ra_by_policy": ra_by_policy,
        "methodology": method,
        "parameters": {
            "confidence_level": confidence_level,
            "cost_of_capital_rate": coc_rate if method == "coc" else None,
            "jurisdiction": jurisdiction
        }
    }


# Confidence level to CoC rate mapping (for disclosure purposes)
CONFIDENCE_TO_COC_MAPPING = {
    0.75: {"equiv_coc": 0.04, "description": "Lower end of typical range"},
    0.85: {"equiv_coc": 0.06, "description": "Middle of typical range"},
    0.95: {"equiv_coc": 0.10, "description": "Upper end of typical range"}
}


def get_confidence_level_equivalent(coc_rate: float) -> float:
    """
    Get approximate confidence level equivalent for a given CoC rate.
    Useful for disclosure requirements under IFRS 17.119.
    
    Args:
        coc_rate: Cost of capital rate
        
    Returns:
        Approximate equivalent confidence level
    """
    # Approximate mapping based on industry studies
    if coc_rate <= 0.04:
        return 0.70
    elif coc_rate <= 0.06:
        return 0.80
    elif coc_rate <= 0.08:
        return 0.85
    elif coc_rate <= 0.10:
        return 0.90
    else:
        return 0.95
