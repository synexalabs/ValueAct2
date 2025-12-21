"""
Actuarial Test Suite for Valuact Platform
Comprehensive tests for IFRS 17, Solvency II, and Pricing calculations
"""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import sys
import os

# Add the actuarial engine to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'actuarial-engine'))

from actuarial_engine.calculations.ifrs17 import calculate_portfolio_csm, calculate_pv_benefits_proper, calculate_pv_premiums_proper
from actuarial_engine.calculations.solvency import calculate_portfolio_scr, calculate_market_risk_scr
from actuarial_engine.data.mortality_tables import get_mortality_rate, get_survival_probability
from actuarial_engine.utils.actuarial import calculate_annuity_factor

class TestMortalityTables:
    """Test mortality table functionality"""
    
    def test_get_mortality_rate(self):
        """Test mortality rate retrieval"""
        # Test basic mortality rate
        rate = get_mortality_rate("CSO_2017", 35, "male")
        assert isinstance(rate, float)
        assert 0 <= rate <= 1
        
        # Test gender-specific rates
        male_rate = get_mortality_rate("CSO_2017", 35, "male")
        female_rate = get_mortality_rate("CSO_2017", 35, "female")
        assert male_rate != female_rate
        
        # Test select period
        select_rate = get_mortality_rate("CSO_2017", 35, "male", duration=5)
        ultimate_rate = get_mortality_rate("CSO_2017", 35, "male", duration=20)
        assert select_rate < ultimate_rate  # Select rates should be lower
    
    def test_survival_probability(self):
        """Test survival probability calculation"""
        # Test 1-year survival
        prob_1 = get_survival_probability("CSO_2017", 35, 1, "male")
        assert 0 < prob_1 < 1
        
        # Test 10-year survival
        prob_10 = get_survival_probability("CSO_2017", 35, 10, "male")
        assert 0 < prob_10 < 1
        assert prob_10 < prob_1  # Longer term should have lower survival probability
        
        # Test gender differences
        male_prob = get_survival_probability("CSO_2017", 35, 10, "male")
        female_prob = get_survival_probability("CSO_2017", 35, 10, "female")
        assert male_prob != female_prob

