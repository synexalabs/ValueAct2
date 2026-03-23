"""
Actuarial utility functions for calculations
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import math

def validate_assumptions(assumptions: Dict[str, Any], calculation_type: str) -> Dict[str, Any]:
    """
    Validate calculation assumptions
    
    Args:
        assumptions: Dictionary of assumptions
        calculation_type: Type of calculation (IFRS17, SOLVENCY, etc.)
        
    Returns:
        Dictionary with validation result
    """
    errors = []
    
    if calculation_type == "IFRS17":
        # Validate IFRS 17 specific assumptions
        if 'discount_rate' not in assumptions:
            errors.append("discount_rate is required")
        elif not (0 <= assumptions['discount_rate'] <= 1):
            errors.append("discount_rate must be between 0 and 1")
            
        if 'lapse_rate' not in assumptions:
            errors.append("lapse_rate is required")
        elif not (0 <= assumptions['lapse_rate'] <= 1):
            errors.append("lapse_rate must be between 0 and 1")
            
        VALID_TABLES = [
            'DAV_2008_T', 'DAV_2008_T_MALE', 'DAV_2008_T_FEMALE', 'DAV_2008_T_UNISEX',
            'DAV_2004_R', 'DAV_2004_R_MALE', 'DAV_2004_R_FEMALE', 'DAV_2004_R_UNISEX',
            'CSO_2017', 'CSO_2001'
        ]
        if 'mortality_table' not in assumptions:
            errors.append("mortality_table is required")
        elif assumptions['mortality_table'] not in VALID_TABLES:
            errors.append(f"Ungültige Sterbetafel: {assumptions['mortality_table']}. Verfügbar: {', '.join(VALID_TABLES)}")
            
        if 'expense_inflation' not in assumptions:
            errors.append("expense_inflation is required")
        elif not (0 <= assumptions['expense_inflation'] <= 0.1):
            errors.append("expense_inflation must be between 0 and 0.1")
    
    elif calculation_type == "SOLVENCY":
        # Validate Solvency II specific assumptions
        if 'confidence_level' not in assumptions:
            errors.append("confidence_level is required")
        elif not (0.95 <= assumptions['confidence_level'] <= 0.999):
            errors.append("confidence_level must be between 0.95 and 0.999")
            
        if 'time_horizon' not in assumptions:
            errors.append("time_horizon is required")
        elif not (1 <= assumptions['time_horizon'] <= 10):
            errors.append("time_horizon must be between 1 and 10 years")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }

def get_mortality_table(table_id: str) -> Dict[str, Any]:
    """
    Get mortality table data
    
    Args:
        table_id: Mortality table identifier
        
    Returns:
        Dictionary containing mortality table data
    """
    from data.mortality_tables import get_mortality_table as get_table
    return get_table(table_id)

def calculate_present_value(cash_flows: List[float], discount_rate: float = 0.035, 
                          periods: List[int] = None, curve: Tuple[float, ...] = None) -> float:
    """
    Calculate present value of cash flows using flat rate or yield curve
    
    Args:
        cash_flows: List of cash flows
        discount_rate: Flat discount rate (used if curve is None)
        periods: List of period numbers (optional)
        curve: Yield curve tuple of spot rates (optional)
        
    Returns:
        Present value
    """
    if periods is None:
        periods = list(range(len(cash_flows)))
    
    pv = 0.0
    for cf, t in zip(cash_flows, periods):
        if curve:
            idx = min(t, len(curve) - 1)
            rate = curve[idx]
            df = 1 / (1 + rate) ** t
        else:
            df = 1 / (1 + discount_rate) ** t
        pv += cf * df
    return pv

def calculate_annuity_factor(age: int, mortality_table: Dict[str, Any], 
                           discount_rate: float, term: int = None) -> float:
    """
    Calculate annuity factor for given age and mortality table
    
    Args:
        age: Current age
        mortality_table: Mortality table data
        discount_rate: Discount rate
        term: Term of annuity (None for whole life)
        
    Returns:
        Annuity factor
    """
    from data.mortality_tables import get_mortality_rate
    
    table_id = mortality_table.get("id", "CSO_2017")
    gender = mortality_table.get("gender", "male")
    
    factor = 0.0
    
    if term is None:
        # Whole life annuity
        for t in range(1, 101):  # Assume maximum age of 120
            if age + t <= 120:
                survival_prob = 1.0
                for s in range(t):
                    mortality_rate = get_mortality_rate(table_id, age + s, gender)
                    survival_prob *= (1.0 - mortality_rate)
                factor += survival_prob / (1 + discount_rate) ** t
    else:
        # Term annuity
        for t in range(1, term + 1):
            if age + t <= 120:
                survival_prob = 1.0
                for s in range(t):
                    mortality_rate = get_mortality_rate(table_id, age + s, gender)
                    survival_prob *= (1.0 - mortality_rate)
                factor += survival_prob / (1 + discount_rate) ** t
    
    return factor

def calculate_risk_adjustment(portfolio_data: pd.DataFrame, 
                            assumptions: Dict[str, Any]) -> float:
    """
    Calculate risk adjustment for portfolio
    
    Args:
        portfolio_data: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        Risk adjustment amount
    """
    # Simple risk adjustment calculation
    total_premium = portfolio_data['premium'].sum()
    risk_factor = assumptions.get('risk_adjustment_factor', 0.02)
    
    return total_premium * risk_factor

def calculate_diversification_benefit(scr_components: Dict[str, float]) -> float:
    """
    Calculate diversification benefit for SCR components
    
    Args:
        scr_components: Dictionary of SCR components
        
    Returns:
        Diversification benefit
    """
    # Simple diversification benefit calculation
    total_scr = sum(scr_components.values())
    diversification_factor = 0.15  # 15% diversification benefit
    
    return total_scr * diversification_factor

def group_policies_by_cohort(policies: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Group policies by issue year cohort
    
    Args:
        policies: List of policy dictionaries
        
    Returns:
        Dictionary with cohorts as keys and policy lists as values
    """
    cohorts = {}
    
    for policy in policies:
        issue_date = datetime.fromisoformat(policy['issue_date'].replace('Z', '+00:00'))
        cohort_year = str(issue_date.year)
        
        if cohort_year not in cohorts:
            cohorts[cohort_year] = []
        
        cohorts[cohort_year].append(policy)
    
    return cohorts

