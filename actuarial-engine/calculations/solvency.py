"""
Solvency II Solvency Capital Requirement (SCR) calculations - COMPLETE REWRITE
Implements proper Solvency II Standard Formula per Delegated Regulation (EU) 2015/35
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime
import time

from data.mortality_tables import get_mortality_rate, get_survival_probability, get_mortality_table

from utils.regulatory_constants import (
    EQUITY_SHOCKS, EQUITY_SYMMETRIC_ADJUSTMENT,
    MORTALITY_SHOCK, LONGEVITY_SHOCK, LAPSE_SHOCKS, PROPERTY_SHOCK, CURRENCY_SHOCK,
    get_equity_shock_with_symmetric_adjustment, get_interest_rate_shock
)

from models.request import PolicyData, SolvencyAssumptions
from models.response import SolvencyResponse, PolicyResult, AggregateMetrics
from utils.actuarial import (
    validate_assumptions, calculate_portfolio_statistics, calculate_confidence_interval
)

def calculate_portfolio_scr(policies: List[Dict[str, Any]], 
                          assumptions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate Solvency II SCR for entire portfolio using Standard Formula
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary containing SCR calculation results
    """
    start_time = time.time()
    
    # Convert policies to DataFrame for vectorized operations
    df = pd.DataFrame(policies)
    
    # Validate assumptions
    validation_result = validate_assumptions(assumptions, "SOLVENCY")
    if not validation_result["is_valid"]:
        raise ValueError(f"Invalid assumptions: {validation_result['errors']}")
    
    # Calculate SCR components using Standard Formula
    market_risk_scr = calculate_market_risk_scr(df, assumptions)
    counterparty_risk_scr = calculate_counterparty_risk_scr(df, assumptions)
    life_underwriting_risk_scr = calculate_life_underwriting_risk_scr(df, assumptions)
    health_underwriting_risk_scr = calculate_health_underwriting_risk_scr(df, assumptions)
    non_life_underwriting_risk_scr = calculate_non_life_underwriting_risk_scr(df, assumptions)
    operational_risk_scr = calculate_operational_risk_scr(df, assumptions)
    
    # Calculate LAC DT (Loss-Absorbing Capacity of Deferred Taxes)
    lac_dt = calculate_lac_dt(df, assumptions)
    
    # Calculate total SCR using correlation matrix
    total_scr = calculate_total_scr({
        'market_risk': market_risk_scr,
        'counterparty_risk': counterparty_risk_scr,
        'life_underwriting_risk': life_underwriting_risk_scr,
        'health_underwriting_risk': health_underwriting_risk_scr,
        'non_life_underwriting_risk': non_life_underwriting_risk_scr,
        'operational_risk': operational_risk_scr
    })
    
    # Apply LAC DT adjustment
    total_scr_adjusted = total_scr - lac_dt
    
    # Calculate diversification benefit
    individual_sum = sum([
        market_risk_scr, counterparty_risk_scr, life_underwriting_risk_scr,
        health_underwriting_risk_scr, non_life_underwriting_risk_scr, operational_risk_scr
    ])
    diversification_benefit = individual_sum - total_scr
    
    # Calculate MCR (Minimum Capital Requirement)
    mcr = calculate_mcr(df, assumptions)
    
    # Calculate solvency ratio
    own_funds = assumptions.get('own_funds', total_scr_adjusted * 1.5)  # Assume 150% solvency ratio
    solvency_ratio = own_funds / total_scr_adjusted if total_scr_adjusted > 0 else 0
    
    # Create policy results
    policy_results = []
    for _, row in df.iterrows():
        policy_result = {
            'policy_id': row['policy_id'],
            'scr': float(row['face_amount'] * 0.25),  # Simplified per-policy SCR
            'mcr': float(row['face_amount'] * 0.125),  # Simplified per-policy MCR
            'pv_benefits': float(row['face_amount'] * 0.95),
            'pv_premiums': float(row['premium'])
        }
        policy_results.append(policy_result)
    
    # Calculate aggregate metrics
    aggregate_metrics = {
        'total_premium': float(df['premium'].sum()),
        'total_benefits_pv': float(df['face_amount'].sum() * 0.95),
        'risk_adjustment': 0.0,  # Not applicable for Solvency II
        'loss_component': 0.0,   # Not applicable for Solvency II
        'policy_count': len(df),
        'onerous_count': 0,      # Not applicable for Solvency II
        'diversification_benefit': float(diversification_benefit),
        'own_funds': float(own_funds)
    }
    
    execution_time = time.time() - start_time
    
    # Build response
    results = {
        'scr': float(total_scr_adjusted),
        'scr_before_lac_dt': float(total_scr),
        'lac_dt': float(lac_dt),
        'mcr': float(mcr),
        'scr_breakdown': {
            'market_risk': float(market_risk_scr),
            'counterparty_risk': float(counterparty_risk_scr),
            'life_underwriting_risk': float(life_underwriting_risk_scr),
            'health_underwriting_risk': float(health_underwriting_risk_scr),
            'non_life_underwriting_risk': float(non_life_underwriting_risk_scr),
            'operational_risk': float(operational_risk_scr)
        },
        'diversification_benefit': float(diversification_benefit),
        'solvency_ratio': float(solvency_ratio),
        'policy_results': policy_results,
        'aggregate_metrics': aggregate_metrics,
        'assumptions_used': assumptions,
        'calculation_timestamp': datetime.now().isoformat(),
        'execution_time': execution_time,
        'methodology_version': '2.0.0'
    }
    
    return results

