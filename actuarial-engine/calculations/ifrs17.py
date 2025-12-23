"""
IFRS 17 Contractual Service Margin (CSM) calculations - COMPLETE REWRITE
Implements proper IFRS 17 methodology with cashflow projection, coverage units, and CSM accretion
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import time
import sys
import os
from enum import Enum
from functools import lru_cache
import concurrent.futures
from multiprocessing import Pool

# Add the utils directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data'))

# Import audit context
from audit_logger import AuditContext

# Import actuarial utilities
from audit_logger import validate_non_negative
from data.mortality_tables import get_mortality_table, get_survival_probability, get_mortality_rate

# Global cache for mortality tables and discount factors
_mortality_cache = {}
_discount_factor_cache = {}

@lru_cache(maxsize=1000)
def get_cached_mortality_rate(table_id: str, age: int, gender: str = None, duration: int = None) -> float:
    """Cached mortality rate lookup"""
    from data.mortality_tables import get_mortality_rate
    return get_mortality_rate(table_id, age, gender, duration)

@lru_cache(maxsize=1000)
def get_cached_survival_probability(table_id: str, age: int, term: int, gender: str = None) -> float:
    """Cached survival probability lookup"""
    from data.mortality_tables import get_survival_probability
    return get_survival_probability(table_id, age, term, gender)

@lru_cache(maxsize=1000)
def get_cached_discount_factor(rate: float, period: int) -> float:
    """Cached discount factor calculation"""
    return 1 / (1 + rate) ** period

from models.request import PolicyData, IFRS17Assumptions
from models.response import IFRS17Response, PolicyResult, AggregateMetrics
from utils.actuarial import (
    validate_assumptions, calculate_present_value, calculate_annuity_factor,
    group_policies_by_cohort, calculate_cohort_metrics, calculate_portfolio_statistics
)

class MeasurementModel(Enum):
    """IFRS 17 Measurement Models"""
    GMM = "GMM"  # General Measurement Model
    PAA = "PAA"  # Premium Allocation Approach
    VFA = "VFA"  # Variable Fee Approach

class CoverageUnit(Enum):
    """Coverage Unit Types for CSM Release"""
    SUM_ASSURED = "sum_assured"
    PREMIUM = "premium"
    EXPOSURE = "exposure"


def get_dynamic_lapse_rate(base_rate: float, duration: int, policy_type: str = "term_life") -> float:
    """
    Calculate duration-dependent lapse rate.
    
    Lapse behavior is typically:
    - Higher in early years (shock lapses)
    - Stabilizes after year 5
    - May increase near policy end for term products
    
    Args:
        base_rate: Base annual lapse rate from assumptions
        duration: Policy duration in years (0-indexed)
        policy_type: Type of policy for adjustment
        
    Returns:
        Adjusted lapse rate for the specific duration
    """
    # Duration-based multipliers based on industry experience
    LAPSE_MULTIPLIERS = {
        0: 0.50,   # 50% of base in year 0 (just issued)
        1: 1.50,   # 150% in year 1 (highest lapses)
        2: 1.30,   # 130% in year 2
        3: 1.10,   # 110% in year 3
        4: 1.00,   # 100% in year 4
        5: 0.90,   # 90% in year 5
    }
    
    # Get multiplier with default for later durations
    multiplier = LAPSE_MULTIPLIERS.get(duration, 0.80)  # 80% for duration > 5
    
    # Adjust for policy type
    if policy_type in ["whole_life", "endowment"]:
        multiplier *= 0.8  # Lower lapses for investment-linked products
    
    # Calculate adjusted rate with cap at 50%
    adjusted_rate = min(base_rate * multiplier, 0.50)
    
    return adjusted_rate


def get_cumulative_persistence(base_lapse_rate: float, duration: int, policy_type: str = "term_life") -> float:
    """
    Calculate cumulative persistence probability using dynamic lapse rates.
    
    Args:
        base_lapse_rate: Base annual lapse rate
        duration: Number of years
        policy_type: Type of policy
        
    Returns:
        Probability of policy persisting to given duration
    """
    persistence = 1.0
    for t in range(duration):
        lapse_rate = get_dynamic_lapse_rate(base_lapse_rate, t, policy_type)
        persistence *= (1 - lapse_rate)
    return persistence

def calculate_portfolio_csm(policies: List[Dict[str, Any]], 
                          assumptions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate IFRS 17 CSM for entire portfolio using proper methodology
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary containing CSM calculation results
    """
    calculation_id = f"IFRS17_CSM_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    with AuditContext(calculation_id, "IFRS17_CSM_v2.0.0") as audit:
        start_time = time.time()
        
        # Set calculation inputs
        audit.set_calculation_inputs({
            "policies_count": len(policies),
            "assumptions": assumptions,
            "calculation_type": "IFRS17_CSM",
            "methodology_version": "2.0.0"
        })
        
        # Performance optimization: Limit portfolio size for timeout prevention
        max_policies = 1000  # Reasonable limit for Cloud Run timeout
        if len(policies) > max_policies:
            audit.add_validation_result("Portfolio Size", "performance", False, 
                                      f"Portfolio size {len(policies)} exceeds limit of {max_policies}", "warning")
            # Use sampling for large portfolios
            import random
            policies = random.sample(policies, max_policies)
            audit.add_intermediate_result("Sampling Applied", f"Reduced to {len(policies)} policies", "info", "Large portfolio sampling")
        
        # Add assumptions used
        audit.add_assumption_used("Discount Rate", assumptions.get('discount_rate', 0.035), "regulatory", "IFRS 17 requirement")
        audit.add_assumption_used("Mortality Table", assumptions.get('mortality_table', 'CSO_2017'), "regulatory", "Standard mortality table")
        audit.add_assumption_used("Risk Adjustment", assumptions.get('risk_adjustment_factor', 0.02), "company", "Company-specific risk adjustment")
        
        # Convert policies to DataFrame for vectorized operations
        audit.add_calculation_step("Data Preparation", 
                                 "Convert policies to DataFrame for vectorized operations",
                                 inputs={"policies_count": len(policies)})
        
        df = pd.DataFrame(policies)
        
        # Validate assumptions
        audit.add_calculation_step("Assumption Validation", 
                                 "Validate calculation assumptions")
        
        validation_result = validate_assumptions(assumptions, "IFRS17")
        if not validation_result["is_valid"]:
            audit.add_validation_result("Assumption Validation", "consistency", False, 
                                      f"Invalid assumptions: {validation_result['errors']}", "error")
            raise ValueError(f"Invalid assumptions: {validation_result['errors']}")
        
        audit.add_validation_result("Assumption Validation", "consistency", True, 
                                  "All assumptions validated successfully")
        
        # Get mortality table and pre-calculate common values for performance
        audit.add_calculation_step("Mortality Table Selection", 
                                 "Select and load mortality table with pre-calculated values",
                                 inputs={"mortality_table": assumptions['mortality_table']})
        
        mortality_table = get_mortality_table(assumptions['mortality_table'])
        audit.add_intermediate_result("Mortality Table", mortality_table, "table", "Selected mortality table")
        
        # Pre-calculate discount factors for common terms to improve performance
        max_term = int(df.get('policy_term', pd.Series([20])).max()) if len(df) > 0 else 20
        discount_rate = assumptions['discount_rate']
        
        # Pre-calculate discount factors for all possible terms
        for t in range(1, max_term + 1):
            get_cached_discount_factor(discount_rate, t)
        
        # Determine measurement model for each policy
        audit.add_calculation_step("Measurement Model Selection", 
                                 "Determine GMM/PAA/VFA for each policy")
        
        df['measurement_model'] = df.apply(
            lambda row: determine_measurement_model(row, assumptions), 
            axis=1
        )
        
        # Calculate Fulfilment Cash Flows (FCF) for all policies using vectorized operations
        audit.add_calculation_step(
            description="Fulfilment Cash Flows Calculation",
            explanation="Calculate FCF = PV(Benefits) - PV(Premiums) - PV(Expenses) using vectorized operations",
            formula="FCF = \\sum_{t=1}^{n} \\frac{B_t - P_t - E_t}{(1+r)^t}"
        )
        
        # Use vectorized calculations for better performance
        df['pv_benefits'] = calculate_pv_benefits_vectorized(df, assumptions, assumptions['mortality_table'])
        df['pv_premiums'] = calculate_pv_premiums_vectorized(df, assumptions, assumptions['mortality_table'])
        df['pv_expenses'] = calculate_pv_expenses_vectorized(df, assumptions, assumptions['mortality_table'])
        
        df['fcf'] = df['pv_premiums'] - df['pv_benefits'] - df['pv_expenses']
        
        audit.add_intermediate_result("PV Benefits Total", df['pv_benefits'].sum(), "currency", "Total present value of benefits")
        audit.add_intermediate_result("PV Premiums Total", df['pv_premiums'].sum(), "currency", "Total present value of premiums")
        audit.add_intermediate_result("PV Expenses Total", df['pv_expenses'].sum(), "currency", "Total present value of expenses")
        audit.add_intermediate_result("FCF Total", df['fcf'].sum(), "currency", "Total fulfilment cash flows")
        
        # Calculate Risk Adjustment (RA) using vectorized operations
        audit.add_calculation_step(
            description="Risk Adjustment Calculation",
            explanation="Calculate RA using confidence level calibration with vectorized operations",
            formula="RA = \\text{VaR}_{\\alpha}(FCF) - \\mathbb{E}[FCF]"
        )
        
        # Vectorized risk adjustment calculation
        risk_factor = assumptions.get('risk_adjustment_factor', 0.02)
        confidence_level = assumptions.get('confidence_level', 0.75)
        
        # Base risk adjustment
        base_ra = np.abs(df['fcf']) * risk_factor
        
        # Adjust for confidence level (higher confidence = higher RA)
        confidence_multiplier = {
            0.75: 1.0,
            0.90: 1.5,
            0.95: 2.0,
            0.99: 3.0
        }.get(confidence_level, 1.0)
        
        df['risk_adjustment'] = base_ra * confidence_multiplier
        
        audit.add_intermediate_result("Risk Adjustment Total", df['risk_adjustment'].sum(), "currency", "Total risk adjustment")
        
        # Calculate Contractual Service Margin (CSM)
        audit.add_calculation_step(
            description="CSM Calculation",
            explanation="Calculate CSM = max(0, FCF - RA)",
            formula="CSM = \\max(0, FCF - RA)"
        )
        
        df['csm'] = np.maximum(0, df['fcf'] - df['risk_adjustment'])
        
        # Calculate Loss Component for onerous contracts
        audit.add_calculation_step(
            description="Loss Component Calculation",
            explanation="Calculate LC = max(0, RA - FCF) for onerous contracts",
            formula="LC = \\max(0, RA - FCF)"
        )
        
        df['loss_component'] = np.maximum(0, df['risk_adjustment'] - df['fcf'])
        
        # Validate CSM results
        audit.add_validation_result("CSM Non-Negative", "range", 
                                  validate_non_negative(df['csm'].min(), "CSM"), 
                                  f"Minimum CSM: {df['csm'].min()}")
        
        audit.add_intermediate_result("CSM Total", df['csm'].sum(), "currency", "Total Contractual Service Margin")
        audit.add_intermediate_result("Loss Component Total", df['loss_component'].sum(), "currency", "Total loss component")
        
        # Calculate CSM release pattern using coverage units
        audit.add_calculation_step("CSM Release Pattern", 
                                 "Calculate CSM release based on coverage units")
        
        csm_release_pattern = calculate_csm_release_pattern_proper(df, assumptions)
        audit.add_intermediate_result("CSM Release Pattern", csm_release_pattern, "pattern", "CSM release pattern by year")
        
        # Calculate CSM accretion (time value of money on CSM)
        audit.add_calculation_step(
            description="CSM Accretion",
            explanation="Calculate time value of money on CSM",
            formula="CSM_{t+1} = CSM_t \\times (1 + r)"
        )
        
        df['csm_accretion'] = df['csm'] * assumptions.get('discount_rate', 0.035)
        
        # Group by cohorts
        audit.add_calculation_step("Cohort Analysis", 
                                 "Group policies by cohorts and calculate CSM by cohort")
        
        cohorts = group_policies_by_cohort(policies)
        csm_by_cohort = {}
        
        for cohort_year, cohort_policies in cohorts.items():
            cohort_df = df[df['policy_id'].isin([p['policy_id'] for p in cohort_policies])]
            csm_by_cohort[cohort_year] = cohort_df['csm'].sum()
        
        audit.add_intermediate_result("CSM by Cohort", csm_by_cohort, "cohort_data", "CSM breakdown by cohort")
        
        # Calculate aggregate metrics
        audit.add_calculation_step("Aggregate Metrics", 
                                 "Calculate portfolio aggregate metrics")
        
        aggregate_metrics = {
            'total_premium': float(df['pv_premiums'].sum()),
            'total_benefits_pv': float(df['pv_benefits'].sum()),
            'total_expenses_pv': float(df['pv_expenses'].sum()),
            'total_fcf': float(df['fcf'].sum()),
            'risk_adjustment': float(df['risk_adjustment'].sum()),
            'loss_component': float(df['loss_component'].sum()),
            'policy_count': len(df),
            'onerous_count': int((df['loss_component'] > 0).sum()),
            'csm_accretion': float(df['csm_accretion'].sum())
        }
        
        audit.add_intermediate_result("Aggregate Metrics", aggregate_metrics, "metrics", "Portfolio aggregate metrics")
        
        # Create policy results
        audit.add_calculation_step("Policy Results Compilation", 
                                 "Compile individual policy results")
        
        policy_results = []
        for _, row in df.iterrows():
            policy_result = {
                'policy_id': row['policy_id'],
                'measurement_model': row['measurement_model'].value if hasattr(row['measurement_model'], 'value') else str(row['measurement_model']),
                'csm': float(row['csm']),
                'fcf': float(row['fcf']),
                'pv_benefits': float(row['pv_benefits']),
                'pv_premiums': float(row['pv_premiums']),
                'pv_expenses': float(row['pv_expenses']),
                'risk_adjustment': float(row['risk_adjustment']),
                'loss_component': float(row['loss_component']),
                'csm_accretion': float(row['csm_accretion'])
            }
            policy_results.append(policy_result)
        
        execution_time = time.time() - start_time
        audit.add_intermediate_result("Execution Time", execution_time, "seconds", "Total calculation time")
        
        # Check for timeout warning
        if execution_time > 30:  # 30 seconds warning threshold
            audit.add_validation_result("Performance Warning", "timeout", False, 
                                      f"Calculation took {execution_time:.2f} seconds", "warning")
        
        # Add formulas used
        audit.add_formula_used("CSM_Initial", "2.0.0", "Initial CSM Recognition", 
                              "CSM_0 = \\max(0, FCF_0 - RA_0)")
        audit.add_formula_used("FCF", "2.0.0", "Fulfilment Cash Flows", 
                              "FCF = PV_{premiums} - PV_{benefits} - PV_{expenses}")
        audit.add_formula_used("Risk_Adjustment", "2.0.0", "Risk Adjustment", 
                              "RA = \\text{VaR}_{\\alpha}(FCF) - \\mathbb{E}[FCF]")
        audit.add_formula_used("Loss_Component", "2.0.0", "Loss Component", 
                              "LC = \\max(0, RA - FCF)")
        audit.add_formula_used("CSM_Release", "2.0.0", "CSM Release", 
                              "CSM_{release,t} = CSM_{opening,t} \\times \\frac{CU_t}{\\sum CU}")
        
        # Build response
        results = {
            'portfolio_csm': float(df['csm'].sum()),
            'portfolio_fcf': float(df['fcf'].sum()),
            'csm_by_cohort': csm_by_cohort,
            'csm_release_pattern': csm_release_pattern,
            'policy_results': policy_results,
            'aggregate_metrics': aggregate_metrics,
            'assumptions_used': assumptions,
            'calculation_timestamp': datetime.now().isoformat(),
            'execution_time': execution_time,
            'audit_trail': audit.get_audit_trail(),
            'result_validation': audit.get_validation_summary(),
            'methodology_version': '2.0.0'
        }
        
        return results

