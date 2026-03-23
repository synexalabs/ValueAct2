"""
Pydantic models for request validation
Migrated to Pydantic V2 style validators
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import re


class PolicyData(BaseModel):
    """Individual policy data model"""
    policy_id: str = Field(..., description="Unique policy identifier")
    issue_date: str = Field(..., description="Policy issue date (ISO format)")
    maturity_date: Optional[str] = Field(None, description="Policy maturity date (ISO format)")
    face_amount: float = Field(..., gt=0, description="Policy face amount")
    premium: float = Field(..., ge=0, description="Policy premium")
    policy_type: Optional[str] = Field(None, description="Type of policy")
    gender: Optional[str] = Field(None, description="Policyholder gender")
    issue_age: Optional[int] = Field(None, ge=0, le=120, description="Issue age")
    sum_assured: Optional[float] = Field(None, ge=0, description="Sum assured")
    premium_term: Optional[int] = Field(None, ge=0, description="Premium payment term")
    participation_factor: Optional[float] = Field(None, ge=0, le=1, description="Insurer's share of underlying items (VFA)")
    
    @field_validator('policy_id')
    @classmethod
    def validate_policy_id(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError('Policy ID cannot be empty')
        return v.strip()
    
    @field_validator('issue_date')
    @classmethod
    def validate_issue_date(cls, v: str) -> str:
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DD)')
        return v
    
    @field_validator('maturity_date')
    @classmethod
    def validate_maturity_date(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DD)')
        return v
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.upper()
            if v not in ['M', 'F', 'MALE', 'FEMALE']:
                raise ValueError('Gender must be M, F, MALE, or FEMALE')
        return v


class IFRS17Assumptions(BaseModel):
    """IFRS 17 calculation assumptions"""
    discount_rate: float = Field(..., ge=0, le=1, description="Discount rate (0-1)")
    lapse_rate: float = Field(..., ge=0, le=1, description="Lapse rate (0-1)")
    mortality_table: str = Field(..., description="Mortality table identifier")
    expense_inflation: float = Field(..., ge=0, le=0.1, description="Expense inflation rate (0-0.1)")
    risk_adjustment_factor: Optional[float] = Field(0.02, ge=0, le=0.1, description="Risk adjustment factor")
    expense_loading: Optional[float] = Field(0.05, ge=0, le=0.2, description="Expense loading factor")
    tax_rate: Optional[float] = Field(0.25, ge=0, le=0.5, description="Tax rate")
    use_dynamic_lapse: Optional[bool] = Field(True, description="Use dynamic duration-based lapse rates")
    locked_in_rates: Optional[Dict[str, float]] = Field(None, description="Historical locked-in rates by cohort year")
    
    @field_validator('mortality_table')
    @classmethod
    def validate_mortality_table(cls, v: str) -> str:
        # Support German DAV tables (including gender-specific/unisex aliases) and legacy tables
        v_upper = v.upper()
        is_dav = v_upper.startswith('DAV_')
        is_legacy = v_upper in ['CSO_2017', 'CSO_2001', 'GAM_1994']
        
        if not (is_dav or is_legacy):
            raise ValueError(f'Mortality table "{v}" is not supported. Use a DAV table (e.g., DAV_2008_T) or CSO_2017.')
        return v


class SolvencyAssumptions(BaseModel):
    """Solvency II calculation assumptions"""
    confidence_level: float = Field(..., ge=0.95, le=0.999, description="Confidence level (0.95-0.999)")
    time_horizon: int = Field(..., ge=1, le=10, description="Time horizon in years")
    market_risk_factor: float = Field(..., ge=0, le=1, description="Market risk factor")
    credit_risk_factor: float = Field(..., ge=0, le=1, description="Credit risk factor")
    underwriting_risk_factor: float = Field(..., ge=0, le=1, description="Underwriting risk factor")
    operational_risk_factor: float = Field(..., ge=0, le=1, description="Operational risk factor")
    diversification_benefit: Optional[float] = Field(0.15, ge=0, le=0.5, description="Diversification benefit")
    # New fields for equity symmetric adjustment
    current_equity_index: Optional[float] = Field(None, description="Current equity index level")
    reference_equity_index: Optional[float] = Field(None, description="3-year reference equity index level")
    equity_type: Optional[str] = Field("type_1", description="Equity type for shock calculation")
    
    @field_validator('confidence_level')
    @classmethod
    def validate_confidence_level(cls, v: float) -> float:
        if v < 0.95 or v > 0.999:
            raise ValueError('Confidence level must be between 0.95 and 0.999')
        return v


class IFRS17Request(BaseModel):
    """Request model for IFRS 17 calculations"""
    policies: List[PolicyData] = Field(..., min_length=1, description="List of policies")
    assumptions: IFRS17Assumptions = Field(..., description="Calculation assumptions")
    
    @field_validator('policies')
    @classmethod
    def validate_policies(cls, v: List[PolicyData]) -> List[PolicyData]:
        if len(v) == 0:
            raise ValueError('At least one policy is required')
        
        # Check for duplicate policy IDs
        policy_ids = [policy.policy_id for policy in v]
        if len(policy_ids) != len(set(policy_ids)):
            raise ValueError('Duplicate policy IDs found')
        
        # Check portfolio size limits
        if len(v) > 100000:
            raise ValueError('Portfolio size exceeds maximum limit of 100,000 policies')
        
        return v


class SolvencyRequest(BaseModel):
    """Request model for Solvency II calculations"""
    policies: List[PolicyData] = Field(..., min_length=1, description="List of policies")
    assumptions: SolvencyAssumptions = Field(..., description="Calculation assumptions")
    
    @field_validator('policies')
    @classmethod
    def validate_policies(cls, v: List[PolicyData]) -> List[PolicyData]:
        if len(v) == 0:
            raise ValueError('At least one policy is required')
        
        # Check for duplicate policy IDs
        policy_ids = [policy.policy_id for policy in v]
        if len(policy_ids) != len(set(policy_ids)):
            raise ValueError('Duplicate policy IDs found')
        
        # Check portfolio size limits
        if len(v) > 100000:
            raise ValueError('Portfolio size exceeds maximum limit of 100,000 policies')
        
        return v


class CalculationMetadata(BaseModel):
    """Metadata for calculation requests"""
    request_id: Optional[str] = Field(None, description="Unique request identifier")
    user_id: Optional[str] = Field(None, description="User identifier")
    calculation_type: str = Field(..., description="Type of calculation")
    timestamp: Optional[datetime] = Field(None, description="Request timestamp")
    version: Optional[str] = Field("1.0", description="Calculation engine version")
    
    @field_validator('calculation_type')
    @classmethod
    def validate_calculation_type(cls, v: str) -> str:
        valid_types = ['IFRS17', 'SOLVENCY', 'PRICING']
        if v not in valid_types:
            raise ValueError(f'Calculation type must be one of: {valid_types}')
        return v