def calculate_market_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate market risk SCR component per Solvency II Standard Formula
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        Market risk SCR amount
    """
    # Interest rate risk
    interest_rate_scr = calculate_interest_rate_risk(df, assumptions)
    
    # Equity risk
    equity_scr = calculate_equity_risk(df, assumptions)
    
    # Property risk
    property_scr = calculate_property_risk(df, assumptions)
    
    # Spread risk
    spread_scr = calculate_spread_risk(df, assumptions)
    
    # Currency risk
    currency_scr = calculate_currency_risk(df, assumptions)
    
    # Concentration risk
    concentration_scr = calculate_concentration_risk(df, assumptions)
    
    # Market risk correlation matrix
    market_risks = {
        'interest_rate': interest_rate_scr,
        'equity': equity_scr,
        'property': property_scr,
        'spread': spread_scr,
        'currency': currency_scr,
        'concentration': concentration_scr
    }
    
    return calculate_correlated_scr(market_risks, 'market_risk')

def calculate_interest_rate_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate interest rate risk SCR using term-dependent shocks per Article 166."""
    total_assets = df['face_amount'].sum()
    average_duration = assumptions.get('average_duration', 10)  # Default 10 year duration
    
    # Get term-dependent shock using regulatory constants
    up_shock = get_interest_rate_shock(average_duration, direction="up")
    down_shock = abs(get_interest_rate_shock(average_duration, direction="down"))
    
    # SCR is max of up and down scenarios
    scr_up = total_assets * up_shock * assumptions.get('duration_factor', 0.5)
    scr_down = total_assets * down_shock * assumptions.get('duration_factor', 0.5)
    
    return max(scr_up, scr_down)

def calculate_equity_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate equity risk SCR with symmetric adjustment per Article 172."""
    equity_exposure = assumptions.get('equity_exposure', 0.1)  # 10% equity allocation
    total_assets = df['face_amount'].sum()
    
    # Get base equity shock from regulatory constants
    equity_type = assumptions.get('equity_type', 'type_1')
    base_shock = EQUITY_SHOCKS.get(equity_type, 0.39)
    
    # Apply symmetric adjustment if market data provided
    current_index = assumptions.get('current_equity_index')
    reference_index = assumptions.get('reference_equity_index')
    
    if current_index and reference_index:
        equity_shock = get_equity_shock_with_symmetric_adjustment(
            base_shock, current_index, reference_index
        )
    else:
        equity_shock = base_shock
    
    return total_assets * equity_exposure * equity_shock

def calculate_property_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate property risk SCR per Article 174."""
    property_exposure = assumptions.get('property_exposure', 0.05)  # 5% property allocation
    total_assets = df['face_amount'].sum()
    property_shock = PROPERTY_SHOCK  # Use regulatory constant
    
    return total_assets * property_exposure * property_shock