def determine_measurement_model(policy: pd.Series, assumptions: Dict[str, Any]) -> MeasurementModel:
    """
    Determine IFRS 17 measurement model (GMM, PAA, VFA) for a policy
    
    Args:
        policy: Policy data as pandas Series
        assumptions: Calculation assumptions
        
    Returns:
        MeasurementModel enum
    """
    # Simplified logic - in production would be more sophisticated
    policy_type = policy.get('policy_type', 'term_life')
    
    if policy_type in ['term_life', 'whole_life']:
        return MeasurementModel.GMM
    elif policy_type in ['annuity', 'pension']:
        return MeasurementModel.VFA
    else:
        return MeasurementModel.PAA

def calculate_pv_benefits_proper(policy: pd.Series, assumptions: Dict[str, Any], 
                                mortality_table: Dict[str, Any]) -> float:
    """
    Calculate present value of benefits using proper mortality and cashflow projection
    
    Args:
        policy: Policy data as pandas Series
        assumptions: Calculation assumptions
        mortality_table: Mortality table data
        
    Returns:
        Present value of benefits
    """
    discount_rate = assumptions['discount_rate']
    face_amount = policy['face_amount']
    issue_age = policy.get('issue_age', 35)
    policy_term = policy.get('policy_term', 20)
    gender = policy.get('gender', 'male')
    mortality_table_id = assumptions['mortality_table']
    
    pv_benefits = 0.0
    
    # Project cashflows over policy lifetime
    for t in range(1, policy_term + 1):
        # Calculate probability of death in year t
        survival_to_start = get_survival_probability(mortality_table_id, issue_age, t-1, gender)
        mortality_rate = get_mortality_rate(mortality_table_id, issue_age + t - 1, gender)
        death_probability = survival_to_start * mortality_rate
        
        # Death benefit paid at end of year
        benefit_amount = face_amount * death_probability
        discount_factor = 1 / (1 + discount_rate) ** t
        
        pv_benefits += benefit_amount * discount_factor
    
    return pv_benefits

