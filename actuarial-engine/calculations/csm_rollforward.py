"""
IFRS 17 CSM Roll-Forward Analysis.
Tracks Contractual Service Margin (CSM) movement from opening to closing balance.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import math


@dataclass
class CSMMovement:
    """Represents CSM movement between periods."""

    opening_csm: float
    new_business_csm: float
    interest_accretion: float
    changes_in_estimates: float
    experience_adjustments: float
    currency_impact: float
    csm_release: float
    closing_csm: float

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)

    def validate(self) -> bool:
        """Validate that movements reconcile to closing balance."""
        calculated_closing = (
            self.opening_csm
            + self.new_business_csm
            + self.interest_accretion
            + self.changes_in_estimates
            + self.experience_adjustments
            + self.currency_impact
            - self.csm_release
        )
        return abs(calculated_closing - self.closing_csm) < 0.01


def calculate_csm_rollforward(
    opening_balance: Dict,
    new_business: List[Dict],
    assumptions: Dict,
    economic_data: Dict,
) -> CSMMovement:
    """
    Calculate CSM roll-forward from opening to closing balance.

    Per IFRS 17.44, CSM is adjusted for:
    (a) Effect of new contracts added
    (b) Interest accreted
    (c) Changes in FCF relating to future service
    (d) Effect of currency exchange differences
    (e) Amount recognized as insurance revenue (release)

    Args:
        opening_balance: Dict with 'csm' and other opening values.
        new_business: List of new policies added in period.
        assumptions: Dict containing 'discount_rate', 'coverage_units', etc.
        economic_data: Dict with 'fx_rate_change', etc.

    Returns:
        CSMMovement object detailing the walk.
    """
    opening_csm = opening_balance.get("csm", 0.0)
    discount_rate = assumptions.get("discount_rate", 0.03)  # 3% default

    # 1. New Business CSM
    # CSM = Premium - FCF - RA (floored at 0 for onerous)
    new_business_csm = 0.0
    for policy in new_business:
        premium = policy.get("premium", 0)
        fcf = policy.get("fcf", 0)
        ra = policy.get("ra", 0)
        initial_csm = premium - fcf - ra
        if initial_csm > 0:
            new_business_csm += initial_csm
        else:
            # Onerous contract, loss component recognized P&L immediately, CSM is 0
            pass

    # 2. Interest Accretion
    # Using locked-in rate for GMM
    interest_accretion = (opening_csm + new_business_csm) * discount_rate

    # 3. Changes in Estimates (Future Service)
    # Placeholder: In production this comes from detailed delta calculation
    changes_in_estimates = assumptions.get("delta_estimates", 0.0)

    # 4. Experience Adjustments (Premiums/Investment component)
    # Differences between expected and actual premiums that relate to future service
    experience_adjustments = assumptions.get("experience_adjustments", 0.0)

    # 5. Currency Exchange Differences
    currency_impact = assumptions.get("fx_impact", 0.0)

    # CSM before release
    csm_before_release = (
        opening_csm
        + new_business_csm
        + interest_accretion
        + changes_in_estimates
        + experience_adjustments
        + currency_impact
    )

    # 6. CSM Release
    # Based on coverage units coverage_units_current / (coverage_units_current + coverage_units_future)
    units_current = assumptions.get("coverage_units_current", 0)
    units_future = assumptions.get("coverage_units_future", 1)  # Avoid div by zero
    total_units = units_current + units_future

    release_ratio = units_current / total_units if total_units > 0 else 0
    csm_release = csm_before_release * release_ratio

    # 7. Closing CSM
    closing_csm = csm_before_release - csm_release

    # Ensure CSM doesn't go negative (if it does, it becomes loss component)
    # For roll-forward simplicity here, we assume it stays positive or 0
    closing_csm = max(0.0, closing_csm)

    return CSMMovement(
        opening_csm=opening_csm,
        new_business_csm=new_business_csm,
        interest_accretion=interest_accretion,
        changes_in_estimates=changes_in_estimates,
        experience_adjustments=experience_adjustments,
        currency_impact=currency_impact,
        csm_release=csm_release,
        closing_csm=closing_csm,
    )


# Example usage
if __name__ == "__main__":
    opening = {"csm": 1000000}
    new_pols = [
        {"premium": 50000, "fcf": 35000, "ra": 5000},  # CSM = 10000
        # Loss = 7000 (Onerous) -> CSM 0
        {"premium": 60000, "fcf": 65000, "ra": 2000},
    ]
    assumps = {
        "discount_rate": 0.04,
        "delta_estimates": 5000,
        "experience_adjustments": -2000,
        "coverage_units_current": 100,
        "coverage_units_future": 900,
    }

    movement = calculate_csm_rollforward(opening, new_pols, assumps, {})
    print(movement)
    print(f"Validated: {movement.validate()}")