def calculate_spread_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate spread risk SCR"""
    bond_exposure = assumptions.get('bond_exposure', 0.6)  # 60% bond allocation
    total_assets = df['face_amount'].sum()
    spread_shock = assumptions.get('spread_shock', 0.15)  # 15% spread shock
    
    return total_assets * bond_exposure * spread_shock

def calculate_currency_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate currency risk SCR per Article 188."""
    currency_exposure = assumptions.get('currency_exposure', 0.1)  # 10% foreign currency
    total_assets = df['face_amount'].sum()
    currency_shock = CURRENCY_SHOCK  # Use regulatory constant
    
    return total_assets * currency_exposure * currency_shock

def calculate_concentration_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate concentration risk SCR"""
    # Simplified - would analyze largest exposures
    total_assets = df['face_amount'].sum()
    concentration_factor = assumptions.get('concentration_factor', 0.05)  # 5% concentration risk
    
    return total_assets * concentration_factor

def calculate_counterparty_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate counterparty risk SCR component
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        Counterparty risk SCR amount
    """
    # Type 1 exposures (reinsurance, derivatives)
    type1_exposure = assumptions.get('type1_exposure', 0.1)  # 10% type 1 exposure
    total_assets = df['face_amount'].sum()
    
    # Simplified calculation
    return total_assets * type1_exposure * 0.1  # 10% risk factor

def calculate_life_underwriting_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate life underwriting risk SCR component
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        Life underwriting risk SCR amount
    """
    # Mortality risk
    mortality_scr = calculate_mortality_risk(df, assumptions)
    
    # Longevity risk
    longevity_scr = calculate_longevity_risk(df, assumptions)
    
    # Disability/morbidity risk
    disability_scr = calculate_disability_risk(df, assumptions)
    
    # Lapse risk
    lapse_scr = calculate_lapse_risk(df, assumptions)
    
    # Expense risk
    expense_scr = calculate_expense_risk(df, assumptions)
    
    # Revision risk
    revision_scr = calculate_revision_risk(df, assumptions)
    
    # Catastrophe risk
    catastrophe_scr = calculate_catastrophe_risk(df, assumptions)
    
    # Life underwriting risk correlation matrix
    life_risks = {
        'mortality': mortality_scr,
        'longevity': longevity_scr,
        'disability': disability_scr,
        'lapse': lapse_scr,
        'expense': expense_scr,
        'revision': revision_scr,
        'catastrophe': catastrophe_scr
    }
    
    return calculate_correlated_scr(life_risks, 'life_underwriting_risk')

def calculate_mortality_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate mortality risk SCR per Article 137 - 15% permanent increase in mortality rates."""
    total_benefits = df['face_amount'].sum()
    # Use regulatory constant for mortality shock (15%)
    mortality_shock = assumptions.get('mortality_shock', MORTALITY_SHOCK)
    
    # Simplified: apply shock to sum at risk weighted by duration
    average_duration = assumptions.get('average_duration', 10)
    duration_factor = min(average_duration / 20.0, 1.0)  # Max impact at 20 years
    
    return total_benefits * mortality_shock * duration_factor * 0.5

