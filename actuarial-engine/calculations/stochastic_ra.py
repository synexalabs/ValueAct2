"""
Stochastic Risk Adjustment Calculator
Monte Carlo based risk adjustment calculation for IFRS 17

Implements:
- Monte Carlo simulation of future cash flows
- Confidence interval based risk adjustment
- Cost of Capital approach
- VaR and TVaR calculations
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class RiskAdjustmentConfig:
    """Configuration for stochastic risk adjustment"""
    num_simulations: int = 10000
    projection_years: int = 30
    confidence_level: float = 0.75  # IFRS 17 typically 75-90%
    cost_of_capital_rate: float = 0.06  # 6% CoC rate
    time_steps_per_year: int = 1
    random_seed: Optional[int] = None


@dataclass
class MortalityAssumptions:
    """Mortality assumptions for simulation"""
    base_mortality_rate: float = 0.001  # base q_x
    mortality_improvement: float = 0.01  # 1% annual improvement
    mortality_volatility: float = 0.10  # 10% volatility around base


@dataclass
class LapseAssumptions:
    """Lapse assumptions for simulation"""
    base_lapse_rate: float = 0.05  # 5% base lapse
    lapse_volatility: float = 0.20  # 20% volatility
    shock_probability: float = 0.05  # 5% chance of shock
    shock_multiplier: float = 2.0  # Double lapse in shock


@dataclass
class ExpenseAssumptions:
    """Expense assumptions for simulation"""
    base_expense_ratio: float = 0.03  # 3% of premium
    expense_volatility: float = 0.15  # 15% volatility
    inflation_rate: float = 0.02  # 2% inflation


class StochasticRiskAdjustment:
    """
    Monte Carlo based risk adjustment calculator
    
    Calculates the risk adjustment for non-financial risks
    using stochastic simulation of future cash flows
    """
    
    def __init__(
        self,
        config: Optional[RiskAdjustmentConfig] = None,
        mortality: Optional[MortalityAssumptions] = None,
        lapse: Optional[LapseAssumptions] = None,
        expense: Optional[ExpenseAssumptions] = None,
    ):
        self.config = config or RiskAdjustmentConfig()
        self.mortality = mortality or MortalityAssumptions()
        self.lapse = lapse or LapseAssumptions()
        self.expense = expense or ExpenseAssumptions()
        
        if self.config.random_seed is not None:
            np.random.seed(self.config.random_seed)
        
        self.num_steps = self.config.projection_years * self.config.time_steps_per_year
    
    def _simulate_mortality_rates(self) -> np.ndarray:
        """
        Simulate stochastic mortality rates
        Uses log-normal distribution around base mortality
        """
        base_rates = np.zeros((self.config.num_simulations, self.num_steps))
        
        for t in range(self.num_steps):
            year = t // self.config.time_steps_per_year
            # Apply mortality improvement
            improved_base = self.mortality.base_mortality_rate * (
                1 - self.mortality.mortality_improvement
            ) ** year
            
            # Log-normal shock
            log_shock = np.random.normal(
                0, self.mortality.mortality_volatility,
                self.config.num_simulations
            )
            base_rates[:, t] = improved_base * np.exp(log_shock)
        
        return np.clip(base_rates, 0.0001, 0.5)  # Reasonable mortality bounds
    
    def _simulate_lapse_rates(self) -> np.ndarray:
        """
        Simulate stochastic lapse rates
        Includes possibility of mass lapse events
        """
        lapse_rates = np.zeros((self.config.num_simulations, self.num_steps))
        
        for t in range(self.num_steps):
            # Base lapse with log-normal shock
            log_shock = np.random.normal(
                0, self.lapse.lapse_volatility,
                self.config.num_simulations
            )
            base_lapse = self.lapse.base_lapse_rate * np.exp(log_shock)
            
            # Apply random mass lapse events
            shock_mask = np.random.random(self.config.num_simulations) < self.lapse.shock_probability
            lapse_rates[:, t] = np.where(
                shock_mask,
                base_lapse * self.lapse.shock_multiplier,
                base_lapse
            )
        
        return np.clip(lapse_rates, 0.001, 0.8)  # Reasonable lapse bounds
    
    def _simulate_expense_ratios(self) -> np.ndarray:
        """
        Simulate stochastic expense ratios
        Includes inflation impact
        """
        expense_ratios = np.zeros((self.config.num_simulations, self.num_steps))
        
        for t in range(self.num_steps):
            year = t // self.config.time_steps_per_year
            # Base with inflation
            inflated_base = self.expense.base_expense_ratio * (
                1 + self.expense.inflation_rate
            ) ** year
            
            # Log-normal shock
            log_shock = np.random.normal(
                0, self.expense.expense_volatility,
                self.config.num_simulations
            )
            expense_ratios[:, t] = inflated_base * np.exp(log_shock)
        
        return np.clip(expense_ratios, 0.01, 0.20)  # Reasonable expense bounds
    
    def simulate_cash_flows(
        self,
        premium_cash_flows: np.ndarray,
        claim_cash_flows: np.ndarray,
        discount_rates: np.ndarray,
    ) -> Dict:
        """
        Simulate stochastic cash flows
        
        Args:
            premium_cash_flows: Expected premium cash flows by period
            claim_cash_flows: Expected claim cash flows by period
            discount_rates: Discount rates by period
        
        Returns:
            Dictionary with simulated present values
        """
        logger.info(f"Running {self.config.num_simulations} simulations")
        start_time = datetime.now()
        
        # Ensure arrays are correct length
        num_periods = min(len(premium_cash_flows), len(claim_cash_flows), self.num_steps)
        
        # Simulate risk factors
        mortality_rates = self._simulate_mortality_rates()[:, :num_periods]
        lapse_rates = self._simulate_lapse_rates()[:, :num_periods]
        expense_ratios = self._simulate_expense_ratios()[:, :num_periods]
        
        # Calculate discount factors
        discount_factors = np.zeros((num_periods,))
        cumulative_df = 1.0
        for t in range(num_periods):
            rate = discount_rates[t] if t < len(discount_rates) else discount_rates[-1]
            cumulative_df *= 1 / (1 + rate)
            discount_factors[t] = cumulative_df
        
        # Simulate present values
        pv_premiums = np.zeros(self.config.num_simulations)
        pv_claims = np.zeros(self.config.num_simulations)
        pv_expenses = np.zeros(self.config.num_simulations)
        
        for sim in range(self.config.num_simulations):
            survival_prob = 1.0
            
            for t in range(num_periods):
                # Decrement for mortality and lapse
                mortality = mortality_rates[sim, t]
                lapse = lapse_rates[sim, t]
                expense = expense_ratios[sim, t]
                
                # Cash flows adjusted by survival/persistency
                premium_cf = premium_cash_flows[t] * survival_prob * (1 - lapse)
                claim_cf = claim_cash_flows[t] * survival_prob * mortality
                expense_cf = premium_cf * expense
                
                # Discount
                pv_premiums[sim] += premium_cf * discount_factors[t]
                pv_claims[sim] += claim_cf * discount_factors[t]
                pv_expenses[sim] += expense_cf * discount_factors[t]
                
                # Update survival
                survival_prob *= (1 - mortality) * (1 - lapse)
        
        # Net cash flows
        net_cash_flows = pv_premiums - pv_claims - pv_expenses
        
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Simulation completed in {duration:.2f} seconds")
        
        return {
            'pv_premiums': pv_premiums,
            'pv_claims': pv_claims,
            'pv_expenses': pv_expenses,
            'net_cash_flows': net_cash_flows,
            'simulation_time_seconds': duration,
        }
    
    def calculate_risk_adjustment(
        self,
        premium_cash_flows: np.ndarray,
        claim_cash_flows: np.ndarray,
        discount_rates: np.ndarray,
        method: str = 'confidence_level'
    ) -> Dict:
        """
        Calculate the risk adjustment using specified method
        
        Args:
            premium_cash_flows: Expected premium cash flows
            claim_cash_flows: Expected claim cash flows
            discount_rates: Discount rates by period
            method: 'confidence_level', 'cost_of_capital', or 'var'
        
        Returns:
            Dictionary with risk adjustment results
        """
        # Run simulations
        results = self.simulate_cash_flows(
            premium_cash_flows,
            claim_cash_flows,
            discount_rates,
        )
        
        net_cf = results['net_cash_flows']
        expected = np.mean(net_cf)
        
        if method == 'confidence_level':
            # Risk adjustment as difference between mean and percentile
            percentile_value = np.percentile(net_cf, (1 - self.config.confidence_level) * 100)
            risk_adjustment = expected - percentile_value
            
        elif method == 'cost_of_capital':
            # Risk adjustment based on capital requirement at 99.5% VaR
            var_995 = expected - np.percentile(net_cf, 0.5)
            risk_adjustment = var_995 * self.config.cost_of_capital_rate * self.config.projection_years
            
        elif method == 'var':
            # Simple VaR based risk adjustment
            risk_adjustment = expected - np.percentile(net_cf, (1 - self.config.confidence_level) * 100)
            
        else:
            raise ValueError(f"Unknown method: {method}")
        
        # Calculate additional statistics
        var_95 = expected - np.percentile(net_cf, 5)
        var_99 = expected - np.percentile(net_cf, 1)
        tvar_95 = expected - np.mean(net_cf[net_cf <= np.percentile(net_cf, 5)])
        
        return {
            'risk_adjustment': float(risk_adjustment),
            'method': method,
            'confidence_level': self.config.confidence_level,
            'expected_net_cf': float(expected),
            'std_dev': float(np.std(net_cf)),
            'var_95': float(var_95),
            'var_99': float(var_99),
            'tvar_95': float(tvar_95),
            'percentiles': {
                'p1': float(np.percentile(net_cf, 1)),
                'p5': float(np.percentile(net_cf, 5)),
                'p25': float(np.percentile(net_cf, 25)),
                'p50': float(np.percentile(net_cf, 50)),
                'p75': float(np.percentile(net_cf, 75)),
                'p95': float(np.percentile(net_cf, 95)),
                'p99': float(np.percentile(net_cf, 99)),
            },
            'simulation_count': self.config.num_simulations,
        }
    
    def calculate_ra_by_risk_type(
        self,
        premium_cash_flows: np.ndarray,
        claim_cash_flows: np.ndarray,
        discount_rates: np.ndarray,
    ) -> Dict:
        """
        Calculate risk adjustment decomposed by risk type
        """
        # Full calculation
        full_ra = self.calculate_risk_adjustment(
            premium_cash_flows, claim_cash_flows, discount_rates
        )
        
        # Mortality only (set other volatilities to zero)
        mortality_only = StochasticRiskAdjustment(
            config=self.config,
            mortality=self.mortality,
            lapse=LapseAssumptions(
                base_lapse_rate=self.lapse.base_lapse_rate,
                lapse_volatility=0.0,
                shock_probability=0.0,
            ),
            expense=ExpenseAssumptions(
                base_expense_ratio=self.expense.base_expense_ratio,
                expense_volatility=0.0,
            ),
        )
        mort_ra = mortality_only.calculate_risk_adjustment(
            premium_cash_flows, claim_cash_flows, discount_rates
        )
        
        # Lapse only
        lapse_only = StochasticRiskAdjustment(
            config=self.config,
            mortality=MortalityAssumptions(
                base_mortality_rate=self.mortality.base_mortality_rate,
                mortality_volatility=0.0,
            ),
            lapse=self.lapse,
            expense=ExpenseAssumptions(
                base_expense_ratio=self.expense.base_expense_ratio,
                expense_volatility=0.0,
            ),
        )
        lapse_ra = lapse_only.calculate_risk_adjustment(
            premium_cash_flows, claim_cash_flows, discount_rates
        )
        
        return {
            'total_risk_adjustment': full_ra['risk_adjustment'],
            'mortality_contribution': mort_ra['risk_adjustment'],
            'lapse_contribution': lapse_ra['risk_adjustment'],
            'expense_contribution': full_ra['risk_adjustment'] - mort_ra['risk_adjustment'] - lapse_ra['risk_adjustment'],
            'diversification_benefit': (
                mort_ra['risk_adjustment'] + lapse_ra['risk_adjustment'] - full_ra['risk_adjustment']
            ),
            'breakdown_percentages': {
                'mortality': mort_ra['risk_adjustment'] / max(full_ra['risk_adjustment'], 0.01) * 100,
                'lapse': lapse_ra['risk_adjustment'] / max(full_ra['risk_adjustment'], 0.01) * 100,
            },
        }


def calculate_stochastic_ra(
    premium_cash_flows: List[float],
    claim_cash_flows: List[float],
    discount_rate: float = 0.03,
    confidence_level: float = 0.75,
    num_simulations: int = 10000,
    seed: Optional[int] = None,
) -> Dict:
    """
    Convenience function to calculate stochastic risk adjustment
    
    Args:
        premium_cash_flows: List of expected premium cash flows
        claim_cash_flows: List of expected claim cash flows
        discount_rate: Flat discount rate
        confidence_level: Confidence level for RA calculation
        num_simulations: Number of Monte Carlo simulations
        seed: Random seed for reproducibility
    
    Returns:
        Dictionary with risk adjustment results
    """
    config = RiskAdjustmentConfig(
        num_simulations=num_simulations,
        projection_years=len(premium_cash_flows),
        confidence_level=confidence_level,
        random_seed=seed,
    )
    
    calculator = StochasticRiskAdjustment(config=config)
    
    # Create flat discount rate array
    discount_rates = np.full(len(premium_cash_flows), discount_rate)
    
    return calculator.calculate_risk_adjustment(
        np.array(premium_cash_flows),
        np.array(claim_cash_flows),
        discount_rates,
    )


__all__ = [
    'StochasticRiskAdjustment',
    'RiskAdjustmentConfig',
    'MortalityAssumptions',
    'LapseAssumptions',
    'ExpenseAssumptions',
    'calculate_stochastic_ra',
]