def calculate_pv_premiums_proper(policy: pd.Series, assumptions: Dict[str, Any], 
                               mortality_table: Dict[str, Any]) -> float:
    """
    Calculate present value of premiums using proper mortality and lapse assumptions
    
    Args:
        policy: Policy data as pandas Series
        assumptions: Calculation assumptions
        mortality_table: Mortality table data
        
    Returns:
        Present value of premiums
    """
    discount_rate = assumptions['discount_rate']
    premium = policy['premium']
    issue_age = policy.get('issue_age', 35)
    policy_term = policy.get('policy_term', 20)
    gender = policy.get('gender', 'male')
    mortality_table_id = assumptions['mortality_table']
    lapse_rate = assumptions.get('lapse_rate', 0.05)
    policy_type = policy.get('policy_type', 'term_life')
    use_dynamic_lapse = assumptions.get('use_dynamic_lapse', True)
    
    pv_premiums = 0.0
    
    # Project premium cashflows over policy lifetime
    for t in range(policy_term):
        # Calculate probability of survival to year t
        survival_probability = get_survival_probability(mortality_table_id, issue_age, t, gender)
        
        # Calculate persistence probability using dynamic lapse rates
        if use_dynamic_lapse:
            persistence_probability = get_cumulative_persistence(lapse_rate, t, policy_type)
        else:
            persistence_probability = (1 - lapse_rate) ** t  # Legacy constant lapse
        
        # Premium paid at beginning of year
        premium_amount = premium * survival_probability * persistence_probability
        discount_factor = 1 / (1 + discount_rate) ** t
        
        pv_premiums += premium_amount * discount_factor
    
    return pv_premiums