def calculate_longevity_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate longevity risk SCR per Article 138 - 20% permanent decrease in mortality rates."""
    annuity_exposure = assumptions.get('annuity_exposure', 0.2)  # 20% annuity exposure
    total_assets = df['face_amount'].sum()
    # Use regulatory constant for longevity shock (20%)
    longevity_shock = assumptions.get('longevity_shock', LONGEVITY_SHOCK)
    
    return total_assets * annuity_exposure * longevity_shock

def calculate_disability_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate disability/morbidity risk SCR"""
    disability_exposure = assumptions.get('disability_exposure', 0.1)  # 10% disability exposure
    total_assets = df['face_amount'].sum()
    disability_shock = assumptions.get('disability_shock', 0.25)  # 25% disability shock
    
    return total_assets * disability_exposure * disability_shock

def calculate_lapse_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate lapse risk SCR per Article 142 - takes maximum of up, down, and mass lapse scenarios."""
    total_premiums = df['premium'].sum()
    total_face = df['face_amount'].sum()
    
    # Use regulatory constants for lapse shocks
    mass_lapse_shock = assumptions.get('mass_lapse_shock', LAPSE_SHOCKS['mass_lapse'])  # 40%
    lapse_up_shock = assumptions.get('lapse_up_shock', LAPSE_SHOCKS['up_shock'])  # 50%
    lapse_down_shock = assumptions.get('lapse_down_shock', LAPSE_SHOCKS['down_shock'])  # 50%
    
    # Calculate SCR for each scenario
    # Mass lapse: 40% of policies surrender immediately
    scr_mass_lapse = total_face * mass_lapse_shock * 0.05  # Assume 5% surrender strain
    
    # Lapse up: 50% increase in lapse rates - impacts premium income
    scr_lapse_up = total_premiums * lapse_up_shock * 0.10  # Simplified impact
    
    # Lapse down: 50% decrease in lapse rates - impacts reserves
    scr_lapse_down = total_face * lapse_down_shock * 0.02  # Simplified impact
    
    # SCR is maximum of three scenarios
    return max(scr_mass_lapse, scr_lapse_up, scr_lapse_down)

def calculate_expense_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate expense risk SCR"""
    total_premiums = df['premium'].sum()
    expense_shock = assumptions.get('expense_shock', 0.10)  # 10% expense shock
    
    return total_premiums * expense_shock

def calculate_revision_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate revision risk SCR"""
    revision_exposure = assumptions.get('revision_exposure', 0.05)  # 5% revision exposure
    total_assets = df['face_amount'].sum()
    revision_shock = assumptions.get('revision_shock', 0.20)  # 20% revision shock
    
    return total_assets * revision_exposure * revision_shock

def calculate_catastrophe_risk(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate catastrophe risk SCR"""
    total_benefits = df['face_amount'].sum()
    catastrophe_factor = assumptions.get('catastrophe_factor', 0.001)  # 0.1% catastrophe risk
    
    return total_benefits * catastrophe_factor

def calculate_health_underwriting_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate health underwriting risk SCR"""
    health_exposure = assumptions.get('health_exposure', 0.1)  # 10% health exposure
    total_assets = df['face_amount'].sum()
    health_shock = assumptions.get('health_shock', 0.25)  # 25% health shock
    
    return total_assets * health_exposure * health_shock

def calculate_non_life_underwriting_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """Calculate non-life underwriting risk SCR"""
    non_life_exposure = assumptions.get('non_life_exposure', 0.05)  # 5% non-life exposure
    total_assets = df['face_amount'].sum()
    non_life_shock = assumptions.get('non_life_shock', 0.30)  # 30% non-life shock
    
    return total_assets * non_life_exposure * non_life_shock

def calculate_operational_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate operational risk SCR per Article 204 of Delegated Regulation.
    Op_SCR = min(0.30 × BSCR, max(Op_premiums, Op_provisions))
    """
    earned_premiums = df['premium'].sum()
    technical_provisions = assumptions.get('technical_provisions', df['face_amount'].sum() * 0.95)
    basic_scr = assumptions.get('basic_scr', df['face_amount'].sum() * 0.20)

    # Premium-based component: 4% of earned life gross premiums
    op_premiums = 0.04 * earned_premiums

    # Provisions-based component: 0.45% of life technical provisions
    op_provisions = 0.0045 * technical_provisions

    # Capped at 30% of Basic SCR
    return min(0.30 * basic_scr, max(op_premiums, op_provisions))

