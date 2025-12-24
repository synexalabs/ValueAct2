"""
Validation utilities for actuarial calculations
Provides comprehensive validation checks for range, consistency, and reasonableness
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ValidationRule:
    """Base class for validation rules"""
    
    def __init__(self, name: str, description: str, severity: str = 'error'):
        self.name = name
        self.description = description
        self.severity = severity  # 'error', 'warning', 'info'
        self.passed = False
        self.message = ""
        self.actual_value = None
        self.expected_value = None
        self.timestamp = datetime.now()
    
    def validate(self, *args, **kwargs) -> bool:
        """Override in subclasses to implement validation logic"""
        raise NotImplementedError
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'description': self.description,
            'severity': self.severity,
            'passed': self.passed,
            'message': self.message,
            'actualValue': self.actual_value,
            'expectedValue': self.expected_value,
            'timestamp': self.timestamp.isoformat()
        }

class RangeValidationRule(ValidationRule):
    """Validates that values are within expected ranges"""
    
    def __init__(self, name: str, description: str, min_value: Optional[float] = None, 
                 max_value: Optional[float] = None, severity: str = 'error'):
        super().__init__(name, description, severity)
        self.min_value = min_value
        self.max_value = max_value
    
    def validate(self, value: float) -> bool:
        """Validate that value is within range"""
        self.actual_value = value
        
        if self.min_value is not None and value < self.min_value:
            self.passed = False
            self.message = f"Value {value} is below minimum {self.min_value}"
            self.expected_value = f">= {self.min_value}"
            return False
        
        if self.max_value is not None and value > self.max_value:
            self.passed = False
            self.message = f"Value {value} is above maximum {self.max_value}"
            self.expected_value = f"<= {self.max_value}"
            return False
        
        self.passed = True
        self.message = f"Value {value} is within acceptable range"
        self.expected_value = f"[{self.min_value or '-∞'}, {self.max_value or '∞'}]"
        return True

class ConsistencyValidationRule(ValidationRule):
    """Validates consistency between related values"""
    
    def __init__(self, name: str, description: str, check_function: callable, 
                 severity: str = 'error'):
        super().__init__(name, description, severity)
        self.check_function = check_function
    
    def validate(self, *args, **kwargs) -> bool:
        """Validate consistency using provided function"""
        try:
            result = self.check_function(*args, **kwargs)
            self.passed = result
            if result:
                self.message = "Consistency check passed"
            else:
                self.message = "Consistency check failed"
            return result
        except Exception as e:
            self.passed = False
            self.message = f"Consistency check error: {str(e)}"
            logger.error(f"Consistency validation error in {self.name}: {e}")
            return False

class ReasonablenessValidationRule(ValidationRule):
    """Validates reasonableness of results using benchmarks"""
    
    def __init__(self, name: str, description: str, benchmark_value: float, 
                 tolerance: float = 0.1, method: str = 'percentage', severity: str = 'warning'):
        super().__init__(name, description, severity)
        self.benchmark_value = benchmark_value
        self.tolerance = tolerance
        self.method = method  # 'percentage', 'absolute', 'ratio'
    
    def validate(self, actual_value: float) -> bool:
        """Validate reasonableness against benchmark"""
        self.actual_value = actual_value
        
        if self.method == 'percentage':
            deviation = abs(actual_value - self.benchmark_value) / abs(self.benchmark_value)
            threshold = self.tolerance
        elif self.method == 'absolute':
            deviation = abs(actual_value - self.benchmark_value)
            threshold = self.tolerance
        elif self.method == 'ratio':
            if self.benchmark_value == 0:
                self.passed = False
                self.message = "Cannot validate ratio with zero benchmark"
                return False
            deviation = abs(actual_value / self.benchmark_value - 1)
            threshold = self.tolerance
        else:
            self.passed = False
            self.message = f"Unknown validation method: {self.method}"
            return False
        
        self.passed = deviation <= threshold
        if self.passed:
            self.message = f"Value {actual_value} is reasonable (deviation: {deviation:.2%})"
        else:
            self.message = f"Value {actual_value} deviates significantly from benchmark {self.benchmark_value} (deviation: {deviation:.2%})"
        
        self.expected_value = f"Benchmark: {self.benchmark_value} (±{self.tolerance:.1%})"
        return self.passed

class ValidationEngine:
    """Main validation engine for actuarial calculations"""
    
    def __init__(self):
        self.range_checks: List[RangeValidationRule] = []
        self.consistency_checks: List[ConsistencyValidationRule] = []
        self.reasonableness_tests: List[ReasonablenessValidationRule] = []
        self.validation_results = {
            'rangeChecks': [],
            'consistencyChecks': [],
            'reasonablenessTests': [],
            'passedAll': False,
            'timestamp': datetime.now().isoformat()
        }
    
    def add_range_check(self, name: str, description: str, min_value: Optional[float] = None,
                       max_value: Optional[float] = None, severity: str = 'error'):
        """Add a range validation rule"""
        rule = RangeValidationRule(name, description, min_value, max_value, severity)
        self.range_checks.append(rule)
        return rule
    
    def add_consistency_check(self, name: str, description: str, check_function: callable,
                             severity: str = 'error'):
        """Add a consistency validation rule"""
        rule = ConsistencyValidationRule(name, description, check_function, severity)
        self.consistency_checks.append(rule)
        return rule
    
    def add_reasonableness_test(self, name: str, description: str, benchmark_value: float,
                               tolerance: float = 0.1, method: str = 'percentage', severity: str = 'warning'):
        """Add a reasonableness validation rule"""
        rule = ReasonablenessValidationRule(name, description, benchmark_value, tolerance, method, severity)
        self.reasonableness_tests.append(rule)
        return rule
    
    def validate_csm_calculation(self, premium: float, fcf: float, ra: float, csm: float) -> Dict[str, Any]:
        """Validate CSM calculation results"""
        logger.info("Starting CSM validation")
        
        # Range checks
        self.add_range_check(
            "CSM Non-Negative",
            "CSM cannot be negative",
            min_value=0,
            severity='error'
        )
        
        self.add_range_check(
            "Premium Positive",
            "Premium must be positive",
            min_value=0,
            severity='error'
        )
        
        self.add_range_check(
            "FCF Non-Negative",
            "Fulfillment cash flows must be non-negative",
            min_value=0,
            severity='error'
        )
        
        self.add_range_check(
            "RA Non-Negative",
            "Risk adjustment must be non-negative",
            min_value=0,
            severity='error'
        )
        
        # Consistency checks
        def csm_formula_check(premium, fcf, ra, csm):
            """
            Check if CSM follows the correct formula.
            
            Note: FCF convention can vary:
            - If FCF represents net margin (PV_premiums - PV_benefits - PV_expenses), then:
              CSM = max(0, FCF - RA)
            - If FCF represents liability (positive = cost), then:
              CSM = max(0, Premium - FCF - RA)
            
            We check both conventions to support different input formats.
            """
            # Convention 1: FCF as net margin (used in ifrs17.py)
            expected_csm_1 = max(0, fcf - ra)
            # Convention 2: FCF as liability (legacy)
            expected_csm_2 = max(0, premium - fcf - ra)
            
            # Accept if either convention matches (with tolerance for float comparison)
            tolerance = max(1e-6, abs(csm) * 0.001)  # 0.1% relative tolerance
            return abs(csm - expected_csm_1) < tolerance or abs(csm - expected_csm_2) < tolerance
        
        self.add_consistency_check(
            "CSM Formula Consistency",
            "CSM must follow the formula CSM = max(0, FCF - RA) or CSM = max(0, P - FCF - RA)",
            csm_formula_check,
            severity='error'
        )
        
        def onerous_contract_check(premium, fcf, ra, csm):
            """Check if onerous contract logic is correct - CSM should be 0 for onerous"""
            # Onerous when FCF (as liability) > Premium, or when FCF (as margin) < RA
            is_onerous = (fcf < ra) or (premium < fcf + ra if fcf < 0 else False)
            if is_onerous:
                return csm == 0 or abs(csm) < 1e-6  # Should be zero for onerous contracts
            return True
        
        self.add_consistency_check(
            "Onerous Contract Logic",
            "Onerous contracts should have CSM = 0",
            onerous_contract_check,
            severity='error'
        )
        
        # Reasonableness tests
        self.add_reasonableness_test(
            "CSM Reasonableness",
            "CSM should be reasonable relative to premium",
            benchmark_value=premium * 0.1,  # Assume 10% of premium is reasonable
            tolerance=0.5,  # 50% tolerance
            method='absolute',
            severity='warning'
        )
        
        # Run validations
        self._run_range_checks(csm, premium, fcf, ra)
        self._run_consistency_checks(premium, fcf, ra, csm)
        self._run_reasonableness_tests(csm)
        
        return self.get_validation_results()
    
    def validate_solvency_calculation(self, scr: float, mcr: float, available_capital: float) -> Dict[str, Any]:
        """Validate Solvency II calculation results"""
        logger.info("Starting Solvency validation")
        
        # Range checks
        self.add_range_check(
            "SCR Positive",
            "SCR must be positive",
            min_value=0,
            severity='error'
        )
        
        self.add_range_check(
            "MCR Positive",
            "MCR must be positive",
            min_value=0,
            severity='error'
        )
        
        self.add_range_check(
            "Available Capital Non-Negative",
            "Available capital must be non-negative",
            min_value=0,
            severity='error'
        )
        
        # Consistency checks
        def scr_mcr_relationship(scr, mcr):
            """SCR should generally be higher than MCR"""
            return scr >= mcr
        
        self.add_consistency_check(
            "SCR-MCR Relationship",
            "SCR should be greater than or equal to MCR",
            scr_mcr_relationship,
            severity='error'
        )
        
        # Reasonableness tests
        self.add_reasonableness_test(
            "SCR Reasonableness",
            "SCR should be reasonable relative to available capital",
            benchmark_value=available_capital * 0.3,  # Assume 30% of capital
            tolerance=0.5,
            method='absolute',
            severity='warning'
        )
        
        # Run validations
        self._run_range_checks(scr, mcr, available_capital)
        self._run_consistency_checks(scr, mcr)
        self._run_reasonableness_tests(scr)
        
        return self.get_validation_results()
    
    def validate_present_value_calculation(self, cash_flows: List[float], discount_rate: float, 
                                         present_value: float) -> Dict[str, Any]:
        """Validate present value calculation results"""
        logger.info("Starting Present Value validation")
        
        # Range checks
        self.add_range_check(
            "Discount Rate Reasonable",
            "Discount rate should be between 0% and 20%",
            min_value=0,
            max_value=0.2,
            severity='warning'
        )
        
        self.add_range_check(
            "Present Value Non-Negative",
            "Present value should be non-negative for typical insurance cash flows",
            min_value=0,
            severity='warning'
        )
        
        # Consistency checks
        def pv_formula_check(cash_flows, discount_rate, present_value):
            """Check if PV follows the correct formula"""
            expected_pv = sum(cf / (1 + discount_rate) ** (i + 1) for i, cf in enumerate(cash_flows))
            return abs(present_value - expected_pv) < 1e-6
        
        self.add_consistency_check(
            "PV Formula Consistency",
            "Present value must follow the correct discounting formula",
            pv_formula_check,
            severity='error'
        )
        
        # Run validations
        self._run_range_checks(discount_rate, present_value)
        self._run_consistency_checks(cash_flows, discount_rate, present_value)
        
        return self.get_validation_results()
    
    def _run_range_checks(self, *values):
        """Run all range checks on provided values"""
        for i, rule in enumerate(self.range_checks):
            if i < len(values):
                rule.validate(values[i])
                self.validation_results['rangeChecks'].append(rule.to_dict())
    
    def _run_consistency_checks(self, *args):
        """Run all consistency checks with provided arguments"""
        for rule in self.consistency_checks:
            rule.validate(*args)
            self.validation_results['consistencyChecks'].append(rule.to_dict())
    
    def _run_reasonableness_tests(self, *values):
        """Run all reasonableness tests on provided values"""
        for i, rule in enumerate(self.reasonableness_tests):
            if i < len(values):
                rule.validate(values[i])
                self.validation_results['reasonablenessTests'].append(rule.to_dict())
    
    def get_validation_results(self) -> Dict[str, Any]:
        """Get comprehensive validation results"""
        # Determine overall pass/fail status
        all_passed = (
            all(check['passed'] for check in self.validation_results['rangeChecks']) and
            all(check['passed'] for check in self.validation_results['consistencyChecks']) and
            all(test['passed'] for test in self.validation_results['reasonablenessTests'])
        )
        
        self.validation_results['passedAll'] = all_passed
        
        logger.info(f"Validation completed. Overall status: {'PASSED' if all_passed else 'FAILED'}")
        
        return self.validation_results
    
    def clear_validation_rules(self):
        """Clear all validation rules"""
        self.range_checks.clear()
        self.consistency_checks.clear()
        self.reasonableness_tests.clear()
        self.validation_results = {
            'rangeChecks': [],
            'consistencyChecks': [],
            'reasonablenessTests': [],
            'passedAll': False,
            'timestamp': datetime.now().isoformat()
        }

# Convenience functions for common validations
def validate_csm_results(premium: float, fcf: float, ra: float, csm: float) -> Dict[str, Any]:
    """Convenience function to validate CSM calculation results"""
    engine = ValidationEngine()
    return engine.validate_csm_calculation(premium, fcf, ra, csm)

def validate_solvency_results(scr: float, mcr: float, available_capital: float) -> Dict[str, Any]:
    """Convenience function to validate Solvency II calculation results"""
    engine = ValidationEngine()
    return engine.validate_solvency_calculation(scr, mcr, available_capital)

def validate_present_value_results(cash_flows: List[float], discount_rate: float, 
                                 present_value: float) -> Dict[str, Any]:
    """Convenience function to validate present value calculation results"""
    engine = ValidationEngine()
    return engine.validate_present_value_calculation(cash_flows, discount_rate, present_value)

# Example usage and testing
if __name__ == "__main__":
    # Test CSM validation
    print("Testing CSM validation...")
    csm_results = validate_csm_results(
        premium=100000,
        fcf=80000,
        ra=10000,
        csm=10000
    )
    print(f"CSM validation results: {csm_results['passedAll']}")
    
    # Test Solvency validation
    print("\nTesting Solvency validation...")
    solvency_results = validate_solvency_results(
        scr=5000000,
        mcr=2000000,
        available_capital=8000000
    )
    print(f"Solvency validation results: {solvency_results['passedAll']}")
    
    # Test Present Value validation
    print("\nTesting Present Value validation...")
    pv_results = validate_present_value_results(
        cash_flows=[10000, 10000, 10000],
        discount_rate=0.05,
        present_value=27232.48
    )
    print(f"Present Value validation results: {pv_results['passedAll']}")
