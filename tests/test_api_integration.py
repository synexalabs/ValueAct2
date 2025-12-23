"""
API Integration Tests for Valuact Platform

Tests for IFRS 17 and Solvency II calculation endpoints.
"""

import pytest
import requests
from unittest.mock import Mock, patch
import json

# API base URL - configurable for different environments
API_BASE_URL = "http://localhost:8000"


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_root_endpoint(self):
        """Test root health check returns healthy status"""
        response = requests.get(f"{API_BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
    
    def test_health_endpoint(self):
        """Test detailed health check endpoint"""
        response = requests.get(f"{API_BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "environment" in data


class TestIFRS17Endpoint:
    """Test IFRS 17 calculation endpoint"""
    
    @pytest.fixture
    def valid_request(self):
        """Valid IFRS 17 request payload"""
        return {
            "policies": [
                {
                    "policy_id": "TEST001",
                    "issue_date": "2024-01-01",
                    "face_amount": 100000,
                    "premium": 1000,
                    "policy_type": "term_life",
                    "gender": "M",
                    "issue_age": 35,
                    "policy_term": 20
                }
            ],
            "assumptions": {
                "discount_rate": 0.035,
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02,
                "risk_adjustment_factor": 0.02,
                "expense_loading": 0.05
            }
        }
    
    def test_calculate_ifrs17_success(self, valid_request):
        """Test successful IFRS 17 calculation"""
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            json=valid_request
        )
        
        # Should return 200 OK
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields in response
        assert "portfolio_csm" in data
        assert "portfolio_fcf" in data
        assert "policy_results" in data
        assert "aggregate_metrics" in data
        
        # Check CSM is non-negative
        assert data["portfolio_csm"] >= 0
        
        # Check policy results match input
        assert len(data["policy_results"]) == 1
        assert data["policy_results"][0]["policy_id"] == "TEST001"
    
    def test_calculate_ifrs17_missing_policies(self):
        """Test validation error for missing policies"""
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            json={"assumptions": {"discount_rate": 0.035}}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_calculate_ifrs17_invalid_discount_rate(self):
        """Test validation error for invalid discount rate"""
        invalid_request = {
            "policies": [{
                "policy_id": "TEST001",
                "issue_date": "2024-01-01",
                "face_amount": 100000,
                "premium": 1000
            }],
            "assumptions": {
                "discount_rate": 1.5,  # Invalid - should be 0-1
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02
            }
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            json=invalid_request
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_calculate_ifrs17_multiple_policies(self, valid_request):
        """Test calculation with multiple policies"""
        valid_request["policies"].append({
            "policy_id": "TEST002",
            "issue_date": "2024-01-01",
            "face_amount": 200000,
            "premium": 2000,
            "policy_type": "term_life",
            "gender": "F",
            "issue_age": 30,
            "policy_term": 25
        })
        
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            json=valid_request
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["policy_results"]) == 2


class TestSolvencyEndpoint:
    """Test Solvency II calculation endpoint"""
    
    @pytest.fixture
    def valid_request(self):
        """Valid Solvency II request payload"""
        return {
            "policies": [
                {
                    "policy_id": "SOLV001",
                    "issue_date": "2024-01-01",
                    "face_amount": 100000,
                    "premium": 1000,
                    "policy_type": "term_life",
                    "gender": "M",
                    "issue_age": 35,
                    "policy_term": 20
                }
            ],
            "assumptions": {
                "confidence_level": 0.995,
                "time_horizon": 1,
                "market_risk_factor": 0.25,
                "credit_risk_factor": 0.15,
                "underwriting_risk_factor": 0.20,
                "operational_risk_factor": 0.10
            }
        }
    
    def test_calculate_solvency_success(self, valid_request):
        """Test successful Solvency II calculation"""
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/solvency",
            json=valid_request
        )
        
        # Should return 200 OK
        assert response.status_code == 200
        
        data = response.json()
        
        # Check required fields in response
        assert "scr" in data
        assert "mcr" in data
        assert "scr_breakdown" in data
        assert "diversification_benefit" in data
        assert "solvency_ratio" in data
        
        # Check SCR is positive
        assert data["scr"] > 0
        assert data["mcr"] > 0
        
        # Check breakdown includes required risks
        breakdown = data["scr_breakdown"]
        assert "market_risk" in breakdown
        assert "life_underwriting_risk" in breakdown
        assert "operational_risk" in breakdown


class TestMortalityTablesEndpoint:
    """Test mortality tables endpoint"""
    
    def test_get_mortality_tables(self):
        """Test retrieving available mortality tables"""
        response = requests.get(f"{API_BASE_URL}/api/v1/mortality-tables")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "mortality_tables" in data
        tables = data["mortality_tables"]
        
        # Check expected tables are present
        table_ids = [t["id"] for t in tables]
        assert "CSO_2017" in table_ids
        assert "CSO_2001" in table_ids


class TestErrorHandling:
    """Test error handling across endpoints"""
    
    def test_invalid_endpoint_returns_404(self):
        """Test that invalid endpoints return 404"""
        response = requests.get(f"{API_BASE_URL}/api/v1/nonexistent")
        assert response.status_code == 404
    
    def test_malformed_json_returns_422(self):
        """Test that malformed JSON returns validation error"""
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            data="not valid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestPerformance:
    """Test performance characteristics"""
    
    def test_single_policy_response_time(self):
        """Test that single policy calculation completes quickly"""
        import time
        
        request = {
            "policies": [{
                "policy_id": "PERF001",
                "issue_date": "2024-01-01",
                "face_amount": 100000,
                "premium": 1000,
                "policy_type": "term_life",
                "gender": "M",
                "issue_age": 35,
                "policy_term": 20
            }],
            "assumptions": {
                "discount_rate": 0.035,
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02
            }
        }
        
        start = time.time()
        response = requests.post(
            f"{API_BASE_URL}/api/v1/calculate/ifrs17",
            json=request
        )
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 5.0  # Should complete within 5 seconds


# Skip tests if server is not running
def pytest_configure(config):
    """Check if server is running before tests"""
    try:
        requests.get(f"{API_BASE_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        pytest.skip("API server not running", allow_module_level=True)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