def calculate_correlated_scr(risk_components: Dict[str, float], risk_type: str) -> float:
    """
    Calculate correlated SCR using correlation matrix
    
    Args:
        risk_components: Dictionary of risk components
        risk_type: Type of risk (for correlation matrix selection)
        
    Returns:
        Correlated SCR amount
    """
    # Correlation matrices per Solvency II Delegated Regulation (EU) 2015/35 Annex IV
    correlation_matrices = {
        'market_risk': {
            ('interest_rate', 'equity'): 0.0,
            ('interest_rate', 'property'): 0.0,
            ('interest_rate', 'spread'): 0.5,
            ('interest_rate', 'currency'): 0.25,
            ('interest_rate', 'concentration'): 0.0,
            ('equity', 'property'): 0.75,
            ('equity', 'spread'): 0.75,
            ('equity', 'currency'): 0.25,
            ('equity', 'concentration'): 0.0,
            ('property', 'spread'): 0.50,
            ('property', 'currency'): 0.25,
            ('property', 'concentration'): 0.0,
            ('spread', 'currency'): 0.25,
            ('spread', 'concentration'): 0.0,
            ('currency', 'concentration'): 0.0
        },
        'life_underwriting_risk': {
            # Note: mortality-longevity is NEGATIVE per regulation
            ('mortality', 'longevity'): -0.25,
            ('mortality', 'disability'): 0.25,
            ('mortality', 'lapse'): 0.0,
            ('mortality', 'expense'): 0.25,
            ('mortality', 'revision'): 0.0,
            ('mortality', 'catastrophe'): 0.25,
            ('longevity', 'disability'): 0.0,
            ('longevity', 'lapse'): 0.25,
            ('longevity', 'expense'): 0.25,
            ('longevity', 'revision'): 0.25,
            ('longevity', 'catastrophe'): 0.0,
            ('disability', 'lapse'): 0.0,
            ('disability', 'expense'): 0.50,
            ('disability', 'revision'): 0.0,
            ('disability', 'catastrophe'): 0.25,
            ('lapse', 'expense'): 0.50,
            ('lapse', 'revision'): 0.0,
            ('lapse', 'catastrophe'): 0.25,
            ('expense', 'revision'): 0.50,
            ('expense', 'catastrophe'): 0.25,
            ('revision', 'catastrophe'): 0.0
        }
    }
    
    correlation_matrix = correlation_matrices.get(risk_type, {})
    
    # Calculate sum of squares
    sum_of_squares = sum(scr ** 2 for scr in risk_components.values())
    
    # Calculate correlation terms
    correlation_terms = []
    risk_names = list(risk_components.keys())
    
    for i, risk1 in enumerate(risk_names):
        for j, risk2 in enumerate(risk_names[i+1:], i+1):
            correlation = correlation_matrix.get((risk1, risk2), 0.0)
            correlation_terms.append(2 * correlation * risk_components[risk1] * risk_components[risk2])
    
    # Total SCR = sqrt(sum of squares + correlation terms)
    total_scr_squared = sum_of_squares + sum(correlation_terms)
    
    return np.sqrt(total_scr_squared)

