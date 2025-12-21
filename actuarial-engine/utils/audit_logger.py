"""
Audit Logger for Actuarial Calculations
Provides comprehensive logging and audit trail functionality
"""

import logging
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import traceback

@dataclass
class CalculationStep:
    """Represents a single calculation step"""
    step_number: int
    description: str
    formula: Optional[str] = None
    inputs: Optional[Dict[str, Any]] = None
    output: Optional[Any] = None
    unit: Optional[str] = None
    explanation: Optional[str] = None
    timestamp: Optional[datetime] = None
    status: str = 'completed'
    warnings: Optional[List[str]] = None
    validation: Optional[Dict[str, Any]] = None

@dataclass
class IntermediateResult:
    """Represents an intermediate calculation result"""
    name: str
    value: Any
    unit: Optional[str] = None
    description: Optional[str] = None
    timestamp: Optional[datetime] = None

@dataclass
class FormulaUsed:
    """Represents a formula used in calculation"""
    formula_id: str
    version: str
    name: str
    latex: str
    used_at: Optional[datetime] = None

@dataclass
class AssumptionUsed:
    """Represents an assumption used in calculation"""
    name: str
    value: Any
    source: str
    justification: Optional[str] = None
    used_at: Optional[datetime] = None

@dataclass
class ValidationResult:
    """Represents a validation check result"""
    check_name: str
    type: str  # "range", "consistency", "reasonableness"
    passed: bool
    message: Optional[str] = None
    severity: str = 'info'  # "error", "warning", "info"
    timestamp: Optional[datetime] = None

@dataclass
class ExecutionLog:
    """Represents an execution log entry"""
    level: str  # "info", "debug", "warning", "error"
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