class TestIFRS17Calculations:
    """Test IFRS 17 CSM calculations"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_policies = [
            {
                "policy_id": "TEST001",
                "issue_date": "2024-01-01",
                "face_amount": 100000,
                "premium": 1000,
                "policy_type": "term_life",
                "gender": "male",
                "issue_age": 35,
                "policy_term": 20
            },
            {
                "policy_id": "TEST002", 
                "issue_date": "2024-01-01",
                "face_amount": 200000,
                "premium": 2000,
                "policy_type": "term_life",
                "gender": "female",
                "issue_age": 30,
                "policy_term": 25
            }
        ]
        
        self.test_assumptions = {
            "discount_rate": 0.035,
            "lapse_rate": 0.05,
            "mortality_table": "CSO_2017",
            "expense_inflation": 0.02,
            "risk_adjustment_factor": 0.02,
            "expense_loading": 0.05,
            "confidence_level": 0.75
        }
    
    def test_pv_benefits_calculation(self):
        """Test present value of benefits calculation"""
        policy = pd.Series(self.test_policies[0])
        mortality_table = {"id": "CSO_2017", "gender": "male"}
        
        pv_benefits = calculate_pv_benefits_proper(policy, self.test_assumptions, mortality_table)
        
        assert isinstance(pv_benefits, float)
        assert pv_benefits > 0
        assert pv_benefits < policy['face_amount']  # PV should be less than face amount
    
    def test_pv_premiums_calculation(self):
        """Test present value of premiums calculation"""
        policy = pd.Series(self.test_policies[0])
        mortality_table = {"id": "CSO_2017", "gender": "male"}
        
        pv_premiums = calculate_pv_premiums_proper(policy, self.test_assumptions, mortality_table)
        
        assert isinstance(pv_premiums, float)
        assert pv_premiums > 0
        assert pv_premiums < policy['premium'] * policy['policy_term']  # PV should be less than total premiums
    
    def test_portfolio_csm_calculation(self):
        """Test portfolio CSM calculation"""
        result = calculate_portfolio_csm(self.test_policies, self.test_assumptions)
        
        # Check required fields
        assert 'portfolio_csm' in result
        assert 'portfolio_fcf' in result
        assert 'csm_by_cohort' in result
        assert 'policy_results' in result
        assert 'aggregate_metrics' in result
        assert 'methodology_version' in result
        
        # Check data types
        assert isinstance(result['portfolio_csm'], float)
        assert isinstance(result['portfolio_fcf'], float)
        assert isinstance(result['csm_by_cohort'], dict)
        assert isinstance(result['policy_results'], list)
        
        # Check CSM is non-negative
        assert result['portfolio_csm'] >= 0
        
        # Check policy results
        assert len(result['policy_results']) == len(self.test_policies)
        for policy_result in result['policy_results']:
            assert 'policy_id' in policy_result
            assert 'csm' in policy_result
            assert 'fcf' in policy_result
            assert policy_result['csm'] >= 0
    
    def test_csm_sensitivity(self):
        """Test CSM sensitivity to assumption changes"""
        base_csm = calculate_portfolio_csm(self.test_policies, self.test_assumptions)['portfolio_csm']
        
        # Test discount rate sensitivity
        high_discount_assumptions = self.test_assumptions.copy()
        high_discount_assumptions['discount_rate'] = 0.05
        high_discount_csm = calculate_portfolio_csm(self.test_policies, high_discount_assumptions)['portfolio_csm']
        
        # Higher discount rate should generally reduce CSM (all else equal)
        assert high_discount_csm != base_csm

class TestSolvencyIICalculations:
    """Test Solvency II SCR calculations"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_policies = [
            {
                "policy_id": "SOLV001",
                "issue_date": "2024-01-01", 
                "face_amount": 100000,
                "premium": 1000,
                "policy_type": "term_life",
                "gender": "male",
                "issue_age": 35,
                "policy_term": 20
            }
        ]
        
        self.test_assumptions = {
            "confidence_level": 0.995,
            "time_horizon": 1,
            "market_risk_factor": 0.25,
            "credit_risk_factor": 0.15,
            "underwriting_risk_factor": 0.20,
            "operational_risk_factor": 0.10,
            "interest_rate_shock": 0.01,
            "equity_shock": 0.39,
            "mortality_shock": 0.15,
            "own_funds": 50000
        }
    
    def test_market_risk_scr(self):
        """Test market risk SCR calculation"""
        df = pd.DataFrame(self.test_policies)
        market_scr = calculate_market_risk_scr(df, self.test_assumptions)
        
        assert isinstance(market_scr, float)
        assert market_scr > 0
    
    def test_portfolio_scr_calculation(self):
        """Test portfolio SCR calculation"""
        result = calculate_portfolio_scr(self.test_policies, self.test_assumptions)
        
        # Check required fields
        assert 'scr' in result
        assert 'mcr' in result
        assert 'scr_breakdown' in result
        assert 'diversification_benefit' in result
        assert 'solvency_ratio' in result
        assert 'methodology_version' in result
        
        # Check data types
        assert isinstance(result['scr'], float)
        assert isinstance(result['mcr'], float)
        assert isinstance(result['scr_breakdown'], dict)
        assert isinstance(result['diversification_benefit'], float)
        assert isinstance(result['solvency_ratio'], float)
        
        # Check SCR is positive
        assert result['scr'] > 0
        assert result['mcr'] > 0
        
        # Check diversification benefit
        assert result['diversification_benefit'] >= 0
        
        # Check solvency ratio
        assert result['solvency_ratio'] > 0
    
    def test_scr_breakdown(self):
        """Test SCR breakdown by risk category"""
        result = calculate_portfolio_scr(self.test_policies, self.test_assumptions)
        
        breakdown = result['scr_breakdown']
        required_risks = [
            'market_risk', 'counterparty_risk', 'life_underwriting_risk',
            'health_underwriting_risk', 'non_life_underwriting_risk', 'operational_risk'
        ]
        
        for risk in required_risks:
            assert risk in breakdown
            assert isinstance(breakdown[risk], float)
            assert breakdown[risk] >= 0

class TestPricingCalculations:
    """Test pricing calculations"""
    
    def test_annuity_factor_calculation(self):
        """Test annuity factor calculation"""
        mortality_table = {"id": "CSO_2017", "gender": "male"}
        
        # Test term annuity
        factor_10 = calculate_annuity_factor(35, mortality_table, 0.035, term=10)
        assert isinstance(factor_10, float)
        assert factor_10 > 0
        
        # Test whole life annuity
        factor_whole = calculate_annuity_factor(35, mortality_table, 0.035)
        assert isinstance(factor_whole, float)
        assert factor_whole > factor_10  # Whole life should be higher than term
        
        # Test age sensitivity
        factor_45 = calculate_annuity_factor(45, mortality_table, 0.035, term=10)
        assert factor_45 != factor_10  # Different ages should give different factors

