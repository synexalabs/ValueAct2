"""
Economic Scenario Generator (ESG)
Generates stochastic economic scenarios for actuarial modeling

Implements:
- Hull-White model for interest rates
- Geometric Brownian Motion for equity returns
- CIR model for volatility
- Correlated multi-factor scenarios
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class ESGConfig:
    """Configuration for Economic Scenario Generator"""
    num_scenarios: int = 1000
    projection_years: int = 30
    time_steps_per_year: int = 12
    random_seed: Optional[int] = None


@dataclass
class InterestRateParams:
    """Hull-White model parameters for interest rates"""
    mean_reversion_speed: float = 0.1  # a
    long_term_mean: float = 0.03  # b (3%)
    volatility: float = 0.01  # sigma


@dataclass
class EquityParams:
    """GBM parameters for equity returns"""
    drift: float = 0.07  # mu (7% expected return)
    volatility: float = 0.20  # sigma (20% volatility)
    dividend_yield: float = 0.02  # 2% dividend yield


@dataclass 
class InflationParams:
    """Parameters for inflation modeling"""
    mean_reversion_speed: float = 0.15
    long_term_mean: float = 0.02  # 2% target inflation
    volatility: float = 0.01


@dataclass
class CorrelationMatrix:
    """Correlation between risk factors"""
    interest_equity: float = -0.20
    interest_inflation: float = 0.30
    equity_inflation: float = 0.10


class EconomicScenarioGenerator:
    """
    Monte Carlo based Economic Scenario Generator
    
    Generates correlated stochastic paths for:
    - Risk-free interest rates (Hull-White)
    - Equity returns (GBM)
    - Inflation rates (mean-reverting)
    """
    
    def __init__(
        self,
        config: Optional[ESGConfig] = None,
        interest_params: Optional[InterestRateParams] = None,
        equity_params: Optional[EquityParams] = None,
        inflation_params: Optional[InflationParams] = None,
        correlations: Optional[CorrelationMatrix] = None,
    ):
        self.config = config or ESGConfig()
        self.interest_params = interest_params or InterestRateParams()
        self.equity_params = equity_params or EquityParams()
        self.inflation_params = inflation_params or InflationParams()
        self.correlations = correlations or CorrelationMatrix()
        
        if self.config.random_seed is not None:
            np.random.seed(self.config.random_seed)
        
        self.dt = 1.0 / self.config.time_steps_per_year
        self.num_steps = self.config.projection_years * self.config.time_steps_per_year
        
        self._correlation_matrix = self._build_correlation_matrix()
        self._cholesky = np.linalg.cholesky(self._correlation_matrix)
    
    def _build_correlation_matrix(self) -> np.ndarray:
        """Build 3x3 correlation matrix for risk factors"""
        corr = np.array([
            [1.0, self.correlations.interest_equity, self.correlations.interest_inflation],
            [self.correlations.interest_equity, 1.0, self.correlations.equity_inflation],
            [self.correlations.interest_inflation, self.correlations.equity_inflation, 1.0]
        ])
        return corr
    
    def _generate_correlated_normals(self) -> np.ndarray:
        """Generate correlated standard normal random variables"""
        uncorrelated = np.random.standard_normal(
            (3, self.config.num_scenarios, self.num_steps)
        )
        correlated = np.einsum('ij,jkl->ikl', self._cholesky, uncorrelated)
        return correlated
    
    def _generate_interest_rate_paths(
        self,
        z: np.ndarray,
        initial_rate: float = 0.03
    ) -> np.ndarray:
        """
        Generate interest rate paths using Hull-White model
        dr = a(b - r)dt + sigma * dW
        """
        a = self.interest_params.mean_reversion_speed
        b = self.interest_params.long_term_mean
        sigma = self.interest_params.volatility
        
        rates = np.zeros((self.config.num_scenarios, self.num_steps + 1))
        rates[:, 0] = initial_rate
        
        sqrt_dt = np.sqrt(self.dt)
        
        for t in range(self.num_steps):
            dr = a * (b - rates[:, t]) * self.dt + sigma * sqrt_dt * z[:, t]
            rates[:, t + 1] = np.maximum(rates[:, t] + dr, 0.0001)  # Floor at 0.01%
        
        return rates
    
    def _generate_equity_paths(
        self,
        z: np.ndarray,
        initial_value: float = 100.0
    ) -> np.ndarray:
        """
        Generate equity index paths using GBM
        dS = mu * S * dt + sigma * S * dW
        """
        mu = self.equity_params.drift
        sigma = self.equity_params.volatility
        
        log_returns = np.zeros((self.config.num_scenarios, self.num_steps + 1))
        log_returns[:, 0] = np.log(initial_value)
        
        sqrt_dt = np.sqrt(self.dt)
        
        for t in range(self.num_steps):
            dlog_s = (mu - 0.5 * sigma**2) * self.dt + sigma * sqrt_dt * z[:, t]
            log_returns[:, t + 1] = log_returns[:, t] + dlog_s
        
        return np.exp(log_returns)
    
    def _generate_inflation_paths(
        self,
        z: np.ndarray,
        initial_rate: float = 0.02
    ) -> np.ndarray:
        """
        Generate inflation paths using Ornstein-Uhlenbeck process
        dI = a(b - I)dt + sigma * dW
        """
        a = self.inflation_params.mean_reversion_speed
        b = self.inflation_params.long_term_mean
        sigma = self.inflation_params.volatility
        
        inflation = np.zeros((self.config.num_scenarios, self.num_steps + 1))
        inflation[:, 0] = initial_rate
        
        sqrt_dt = np.sqrt(self.dt)
        
        for t in range(self.num_steps):
            dI = a * (b - inflation[:, t]) * self.dt + sigma * sqrt_dt * z[:, t]
            inflation[:, t + 1] = inflation[:, t] + dI
        
        return inflation
    
    def generate_scenarios(
        self,
        initial_rate: float = 0.03,
        initial_equity: float = 100.0,
        initial_inflation: float = 0.02
    ) -> Dict:
        """
        Generate full set of correlated economic scenarios
        
        Returns:
            Dictionary containing:
            - interest_rates: (num_scenarios, num_steps+1) array
            - equity_index: (num_scenarios, num_steps+1) array
            - inflation_rates: (num_scenarios, num_steps+1) array
            - time_points: array of time points in years
            - statistics: summary statistics
        """
        logger.info(f"Generating {self.config.num_scenarios} scenarios over {self.config.projection_years} years")
        
        start_time = datetime.now()
        
        # Generate correlated random normals
        z = self._generate_correlated_normals()
        
        # Generate paths for each risk factor
        interest_rates = self._generate_interest_rate_paths(z[0], initial_rate)
        equity_index = self._generate_equity_paths(z[1], initial_equity)
        inflation_rates = self._generate_inflation_paths(z[2], initial_inflation)
        
        # Time points
        time_points = np.linspace(0, self.config.projection_years, self.num_steps + 1)
        
        # Calculate statistics
        statistics = self._calculate_statistics(interest_rates, equity_index, inflation_rates)
        
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Scenario generation completed in {duration:.2f} seconds")
        
        return {
            'interest_rates': interest_rates,
            'equity_index': equity_index,
            'inflation_rates': inflation_rates,
            'time_points': time_points,
            'statistics': statistics,
            'config': {
                'num_scenarios': self.config.num_scenarios,
                'projection_years': self.config.projection_years,
                'time_steps_per_year': self.config.time_steps_per_year,
            },
            'generation_time_seconds': duration,
        }
    
    def _calculate_statistics(
        self,
        interest_rates: np.ndarray,
        equity_index: np.ndarray,
        inflation_rates: np.ndarray
    ) -> Dict:
        """Calculate summary statistics for scenarios"""
        
        def percentiles(arr, year_indices):
            stats = {}
            for year, idx in year_indices.items():
                stats[f'year_{year}'] = {
                    'mean': float(np.mean(arr[:, idx])),
                    'std': float(np.std(arr[:, idx])),
                    'p5': float(np.percentile(arr[:, idx], 5)),
                    'p25': float(np.percentile(arr[:, idx], 25)),
                    'p50': float(np.percentile(arr[:, idx], 50)),
                    'p75': float(np.percentile(arr[:, idx], 75)),
                    'p95': float(np.percentile(arr[:, idx], 95)),
                }
            return stats
        
        year_indices = {}
        for year in [1, 5, 10, 20, 30]:
            if year <= self.config.projection_years:
                year_indices[year] = year * self.config.time_steps_per_year
        
        return {
            'interest_rates': percentiles(interest_rates, year_indices),
            'equity_index': percentiles(equity_index, year_indices),
            'inflation_rates': percentiles(inflation_rates, year_indices),
        }
    
    def get_discount_factors(self, scenarios: Dict) -> np.ndarray:
        """
        Calculate discount factors from interest rate paths
        
        Returns:
            (num_scenarios, num_steps+1) array of cumulative discount factors
        """
        interest_rates = scenarios['interest_rates']
        discount_factors = np.zeros_like(interest_rates)
        discount_factors[:, 0] = 1.0
        
        for t in range(1, interest_rates.shape[1]):
            # Simple average rate for the period
            avg_rate = (interest_rates[:, t-1] + interest_rates[:, t]) / 2
            discount_factors[:, t] = discount_factors[:, t-1] * np.exp(-avg_rate * self.dt)
        
        return discount_factors
    
    def get_scenario_percentile(
        self,
        scenarios: Dict,
        percentile: float,
        risk_factor: str = 'interest_rates'
    ) -> np.ndarray:
        """Get a specific percentile path across all scenarios"""
        data = scenarios[risk_factor]
        return np.percentile(data, percentile, axis=0)


def generate_esg_scenarios(
    num_scenarios: int = 1000,
    projection_years: int = 30,
    initial_rate: float = 0.03,
    initial_equity: float = 100.0,
    seed: Optional[int] = None,
    **kwargs
) -> Dict:
    """
    Convenience function to generate ESG scenarios
    
    Args:
        num_scenarios: Number of Monte Carlo scenarios
        projection_years: Projection horizon in years
        initial_rate: Starting risk-free rate
        initial_equity: Starting equity index level
        seed: Random seed for reproducibility
        **kwargs: Additional parameters for models
    
    Returns:
        Dictionary with scenario results and statistics
    """
    config = ESGConfig(
        num_scenarios=num_scenarios,
        projection_years=projection_years,
        random_seed=seed,
    )
    
    esg = EconomicScenarioGenerator(config=config)
    return esg.generate_scenarios(
        initial_rate=initial_rate,
        initial_equity=initial_equity,
    )


# Export for API use
__all__ = [
    'EconomicScenarioGenerator',
    'ESGConfig',
    'InterestRateParams',
    'EquityParams',
    'InflationParams',
    'CorrelationMatrix',
    'generate_esg_scenarios',
]