class AuditLogger:
    """Comprehensive audit logger for actuarial calculations"""
    
    def __init__(self, calculation_id: str, methodology_version: str = "1.0.0"):
        self.calculation_id = calculation_id
        self.methodology_version = methodology_version
        self.start_time = datetime.now()
        
        # Audit trail components
        self.calculation_inputs: Dict[str, Any] = {}
        self.calculation_steps: List[CalculationStep] = []
        self.intermediate_results: List[IntermediateResult] = []
        self.formulas_used: List[FormulaUsed] = []
        self.assumptions_used: List[AssumptionUsed] = []
        self.validation_results: List[ValidationResult] = []
        self.warnings: List[str] = []
        self.execution_log: List[ExecutionLog] = []
        
        # Setup logging
        self.logger = logging.getLogger(f"audit_{calculation_id}")
        self.logger.setLevel(logging.INFO)
        
        # Add execution log entry for start
        self.add_execution_log("info", f"Calculation started: {calculation_id}")
    
    def set_calculation_inputs(self, inputs: Dict[str, Any]) -> None:
        """Set the complete calculation inputs snapshot"""
        self.calculation_inputs = inputs.copy()
        self.calculation_inputs['timestamp'] = datetime.now()
        self.add_execution_log("info", "Calculation inputs captured")
    
    def add_calculation_step(self, 
                           description: str,
                           formula: Optional[str] = None,
                           inputs: Optional[Dict[str, Any]] = None,
                           output: Optional[Any] = None,
                           unit: Optional[str] = None,
                           explanation: Optional[str] = None,
                           status: str = 'completed',
                           warnings: Optional[List[str]] = None,
                           validation: Optional[Dict[str, Any]] = None) -> None:
        """Add a calculation step to the audit trail"""
        step = CalculationStep(
            step_number=len(self.calculation_steps) + 1,
            description=description,
            formula=formula,
            inputs=inputs,
            output=output,
            unit=unit,
            explanation=explanation,
            timestamp=datetime.now(),
            status=status,
            warnings=warnings,
            validation=validation
        )
        self.calculation_steps.append(step)
        self.add_execution_log("info", f"Step {step.step_number}: {description}")
    
    def add_intermediate_result(self,
                              name: str,
                              value: Any,
                              unit: Optional[str] = None,
                              description: Optional[str] = None) -> None:
        """Add an intermediate result to the audit trail"""
        result = IntermediateResult(
            name=name,
            value=value,
            unit=unit,
            description=description,
            timestamp=datetime.now()
        )
        self.intermediate_results.append(result)
        self.add_execution_log("debug", f"Intermediate result: {name} = {value}")
    
    def add_formula_used(self,
                        formula_id: str,
                        version: str,
                        name: str,
                        latex: str) -> None:
        """Add a formula used in the calculation"""
        formula = FormulaUsed(
            formula_id=formula_id,
            version=version,
            name=name,
            latex=latex,
            used_at=datetime.now()
        )
        self.formulas_used.append(formula)
        self.add_execution_log("info", f"Formula used: {name} (v{version})")
    
    def add_assumption_used(self,
                           name: str,
                           value: Any,
                           source: str,
                           justification: Optional[str] = None) -> None:
        """Add an assumption used in the calculation"""
        assumption = AssumptionUsed(
            name=name,
            value=value,
            source=source,
            justification=justification,
            used_at=datetime.now()
        )
        self.assumptions_used.append(assumption)
        self.add_execution_log("info", f"Assumption used: {name} = {value} (source: {source})")
    
    def add_validation_result(self,
                            check_name: str,
                            check_type: str,
                            passed: bool,
                            message: Optional[str] = None,
                            severity: str = 'info') -> None:
        """Add a validation result to the audit trail"""
        validation = ValidationResult(
            check_name=check_name,
            type=check_type,
            passed=passed,
            message=message,
            severity=severity,
            timestamp=datetime.now()
        )
        self.validation_results.append(validation)
        
        level = "warning" if not passed and severity == "warning" else "error" if not passed else "info"
        self.add_execution_log(level, f"Validation {check_name}: {'PASSED' if passed else 'FAILED'}")
    
    def add_warning(self, warning: str, category: str = 'general') -> None:
        """Add a warning to the audit trail"""
        self.warnings.append(f"[{category}] {warning}")
        self.add_execution_log("warning", warning)
    
    def add_execution_log(self, level: str, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Add an execution log entry"""
        log_entry = ExecutionLog(
            level=level,
            message=message,
            data=data,
            timestamp=datetime.now()
        )
        self.execution_log.append(log_entry)
        
        # Also log to standard logger
        getattr(self.logger, level)(message)
    
    def log_exception(self, exception: Exception, context: str = "") -> None:
        """Log an exception with full traceback"""
        error_message = f"Exception in {context}: {str(exception)}"
        self.add_execution_log("error", error_message, {
            "exception_type": type(exception).__name__,
            "traceback": traceback.format_exc()
        })
    
    def get_audit_trail(self) -> Dict[str, Any]:
        """Get the complete audit trail"""
        return {
            "calculationInputs": self.calculation_inputs,
            "calculationSteps": [asdict(step) for step in self.calculation_steps],
            "intermediateResults": [asdict(result) for result in self.intermediate_results],
            "methodologyVersion": self.methodology_version,
            "formulasUsed": [asdict(formula) for formula in self.formulas_used],
            "assumptionsUsed": [asdict(assumption) for assumption in self.assumptions_used],
            "validationResults": [asdict(validation) for validation in self.validation_results],
            "warnings": self.warnings,
            "executionLog": [asdict(log) for log in self.execution_log]
        }
    
    def get_validation_summary(self) -> Dict[str, Any]:
        """Get validation summary"""
        range_checks = [v for v in self.validation_results if v.type == "range"]
        consistency_checks = [v for v in self.validation_results if v.type == "consistency"]
        reasonableness_tests = [v for v in self.validation_results if v.type == "reasonableness"]
        
        return {
            "rangeChecks": [asdict(check) for check in range_checks],
            "consistencyChecks": [asdict(check) for check in consistency_checks],
            "reasonablenessTests": [asdict(test) for test in reasonableness_tests],
            "passedAll": all(v.passed for v in self.validation_results)
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Get audit trail summary"""
        return {
            "totalSteps": len(self.calculation_steps),
            "totalIntermediateResults": len(self.intermediate_results),
            "totalFormulasUsed": len(self.formulas_used),
            "totalAssumptionsUsed": len(self.assumptions_used),
            "totalValidationResults": len(self.validation_results),
            "totalWarnings": len(self.warnings),
            "methodologyVersion": self.methodology_version,
            "hasValidationIssues": not all(v.passed for v in self.validation_results),
            "executionTime": (datetime.now() - self.start_time).total_seconds(),
            "validationSummary": self.get_validation_summary()
        }
    
    def finish_calculation(self) -> None:
        """Finish the calculation and log completion"""
        execution_time = (datetime.now() - self.start_time).total_seconds()
        self.add_execution_log("info", f"Calculation completed in {execution_time:.2f} seconds")
    
    def export_to_json(self) -> str:
        """Export audit trail to JSON string"""
        audit_data = {
            "calculationId": self.calculation_id,
            "methodologyVersion": self.methodology_version,
            "startTime": self.start_time.isoformat(),
            "endTime": datetime.now().isoformat(),
            "auditTrail": self.get_audit_trail(),
            "resultValidation": self.get_validation_summary(),
            "summary": self.get_summary()
        }
        return json.dumps(audit_data, indent=2, default=str)

# Context manager for audit logging
class AuditContext:
    """Context manager for audit logging"""
    
    def __init__(self, calculation_id: str, methodology_version: str = "1.0.0"):
        self.audit_logger = AuditLogger(calculation_id, methodology_version)
    
    def __enter__(self):
        return self.audit_logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.audit_logger.log_exception(exc_val, "calculation")
        self.audit_logger.finish_calculation()

# Utility functions for common validation checks
def validate_range(value: float, min_value: float, max_value: float, variable_name: str) -> bool:
    """Validate that a value is within a specified range"""
    return min_value <= value <= max_value

def validate_non_negative(value: float, variable_name: str) -> bool:
    """Validate that a value is non-negative"""
    return value >= 0

def validate_positive(value: float, variable_name: str) -> bool:
    """Validate that a value is positive"""
    return value > 0

def validate_probability(value: float, variable_name: str) -> bool:
    """Validate that a value is a valid probability (0 to 1)"""
    return 0 <= value <= 1

def validate_percentage(value: float, variable_name: str) -> bool:
    """Validate that a value is a valid percentage (0 to 100)"""
    return 0 <= value <= 100