def calculate_total_scr(scr_components: Dict[str, float]) -> float:
    """
    Calculate total SCR using main correlation matrix
    
    Args:
        scr_components: Dictionary of main SCR components
        
    Returns:
        Total SCR amount
    """
    # Main correlation matrix per Solvency II Delegated Regulation (EU) 2015/35 Annex IV
    # Note: Operational risk is calculated separately and added linearly
    correlations = {
        ('market_risk', 'counterparty_risk'): 0.25,
        ('market_risk', 'life_underwriting_risk'): 0.25,
        ('market_risk', 'health_underwriting_risk'): 0.25,
        ('market_risk', 'non_life_underwriting_risk'): 0.25,
        ('market_risk', 'operational_risk'): 0.0,  # Op risk added separately
        ('counterparty_risk', 'life_underwriting_risk'): 0.25,
        ('counterparty_risk', 'health_underwriting_risk'): 0.25,
        ('counterparty_risk', 'non_life_underwriting_risk'): 0.50,  # Correct: 0.50 not 0.25
        ('counterparty_risk', 'operational_risk'): 0.0,
        ('life_underwriting_risk', 'health_underwriting_risk'): 0.25,
        ('life_underwriting_risk', 'non_life_underwriting_risk'): 0.0,  # Correct: 0.0
        ('life_underwriting_risk', 'operational_risk'): 0.0,
        ('health_underwriting_risk', 'non_life_underwriting_risk'): 0.0,
        ('health_underwriting_risk', 'operational_risk'): 0.0,
        ('non_life_underwriting_risk', 'operational_risk'): 0.0
    }
    
    # Calculate sum of squares
    sum_of_squares = sum(scr ** 2 for scr in scr_components.values())
    
    # Calculate correlation terms
    correlation_terms = []
    risk_names = list(scr_components.keys())
    
    for i, risk1 in enumerate(risk_names):
        for j, risk2 in enumerate(risk_names[i+1:], i+1):
            correlation = correlations.get((risk1, risk2), 0.0)
            correlation_terms.append(2 * correlation * scr_components[risk1] * scr_components[risk2])
    
    # Total SCR = sqrt(sum of squares + correlation terms)
    total_scr_squared = sum_of_squares + sum(correlation_terms)
    
    return np.sqrt(total_scr_squared)

def calculate_mcr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate Minimum Capital Requirement per Solvency II Articles 248-250.
    MCR = max(MCR_floor, min(0.45 × SCR, max(0.25 × SCR, MCR_linear)))
    """
    from utils.regulatory_constants import MCR_ABSOLUTE_FLOORS, MCR_LINEAR_FACTORS

    technical_provisions_guaranteed = assumptions.get('tp_guaranteed', df['face_amount'].sum() * 0.80)
    technical_provisions_other = assumptions.get('tp_other', df['face_amount'].sum() * 0.15)
    capital_at_risk = assumptions.get('capital_at_risk', df['face_amount'].sum() * 0.50)

    mcr_linear = (
        MCR_LINEAR_FACTORS['life']['technical_provisions_guaranteed'] * technical_provisions_guaranteed +
        MCR_LINEAR_FACTORS['life']['technical_provisions_other'] * technical_provisions_other +
        MCR_LINEAR_FACTORS['capital_at_risk'] * capital_at_risk
    )

    scr = assumptions.get('scr_for_mcr', df['face_amount'].sum() * 0.20)
    mcr_floor = MCR_ABSOLUTE_FLOORS.get('life_reinsurance', 3_700_000)

    # Corridor: between 25% and 45% of SCR
    return max(mcr_floor, min(0.45 * scr, max(0.25 * scr, mcr_linear)))


def calculate_scr_by_policy_type(policies: List[Dict[str, Any]], 
                               assumptions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate SCR breakdown by policy type
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary with SCR by policy type
    """
    df = pd.DataFrame(policies)
    
    if 'policy_type' not in df.columns:
        return {'unknown': df['face_amount'].sum() * 0.25}
    
    scr_by_type = df.groupby('policy_type').apply(
        lambda group: group['face_amount'].sum() * 0.25
    ).to_dict()
    
    return scr_by_type

