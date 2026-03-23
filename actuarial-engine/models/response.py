"""
Pydantic models for response validation
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class PolicyResult(BaseModel):
    """Individual policy calculation result"""

    policy_id: str = Field(..., description="Policy identifier")
    csm: Optional[float] = Field(None, description="Contractual Service Margin")
    fcf: Optional[float] = Field(None, description="Fulfilment cash flows")
    pv_benefits: Optional[float] = Field(None, description="Present value of benefits")
    pv_premiums: Optional[float] = Field(None, description="Present value of premiums")
    pv_expenses: Optional[float] = Field(None, description="Present value of expenses")
    risk_adjustment: Optional[float] = Field(None, description="Risk adjustment")
    loss_component: Optional[float] = Field(None, description="Loss component")
    scr: Optional[float] = Field(None, description="Solvency Capital Requirement")
    mcr: Optional[float] = Field(None, description="Minimum Capital Requirement")


class CohortResult(BaseModel):
    """Cohort-level calculation result"""

    cohort_year: int = Field(..., description="Cohort year")
    policy_count: int = Field(..., description="Number of policies in cohort")
    total_csm: float = Field(..., description="Total CSM for cohort")
    total_premium: float = Field(..., description="Total premium for cohort")
    total_benefits: float = Field(..., description="Total benefits for cohort")


class AggregateMetrics(BaseModel):
    """Aggregate portfolio metrics"""

    total_premium: float = Field(..., description="Total portfolio premium")
    total_benefits_pv: float = Field(..., description="Total present value of benefits")
    total_expenses_pv: Optional[float] = Field(
        None, description="Total present value of expenses"
    )
    total_fcf: Optional[float] = Field(None, description="Total fulfilment cash flows")
    risk_adjustment: float = Field(..., description="Total risk adjustment")
    loss_component: float = Field(..., description="Total loss component")
    policy_count: int = Field(..., description="Total number of policies")
    onerous_count: int = Field(..., description="Number of onerous contracts")
    diversification_benefit: Optional[float] = Field(
        None, description="Diversification benefit"
    )
    own_funds: Optional[float] = Field(None, description="Available own funds")


class IFRS17Response(BaseModel):
    """Response model for IFRS 17 calculations"""

    portfolio_csm: float = Field(..., description="Total portfolio CSM")
    portfolio_fcf: Optional[float] = Field(
        None, description="Total portfolio fulfilment cash flows"
    )
    csm_by_cohort: Dict[str, float] = Field(..., description="CSM by cohort year")
    csm_release_pattern: List[float] = Field(
        ..., description="CSM release pattern over time"
    )
    policy_results: List[PolicyResult] = Field(
        ..., description="Individual policy results"
    )
    aggregate_metrics: AggregateMetrics = Field(
        ..., description="Aggregate portfolio metrics"
    )
    assumptions_used: Dict[str, Any] = Field(
        ..., description="Assumptions used in calculation"
    )
    calculation_timestamp: str = Field(..., description="Calculation timestamp")
    execution_time: Optional[float] = Field(
        None, description="Calculation execution time in seconds"
    )
    calculation_id: Optional[str] = Field(
        None, description="Unique calculation identifier"
    )


class SolvencyResponse(BaseModel):
    """Response model for Solvency II calculations"""

    scr: float = Field(..., description="Total Solvency Capital Requirement")
    mcr: float = Field(..., description="Minimum Capital Requirement")
    scr_breakdown: Dict[str, float] = Field(
        ..., description="SCR breakdown by risk category"
    )
    diversification_benefit: float = Field(..., description="Diversification benefit")
    solvency_ratio: float = Field(..., description="Solvency ratio")
    policy_results: List[PolicyResult] = Field(
        ..., description="Individual policy results"
    )
    aggregate_metrics: AggregateMetrics = Field(
        ..., description="Aggregate portfolio metrics"
    )
    assumptions_used: Dict[str, Any] = Field(
        ..., description="Assumptions used in calculation"
    )
    calculation_timestamp: str = Field(..., description="Calculation timestamp")
    execution_time: Optional[float] = Field(
        None, description="Calculation execution time in seconds"
    )
    calculation_id: Optional[str] = Field(
        None, description="Unique calculation identifier"
    )


class ErrorResponse(BaseModel):
    """Error response model"""

    error: bool = Field(True, description="Error indicator")
    message: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: str = Field(..., description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request identifier")


class ValidationError(BaseModel):
    """Validation error model"""

    field: str = Field(..., description="Field that failed validation")
    message: str = Field(..., description="Validation error message")
    value: Any = Field(..., description="Value that failed validation")


class ValidationErrorResponse(BaseModel):
    """Validation error response model"""

    error: bool = Field(True, description="Error indicator")
    message: str = Field(..., description="Error message")
    validation_errors: List[ValidationError] = Field(
        ..., description="List of validation errors"
    )
    status_code: int = Field(400, description="HTTP status code")
    timestamp: str = Field(..., description="Error timestamp")


class CalculationStatus(BaseModel):
    """Calculation status model"""

    calculation_id: str = Field(..., description="Calculation identifier")
    status: str = Field(..., description="Calculation status")
    progress: int = Field(
        ..., ge=0, le=100, description="Calculation progress percentage"
    )
    started_at: Optional[datetime] = Field(None, description="Calculation start time")
    completed_at: Optional[datetime] = Field(
        None, description="Calculation completion time"
    )
    estimated_completion: Optional[datetime] = Field(
        None, description="Estimated completion time"
    )
    error_message: Optional[str] = Field(None, description="Error message if failed")


class BatchCalculationRequest(BaseModel):
    """Request model for batch calculations"""

    calculations: List[Dict[str, Any]] = Field(
        ..., min_length=1, max_length=10, description="List of calculations"
    )
    batch_id: str = Field(..., description="Unique batch identifier")
    priority: Optional[str] = Field("normal", description="Calculation priority")


class BatchCalculationResponse(BaseModel):
    """Response model for batch calculations"""

    batch_id: str = Field(..., description="Batch identifier")
    total_calculations: int = Field(..., description="Total number of calculations")
    successful_calculations: int = Field(
        ..., description="Number of successful calculations"
    )
    failed_calculations: int = Field(..., description="Number of failed calculations")
    results: List[Dict[str, Any]] = Field(..., description="Calculation results")
    batch_status: str = Field(..., description="Overall batch status")
    completed_at: datetime = Field(..., description="Batch completion time")