class TestDataValidation:
    """Test data validation functionality"""
    
    def test_policy_data_validation(self):
        """Test policy data validation"""
        from actuarial_engine.models.request import PolicyData, validate_policy_data
        
        # Valid policy
        valid_policy = {
            "policy_id": "VALID001",
            "issue_date": "2024-01-01",
            "face_amount": 100000,
            "premium": 1000,
            "issue_age": 35,
            "gender": "male"
        }
        
        validation = validate_policy_data(valid_policy)
        assert validation["is_valid"] == True
        assert len(validation["errors"]) == 0
        
        # Invalid policy - missing required field
        invalid_policy = {
            "policy_id": "INVALID001",
            "issue_date": "2024-01-01",
            # Missing face_amount
            "premium": 1000
        }
        
        validation = validate_policy_data(invalid_policy)
        assert validation["is_valid"] == False
        assert len(validation["errors"]) > 0
        
        # Invalid policy - negative face amount
        invalid_policy2 = {
            "policy_id": "INVALID002",
            "issue_date": "2024-01-01",
            "face_amount": -1000,  # Negative amount
            "premium": 1000
        }
        
        validation = validate_policy_data(invalid_policy2)
        assert validation["is_valid"] == False
        assert any("face_amount must be positive" in error for error in validation["errors"])

class TestActuarialConsistency:
    """Test actuarial consistency across modules"""
    
    def test_mortality_consistency(self):
        """Test mortality table consistency between modules"""
        # Test that mortality rates are consistent
        rate_python = get_mortality_rate("CSO_2017", 35, "male")
        
        # This would test JavaScript consistency if we had a way to call it
        # For now, just verify the Python implementation works
        assert isinstance(rate_python, float)
        assert 0 < rate_python < 1
    
    def test_discount_rate_consistency(self):
        """Test discount rate usage consistency"""
        # Test that discount rates are applied consistently
        test_rate = 0.035
        
        # Test present value calculation
        cash_flows = [1000, 1000, 1000]
        periods = [1, 2, 3]
        
        from actuarial_engine.utils.actuarial import calculate_present_value
        pv = calculate_present_value(cash_flows, test_rate, periods)
        
        # Manual calculation for verification
        manual_pv = sum(cf / (1 + test_rate) ** period for cf, period in zip(cash_flows, periods))
        
        assert abs(pv - manual_pv) < 1e-10  # Should be identical

class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_zero_premium_policy(self):
        """Test policy with zero premium"""
        zero_premium_policy = [{
            "policy_id": "ZERO001",
            "issue_date": "2024-01-01",
            "face_amount": 100000,
            "premium": 0,  # Zero premium
            "policy_type": "term_life",
            "gender": "male",
            "issue_age": 35,
            "policy_term": 20
        }]
        
        assumptions = {
            "discount_rate": 0.035,
            "lapse_rate": 0.05,
            "mortality_table": "CSO_2017",
            "expense_inflation": 0.02,
            "risk_adjustment_factor": 0.02,
            "expense_loading": 0.05,
            "confidence_level": 0.75
        }
        
        result = calculate_portfolio_csm(zero_premium_policy, assumptions)
        
        # Should handle zero premium gracefully
        assert isinstance(result['portfolio_csm'], float)
        assert result['portfolio_csm'] >= 0
    
    def test_very_high_age(self):
        """Test policy with very high issue age"""
        high_age_policy = [{
            "policy_id": "HIGHAGE001",
            "issue_date": "2024-01-01",
            "face_amount": 100000,
            "premium": 1000,
            "policy_type": "term_life",
            "gender": "male",
            "issue_age": 90,  # Very high age
            "policy_term": 10
        }]
        
        assumptions = {
            "discount_rate": 0.035,
            "lapse_rate": 0.05,
            "mortality_table": "CSO_2017",
            "expense_inflation": 0.02,
            "risk_adjustment_factor": 0.02,
            "expense_loading": 0.05,
            "confidence_level": 0.75
        }
        
        result = calculate_portfolio_csm(high_age_policy, assumptions)
        
        # Should handle high age gracefully
        assert isinstance(result['portfolio_csm'], float)
        assert result['portfolio_csm'] >= 0

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