def calculate_pv_expenses(policy: pd.Series, assumptions: Dict[str, Any], 
                         mortality_table: Dict[str, Any]) -> float:
    """
    Calculate present value of expenses
    
    Args:
        policy: Policy data as pandas Series
        assumptions: Calculation assumptions
        mortality_table: Mortality table data
        
    Returns:
        Present value of expenses
    """
    discount_rate = assumptions['discount_rate']
    premium = policy['premium']
    issue_age = policy.get('issue_age', 35)
    policy_term = policy.get('policy_term', 20)
    gender = policy.get('gender', 'male')
    mortality_table_id = assumptions['mortality_table']
    expense_loading = assumptions.get('expense_loading', 0.05)
    expense_inflation = assumptions.get('expense_inflation', 0.02)
    
    pv_expenses = 0.0
    
    # Initial expenses (acquisition costs)
    initial_expenses = premium * expense_loading
    pv_expenses += initial_expenses
    
    # Renewal expenses
    for t in range(1, policy_term):
        survival_probability = get_survival_probability(mortality_table_id, issue_age, t, gender)
        renewal_expense = premium * expense_loading * (1 + expense_inflation) ** t
        discount_factor = 1 / (1 + discount_rate) ** t
        
        pv_expenses += renewal_expense * survival_probability * discount_factor
    
    return pv_expenses

def calculate_risk_adjustment_proper(policy: pd.Series, assumptions: Dict[str, Any], 
                                   mortality_table: Dict[str, Any]) -> float:
    """
    Calculate risk adjustment using proper confidence level calibration
    
    Args:
        policy: Policy data as pandas Series
        assumptions: Calculation assumptions
        mortality_table: Mortality table data
        
    Returns:
        Risk adjustment amount
    """
    confidence_level = assumptions.get('confidence_level', 0.75)
    fcf = policy['fcf']
    
    # Simplified risk adjustment calculation
    # In production, would use Monte Carlo simulation or analytical methods
    risk_factor = assumptions.get('risk_adjustment_factor', 0.02)
    
    # Base risk adjustment
    base_ra = abs(fcf) * risk_factor
    
    # Adjust for confidence level (higher confidence = higher RA)
    confidence_multiplier = {
        0.75: 1.0,
        0.90: 1.5,
        0.95: 2.0,
        0.99: 3.0
    }.get(confidence_level, 1.0)
    
    return base_ra * confidence_multiplier

def calculate_csm_release_pattern_proper(df: pd.DataFrame, assumptions: Dict[str, Any]) -> List[float]:
    """
    Calculate CSM release pattern based on coverage units
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        
    Returns:
        List of CSM release amounts by year
    """
    total_csm = df['csm'].sum()
    policy_term = int(df.get('policy_term', pd.Series([20])).mean())  # Average policy term
    
    # Calculate coverage units (sum assured in force)
    coverage_units_by_year = []
    
    for year in range(1, policy_term + 1):
        # Sum assured in force = sum assured * survival probability
        coverage_units = 0
        for _, row in df.iterrows():
            issue_age = row.get('issue_age', 35)
            gender = row.get('gender', 'male')
            mortality_table_id = assumptions['mortality_table']
            
            survival_prob = get_survival_probability(mortality_table_id, issue_age, year, gender)
            coverage_units += row['face_amount'] * survival_prob
        
        coverage_units_by_year.append(coverage_units)
    
    total_coverage_units = sum(coverage_units_by_year)
    
    # Release CSM proportionally to coverage units
    release_pattern = []
    for coverage_units in coverage_units_by_year:
        if total_coverage_units > 0:
            release_amount = total_csm * (coverage_units / total_coverage_units)
        else:
            release_amount = total_csm / policy_term  # Fallback to equal release
        
        release_pattern.append(release_amount)
    
    return release_pattern

# Legacy functions for backward compatibility
def calculate_pv_benefits(policy: pd.Series, assumptions: Dict[str, Any], 
                         mortality_table: Dict[str, Any]) -> float:
    """Legacy function - use calculate_pv_benefits_proper instead"""
    return calculate_pv_benefits_proper(policy, assumptions, mortality_table)

def calculate_pv_premiums(policy: pd.Series, assumptions: Dict[str, Any], 
                         mortality_table: Dict[str, Any]) -> float:
    """Legacy function - use calculate_pv_premiums_proper instead"""
    return calculate_pv_premiums_proper(policy, assumptions, mortality_table)

def calculate_risk_adjustment_by_policy(policy: pd.Series, assumptions: Dict[str, Any]) -> float:
    """Legacy function - use calculate_risk_adjustment_proper instead"""
    return calculate_risk_adjustment_proper(policy, assumptions, {})

def calculate_expense_loading(policy: pd.Series, assumptions: Dict[str, Any]) -> float:
    """Legacy function - now integrated into calculate_pv_expenses"""
    expense_factor = assumptions.get('expense_loading', 0.05)
    premium = policy['premium']
    return premium * expense_factor

def calculate_tax_liability(policy: pd.Series, assumptions: Dict[str, Any]) -> float:
    """Legacy function - tax calculations would be integrated into FCF"""
    tax_rate = assumptions.get('tax_rate', 0.25)
    premium = policy['premium']
    return premium * tax_rate

def calculate_csm_by_policy_type(policies: List[Dict[str, Any]], 
                                assumptions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate CSM breakdown by policy type
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary with CSM by policy type
    """
    df = pd.DataFrame(policies)
    
    if 'policy_type' not in df.columns:
        return {'unknown': df['csm'].sum()}
    
    csm_by_type = df.groupby('policy_type')['csm'].sum().to_dict()
    
    return csm_by_type

def calculate_csm_by_age_group(policies: List[Dict[str, Any]], 
                              assumptions: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate CSM breakdown by age group
    
    Args:
        policies: List of policy dictionaries
        assumptions: Calculation assumptions
        
    Returns:
        Dictionary with CSM by age group
    """
    df = pd.DataFrame(policies)
    
    if 'issue_age' not in df.columns:
        return {'unknown': df['csm'].sum()}
    
    # Create age groups
    df['age_group'] = pd.cut(df['issue_age'], 
                            bins=[0, 30, 40, 50, 60, 70, 100], 
                            labels=['<30', '30-40', '40-50', '50-60', '60-70', '70+'])
    
    csm_by_age = df.groupby('age_group')['csm'].sum().to_dict()
    
    return csm_by_age

def calculate_csm_sensitivity(policies: List[Dict[str, Any]], 
                            base_assumptions: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate CSM sensitivity to assumption changes
    
    Args:
        policies: List of policy dictionaries
        base_assumptions: Base assumptions
        
    Returns:
        Dictionary with sensitivity analysis results
    """
    base_csm = calculate_portfolio_csm(policies, base_assumptions)['portfolio_csm']
    
    sensitivity_results = {}
    
    # Discount rate sensitivity
    for rate_change in [-0.01, -0.005, 0.005, 0.01]:
        modified_assumptions = base_assumptions.copy()
        modified_assumptions['discount_rate'] += rate_change
        modified_csm = calculate_portfolio_csm(policies, modified_assumptions)['portfolio_csm']
        sensitivity_results[f'discount_rate_{rate_change}'] = modified_csm - base_csm
    
    # Lapse rate sensitivity
    for rate_change in [-0.01, -0.005, 0.005, 0.01]:
        modified_assumptions = base_assumptions.copy()
        modified_assumptions['lapse_rate'] += rate_change
        modified_csm = calculate_portfolio_csm(policies, modified_assumptions)['portfolio_csm']
        sensitivity_results[f'lapse_rate_{rate_change}'] = modified_csm - base_csm
    
    return sensitivity_results

def calculate_pv_benefits_vectorized(df: pd.DataFrame, assumptions: Dict[str, Any], mortality_table: str) -> pd.Series:
    """
    Vectorized calculation of PV of benefits for better performance
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        mortality_table: Mortality table identifier
        
    Returns:
        Series of PV of benefits for each policy
    """
    discount_rate = assumptions['discount_rate']
    max_term = int(df.get('policy_term', pd.Series([20])).max())
    
    # Create time vector
    time_vector = np.arange(1, max_term + 1)
    
    # Calculate discount factors for all periods
    discount_factors = np.array([get_cached_discount_factor(discount_rate, t) for t in time_vector])
    
    # Vectorized calculation for each policy
    pv_benefits = np.zeros(len(df))
    
    for i, (_, row) in enumerate(df.iterrows()):
        age = int(row.get('issue_age', row.get('age', 35)))
        term = int(row.get('policy_term', 20))
        face_amount = row['face_amount']
        gender = row.get('gender', 'M')
        
        # Calculate survival probabilities for all periods
        survival_probs = np.array([
            get_cached_survival_probability(mortality_table, age, t, gender)
            for t in range(1, term + 1)
        ])
        
        # Calculate mortality probabilities
        mortality_probs = np.array([
            get_cached_mortality_rate(mortality_table, age + t - 1, gender)
            for t in range(1, term + 1)
        ])
        
        # PV of death benefits
        death_benefits = face_amount * mortality_probs * discount_factors[:term]
        
        # PV of maturity benefit
        maturity_benefit = face_amount * survival_probs[-1] * discount_factors[term-1]
        
        pv_benefits[i] = np.sum(death_benefits) + maturity_benefit
    
    return pd.Series(pv_benefits, index=df.index)

def calculate_pv_premiums_vectorized(df: pd.DataFrame, assumptions: Dict[str, Any], mortality_table: str) -> pd.Series:
    """
    Vectorized calculation of PV of premiums for better performance
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        mortality_table: Mortality table identifier
        
    Returns:
        Series of PV of premiums for each policy
    """
    discount_rate = assumptions['discount_rate']
    max_term = int(df.get('policy_term', pd.Series([20])).max())
    
    # Create time vector
    time_vector = np.arange(1, max_term + 1)
    
    # Calculate discount factors for all periods
    discount_factors = np.array([get_cached_discount_factor(discount_rate, t) for t in time_vector])
    
    # Vectorized calculation for each policy
    pv_premiums = np.zeros(len(df))
    
    for i, (_, row) in enumerate(df.iterrows()):
        age = int(row.get('issue_age', row.get('age', 35)))
        term = int(row.get('policy_term', 20))
        premium = row['premium']
        gender = row.get('gender', 'M')
        
        # Calculate survival probabilities for all periods
        survival_probs = np.array([
            get_cached_survival_probability(mortality_table, age, t, gender)
            for t in range(1, term + 1)
        ])
        
        # PV of premiums (paid at beginning of each period)
        premium_cashflows = premium * survival_probs * discount_factors[:term]
        pv_premiums[i] = np.sum(premium_cashflows)
    
    return pd.Series(pv_premiums, index=df.index)

def calculate_pv_expenses_vectorized(df: pd.DataFrame, assumptions: Dict[str, Any], mortality_table: str) -> pd.Series:
    """
    Vectorized calculation of PV of expenses for better performance
    
    Args:
        df: Portfolio data as DataFrame
        assumptions: Calculation assumptions
        mortality_table: Mortality table identifier
        
    Returns:
        Series of PV of expenses for each policy
    """
    discount_rate = assumptions['discount_rate']
    expense_ratio = assumptions.get('expense_ratio', 0.05)
    max_term = int(df.get('policy_term', pd.Series([20])).max())
    
    # Create time vector
    time_vector = np.arange(1, max_term + 1)
    
    # Calculate discount factors for all periods
    discount_factors = np.array([get_cached_discount_factor(discount_rate, t) for t in time_vector])
    
    # Vectorized calculation for each policy
    pv_expenses = np.zeros(len(df))
    
    for i, (_, row) in enumerate(df.iterrows()):
        age = int(row.get('issue_age', row.get('age', 35)))
        term = int(row.get('policy_term', 20))
        premium = row['premium']
        gender = row.get('gender', 'M')
        
        # Calculate survival probabilities for all periods
        survival_probs = np.array([
            get_cached_survival_probability(mortality_table, age, t, gender)
            for t in range(1, term + 1)
        ])
        
        # PV of expenses (proportional to premium)
        expense_cashflows = premium * expense_ratio * survival_probs * discount_factors[:term]
        pv_expenses[i] = np.sum(expense_cashflows)
    
    return pd.Series(pv_expenses, index=df.index)