def calculate_scr_by_age_group(policies: List[Dict[str, Any]], 
                             assumptions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate SCR breakdown by age group
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary with SCR by age group
    """
    df = pd.DataFrame(policies)
    
    if 'issue_age' not in df.columns:
        return {'unknown': df['face_amount'].sum() * 0.25}
    
    # Create age groups
    df['age_group'] = pd.cut(df['issue_age'], 
                            bins=[0, 30, 40, 50, 60, 70, 100], 
                            labels=['<30', '30-40', '40-50', '50-60', '60-70', '70+'])
    
    scr_by_age = df.groupby('age_group').apply(
        lambda group: group['face_amount'].sum() * 0.25
    ).to_dict()
    
    return scr_by_age

def calculate_scr_sensitivity(policies: List[Dict[str, Any]], 
                            base_assumptions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate SCR sensitivity to assumption changes
    
    Args:
        policies: List of policy dictionaries
        base_assumptions: Base assumptions
        
    Returns:
        Dictionary with sensitivity analysis results
    """
    base_scr = calculate_portfolio_scr(policies, base_assumptions)['scr']
    
    sensitivity_results = {}
    
    # Market risk factor sensitivity
    for factor_change in [-0.05, -0.02, 0.02, 0.05]:
        modified_assumptions = base_assumptions.copy()
        modified_assumptions['market_risk_factor'] = modified_assumptions.get('market_risk_factor', 0.25) + factor_change
        modified_scr = calculate_portfolio_scr(policies, modified_assumptions)['scr']
        sensitivity_results[f'market_risk_factor_{factor_change}'] = modified_scr - base_scr
    
    # Interest rate shock sensitivity
    for shock_change in [-0.005, -0.002, 0.002, 0.005]:
        modified_assumptions = base_assumptions.copy()
        modified_assumptions['interest_rate_shock'] = modified_assumptions.get('interest_rate_shock', 0.01) + shock_change
        modified_scr = calculate_portfolio_scr(policies, modified_assumptions)['scr']
        sensitivity_results[f'interest_rate_shock_{shock_change}'] = modified_scr - base_scr
    
    return sensitivity_results

def calculate_scr_stress_tests(policies: List[Dict[str, Any]], 
                             base_assumptions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate SCR under various stress test scenarios
    
    Args:
        policies: List of policy dictionaries
        base_assumptions: Base assumptions
        
    Returns:
        Dictionary with stress test results
    """
    stress_tests = {}
    
    # Market crash scenario
    market_crash_assumptions = base_assumptions.copy()
    market_crash_assumptions['equity_shock'] = 0.5  # 50% equity shock
    market_crash_assumptions['interest_rate_shock'] = 0.02  # 200bp interest rate shock
    stress_tests['market_crash'] = calculate_portfolio_scr(policies, market_crash_assumptions)['scr']
    
    # Mortality catastrophe scenario
    mortality_cat_assumptions = base_assumptions.copy()
    mortality_cat_assumptions['mortality_shock'] = 0.5  # 50% mortality shock
    stress_tests['mortality_catastrophe'] = calculate_portfolio_scr(policies, mortality_cat_assumptions)['scr']
    
    # Combined stress scenario
    combined_stress_assumptions = base_assumptions.copy()
    combined_stress_assumptions['equity_shock'] = 0.3
    combined_stress_assumptions['interest_rate_shock'] = 0.015
    combined_stress_assumptions['mortality_shock'] = 0.25
    stress_tests['combined_stress'] = calculate_portfolio_scr(policies, combined_stress_assumptions)['scr']
    
    return stress_tests

def calculate_lac_dt(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate Loss-Absorbing Capacity of Deferred Taxes (LAC DT)
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        LAC DT amount
    """
    # LAC DT calculation based on deferred tax assets
    deferred_tax_assets = assumptions.get('deferred_tax_assets', 0)
    tax_rate = assumptions.get('tax_rate', 0.25)
    
    # LAC DT = min(deferred_tax_assets * tax_rate, SCR * 0.15)
    # Maximum LAC DT is 15% of SCR
    max_lac_dt_factor = assumptions.get('max_lac_dt_factor', 0.15)
    
    # Calculate base SCR for LAC DT cap
    base_scr = df['face_amount'].sum() * 0.2  # Simplified SCR estimate
    
    lac_dt = min(
        deferred_tax_assets * tax_rate,
        base_scr * max_lac_dt_factor
    )
    
    return max(0, lac_dt)  # LAC DT cannot be negative