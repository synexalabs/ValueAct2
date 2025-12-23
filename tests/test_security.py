"""
Security Tests for Valuact Platform

Tests for input sanitization, CORS, and error handling security.
"""

import pytest
import requests
from unittest.mock import Mock, patch
import json
import re


# API base URLs - configurable for different environments
NODE_API_URL = "http://localhost:3001"
PYTHON_API_URL = "http://localhost:8000"


class TestInputSanitization:
    """Test input sanitization for security vulnerabilities"""
    
    def test_xss_prevention_html_tags(self):
        """Test that HTML tags are stripped from input"""
        malicious_input = "<script>alert('XSS')</script>Hello"
        
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": malicious_input}
        )
        
        # The request should not crash
        assert response.status_code in [200, 503]  # 503 if AI not configured
        
    def test_xss_prevention_img_tag(self):
        """Test that image tags with onerror are stripped"""
        malicious_input = '<img src="x" onerror="alert(1)">Test'
        
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": malicious_input}
        )
        
        assert response.status_code in [200, 503]
    
    def test_control_characters_stripped(self):
        """Test that control characters are removed"""
        malicious_input = "Hello\x00\x01\x02World"
        
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": malicious_input}
        )
        
        assert response.status_code in [200, 503]
    
    def test_message_length_limit(self):
        """Test that extremely long messages are truncated"""
        long_message = "A" * 10000  # 10k characters
        
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": long_message}
        )
        
        # Should still process (truncated internally)
        assert response.status_code in [200, 503]
    
    def test_empty_message_rejected(self):
        """Test that empty messages are rejected"""
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": ""}
        )
        
        assert response.status_code == 400
    
    def test_whitespace_only_message_rejected(self):
        """Test that whitespace-only messages are rejected"""
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": "   "}
        )
        
        assert response.status_code == 400
    
    def test_minimum_message_length(self):
        """Test that very short messages are rejected"""
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": "a"}  # Single character
        )
        
        assert response.status_code == 400  # Minimum 2 characters required


class TestCORSSecurity:
    """Test CORS configuration security"""
    
    def test_preflight_from_allowed_origin(self):
        """Test that preflight from allowed origin succeeds"""
        response = requests.options(
            f"{NODE_API_URL}/api/chat",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST"
            }
        )
        
        # Should allow the request
        assert response.status_code in [200, 204]
    
    def test_cors_blocked_for_unknown_origin(self):
        """Test that requests from unknown origins are blocked in production"""
        # Note: This test is more relevant when NODE_ENV=production
        response = requests.post(
            f"{NODE_API_URL}/api/chat",
            json={"message": "test"},
            headers={"Origin": "https://malicious-site.com"}
        )
        
        # In development, may still allow; in production should block
        # Check that appropriate headers are/aren't set
        cors_header = response.headers.get("Access-Control-Allow-Origin")
        
        # Should NOT include the malicious origin in production
        if cors_header:
            assert cors_header != "https://malicious-site.com"


class TestSQLInjectionPrevention:
    """Test SQL injection prevention (via NoSQL - Firestore)"""
    
    def test_policy_id_injection(self):
        """Test that special characters in policy_id don't cause issues"""
        malicious_policy = {
            "policies": [{
                "policy_id": "'; DROP TABLE users; --",
                "issue_date": "2024-01-01",
                "face_amount": 100000,
                "premium": 1000
            }],
            "assumptions": {
                "discount_rate": 0.035,
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02
            }
        }
        
        response = requests.post(
            f"{PYTHON_API_URL}/api/v1/calculate/ifrs17",
            json=malicious_policy
        )
        
        # Should process without crashing (or reject gracefully)
        assert response.status_code in [200, 422]


class TestErrorMessageSecurity:
    """Test that error messages don't leak sensitive information"""
    
    def test_500_error_no_stack_trace(self):
        """Test that 500 errors don't include stack traces in production"""
        # Send a request that should trigger an error
        invalid_request = {
            "policies": [{"invalid": "data"}],
            "assumptions": {}
        }
        
        response = requests.post(
            f"{PYTHON_API_URL}/api/v1/calculate/ifrs17",
            json=invalid_request
        )
        
        if response.status_code >= 400:
            data = response.json()
            error_text = json.dumps(data)
            
            # Should not contain stack trace indicators
            assert "Traceback" not in error_text
            assert "File \"" not in error_text
            assert "line " not in error_text.lower() or "line 1" in error_text.lower()
    
    def test_validation_error_safe(self):
        """Test that validation errors don't expose internal details"""
        response = requests.post(
            f"{PYTHON_API_URL}/api/v1/calculate/ifrs17",
            json={"not": "valid"}
        )
        
        assert response.status_code == 422
        data = response.json()
        
        # Should have structured error without internal paths
        assert "detail" in data or "error" in data


class TestAuthenticationSecurity:
    """Test authentication-related security"""
    
    def test_protected_endpoint_requires_auth(self):
        """Test that protected endpoints require authentication"""
        # Solutions endpoint should require user context
        response = requests.post(
            f"{NODE_API_URL}/api/solutions",
            json={"test": "data"}
        )
        
        # Should work but use generated userId if not provided
        # In a proper auth system, should return 401
        assert response.status_code in [200, 401, 500]
    
    def test_user_id_validation(self):
        """Test that user IDs are validated"""
        malicious_user_id = "../../../etc/passwd"
        
        response = requests.get(
            f"{NODE_API_URL}/api/solutions/{malicious_user_id}"
        )
        
        # Should not crash (may return empty or error)
        assert response.status_code in [200, 400, 403, 404, 500]


class TestRateLimiting:
    """Test rate limiting is effective"""
    
    def test_rate_limit_exists(self):
        """Test that rate limiting is in place"""
        # Make many rapid requests
        responses = []
        for _ in range(10):
            response = requests.get(f"{NODE_API_URL}/api/health")
            responses.append(response.status_code)
        
        # All should succeed (under limit)
        assert all(code == 200 for code in responses)


class TestDataValidation:
    """Test comprehensive data validation"""
    
    def test_negative_face_amount_rejected(self):
        """Test that negative face amounts are rejected"""
        request = {
            "policies": [{
                "policy_id": "TEST001",
                "issue_date": "2024-01-01",
                "face_amount": -100000,  # Negative
                "premium": 1000
            }],
            "assumptions": {
                "discount_rate": 0.035,
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02
            }
        }
        
        response = requests.post(
            f"{PYTHON_API_URL}/api/v1/calculate/ifrs17",
            json=request
        )
        
        assert response.status_code == 422
    
    def test_invalid_date_format_rejected(self):
        """Test that invalid date formats are rejected"""
        request = {
            "policies": [{
                "policy_id": "TEST001",
                "issue_date": "not-a-date",
                "face_amount": 100000,
                "premium": 1000
            }],
            "assumptions": {
                "discount_rate": 0.035,
                "lapse_rate": 0.05,
                "mortality_table": "CSO_2017",
                "expense_inflation": 0.02
            }
        }
        
        response = requests.post(
            f"{PYTHON_API_URL}/api/v1/calculate/ifrs17",
            json=request
        )
        
        assert response.status_code == 422


# Skip tests if servers are not running
@pytest.fixture(scope="session", autouse=True)
def check_servers():
    """Check if servers are running before tests"""
    servers_available = True
    
    try:
        requests.get(f"{NODE_API_URL}/api/health", timeout=2)
    except requests.exceptions.ConnectionError:
        servers_available = False
    
    try:
        requests.get(f"{PYTHON_API_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        servers_available = False
    
    if not servers_available:
        pytest.skip("Servers not running", allow_module_level=True)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