def calculate_cohort_metrics(cohort_policies: List[Dict[str, Any]], 
                           assumptions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate metrics for a cohort of policies
    
    Args:
        cohort_policies: List of policies in the cohort
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary of cohort metrics
    """
    total_premium = sum(policy['premium'] for policy in cohort_policies)
    total_face_amount = sum(policy['face_amount'] for policy in cohort_policies)
    
    # Simple CSM calculation
    csm = total_premium - total_face_amount * 0.95
    
    return {
        'total_premium': total_premium,
        'total_face_amount': total_face_amount,
        'csm': max(0, csm),
        'policy_count': len(cohort_policies)
    }

def calculate_csm_release_pattern(portfolio_csm: float, 
                                assumptions: Dict[str, Any]) -> List[float]:
    """
    Calculate CSM release pattern over time
    
    Args:
        portfolio_csm: Total portfolio CSM
        assumptions: Calculation assumptions
        
    Returns:
        List of CSM release amounts by year
    """
    # Simple CSM release pattern (linear over 5 years)
    years = 5
    release_pattern = []
    
    for year in range(1, years + 1):
        if year == years:
            # Last year gets remaining CSM
            release_amount = portfolio_csm - sum(release_pattern)
        else:
            # Equal release each year
            release_amount = portfolio_csm / years
        
        release_pattern.append(release_amount)
    
    return release_pattern

def calculate_portfolio_statistics(policies: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate portfolio statistics
    
    Args:
        policies: List of policy dictionaries
        
    Returns:
        Dictionary of portfolio statistics
    """
    df = pd.DataFrame(policies)
    
    stats = {
        'total_policies': len(policies),
        'total_premium': df['premium'].sum(),
        'total_face_amount': df['face_amount'].sum(),
        'average_premium': df['premium'].mean(),
        'average_face_amount': df['face_amount'].mean(),
        'premium_std': df['premium'].std(),
        'face_amount_std': df['face_amount'].std()
    }
    
    return stats

def calculate_confidence_interval(values: List[float], confidence_level: float = 0.95) -> Tuple[float, float]:
    """
    Calculate confidence interval for a list of values
    
    Args:
        values: List of values
        confidence_level: Confidence level (default 0.95)
        
    Returns:
        Tuple of (lower_bound, upper_bound)
    """
    if not values:
        return (0, 0)
    
    mean = np.mean(values)
    std = np.std(values)
    
    # Z-score for confidence level
    z_score = 1.96 if confidence_level == 0.95 else 2.58  # 99% confidence
    
    margin_of_error = z_score * std / math.sqrt(len(values))
    
    lower_bound = mean - margin_of_error
    upper_bound = mean + margin_of_error
    
    return (lower_bound, upper_bound)

def validate_policy_data(policy: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate individual policy data
    
    Args:
        policy: Policy data dictionary
        
    Returns:
        Validation result dictionary
    """
    errors = []
    
    # Required fields
    required_fields = ['policy_id', 'issue_date', 'face_amount', 'premium']
    for field in required_fields:
        if field not in policy or policy[field] is None:
            errors.append(f"Missing required field: {field}")
    
    # Validate data types and ranges
    if 'face_amount' in policy and policy['face_amount'] <= 0:
        errors.append("face_amount must be positive")
    
    if 'premium' in policy and policy['premium'] < 0:
        errors.append("premium must be non-negative")
    
    if 'issue_age' in policy and not (0 <= policy['issue_age'] <= 120):
        errors.append("issue_age must be between 0 and 120")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }
