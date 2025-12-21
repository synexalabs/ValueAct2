"""
Monte Carlo Simulation for IFRS 17 Risk Adjustment.
Calibrates RA to specified confidence level (e.g., 75th percentile).
"""
import numpy as np
from typing import Tuple, Dict, Optional

def simulate_cashflows(
    expected_cashflows: np.ndarray,
    volatility_assumptions: Dict[str, float],
    num_simulations: int = 10000,
    seed: int = 42
) -> np.ndarray:
    """
    Simulate future cash flows using Log-Normal shocks.

    Args:
        expected_cashflows: 1D array of expected cash flows over time.
        volatility_assumptions: Dict with keys 'mortality', 'lapse', 'expense'.
        num_simulations: Number of paths to simulate.
        seed: Random seed for reproducibility.

    Returns:
        2D array of shape (num_simulations, len(expected_cashflows))
    """
    np.random.seed(seed)
    n_periods = len(expected_cashflows)
    
    # 1. Mortality Shock (Lognormal)
    mortality_vol = volatility_assumptions.get('mortality', 0.05)
    mortality_shocks = np.random.lognormal(
        mean=0, sigma=mortality_vol, size=(num_simulations, n_periods)
    )
    
    # 2. Lapse Shock (Lognormal)
    lapse_vol = volatility_assumptions.get('lapse', 0.10)
    lapse_shocks = np.random.lognormal(
        mean=0, sigma=lapse_vol, size=(num_simulations, n_periods)
    )
    
    # 3. Expense Shock (Lognormal)
    expense_vol = volatility_assumptions.get('expense', 0.03)
    expense_shocks = np.random.lognormal(
        mean=0, sigma=expense_vol, size=(num_simulations, n_periods)
    )
    
    # Combined Multiplicative Shock
    # In reality, this would be applied to specific CF components. 
    # Simplified here as applying to total CF.
    combined_shocks = mortality_shocks * lapse_shocks * expense_shocks
    
    simulated_cfs = expected_cashflows * combined_shocks
    
    return simulated_cfs


def calculate_risk_adjustment_monte_carlo(
    expected_cashflows: np.ndarray,
    discount_curve: np.ndarray,
    confidence_level: float = 0.75,
    num_simulations: int = 10000,
    volatility_assumptions: Optional[Dict[str, float]] = None
) -> Tuple[float, Dict]:
    """
    Calculate Risk Adjustment (RA) using Monte Carlo.

    RA = VaR(Confidence Level) - Expected Present Value
    
    Args:
        expected_cashflows: Array of expected CFs.
        discount_curve: Array of discount factors corresponding to CF timing.
        confidence_level: Target percentile (e.g., 0.75).
        num_simulations: Number of simulations.
        volatility_assumptions: Volatility parameters.

    Returns:
        Tuple (risk_adjustment_amount, diagnostics_dict)
    """
    if volatility_assumptions is None:
        volatility_assumptions = {'mortality': 0.05, 'lapse': 0.10, 'expense': 0.03}
        
    # Run Simulation
    simulated_cfs_matrix = simulate_cashflows(
        expected_cashflows, 
        volatility_assumptions, 
        num_simulations
    )
    
    # Calculate Present Value for each simulation
    # Sum(CF_t * DF_t) across time
    simulated_pvs = np.sum(simulated_cfs_matrix * discount_curve, axis=1)
    
    # Calculate Metrics
    expected_pv = np.sum(expected_cashflows * discount_curve)
    
    # Determine Value at Risk (VaR) at confidence level
    var_value = np.percentile(simulated_pvs, confidence_level * 100)
    
    # Risk Adjustment
    risk_adjustment = var_value - expected_pv
    
    # Ensure non-negative RA (typically)
    # risk_adjustment = max(0, risk_adjustment)

    diagnostics = {
        'expected_pv': expected_pv,
        'var_at_confidence': var_value,
        'confidence_level': confidence_level,
        'num_simulations': num_simulations,
        'std_dev': np.std(simulated_pvs),
        'min_pv': np.min(simulated_pvs),
        'max_pv': np.max(simulated_pvs)
    }
    
    return risk_adjustment, diagnostics

# Example Usage
if __name__ == "__main__":
    cfs = np.array([100, 100, 100, 100, 100]) # 5 years
    dfs = np.array([0.97, 0.94, 0.91, 0.88, 0.85]) # ~3% discount
    
    ra, diag = calculate_risk_adjustment_monte_carlo(cfs, dfs)
    
    print(f"Risk Adjustment (75%): {ra:.2f}")
    print("Diagnostics:", diag)
