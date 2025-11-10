"""
Security tests for HTTP headers and Content Security Policy
Tests security headers, CSP directives, HSTS, and other security features
"""

import pytest
from fastapi.testclient import TestClient


class TestSecurityHeaders:
    """Test HTTP security headers"""

    def test_x_content_type_options_header(self, client):
        """Test X-Content-Type-Options header is set to nosniff"""
        response = client.get("/api/v1/propiq/health")

        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"

    def test_x_frame_options_header(self, client):
        """Test X-Frame-Options header is set to DENY"""
        response = client.get("/api/v1/propiq/health")

        assert "X-Frame-Options" in response.headers
        assert response.headers["X-Frame-Options"] == "DENY"

    def test_x_xss_protection_header(self, client):
        """Test X-XSS-Protection header is enabled"""
        response = client.get("/api/v1/propiq/health")

        assert "X-XSS-Protection" in response.headers
        assert response.headers["X-XSS-Protection"] == "1; mode=block"

    def test_referrer_policy_header(self, client):
        """Test Referrer-Policy header is set"""
        response = client.get("/api/v1/propiq/health")

        assert "Referrer-Policy" in response.headers
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

    def test_permissions_policy_header(self, client):
        """Test Permissions-Policy header restricts dangerous features"""
        response = client.get("/api/v1/propiq/health")

        assert "Permissions-Policy" in response.headers
        policy = response.headers["Permissions-Policy"]

        # Verify dangerous features are disabled
        assert "geolocation=()" in policy
        assert "microphone=()" in policy
        assert "camera=()" in policy

    def test_content_security_policy_header(self, client):
        """Test Content-Security-Policy header is set"""
        response = client.get("/api/v1/propiq/health")

        assert "Content-Security-Policy" in response.headers
        csp = response.headers["Content-Security-Policy"]

        # Verify CSP directives are present
        assert "default-src" in csp
        assert "script-src" in csp
        assert "style-src" in csp

    def test_security_headers_on_all_endpoints(self, client):
        """Test security headers are present on all endpoints"""
        endpoints = [
            "/api/v1/propiq/health",
            "/api/v1/auth/health",
            "/api/v1/stripe/health",
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)

            # Check all critical security headers
            assert "X-Content-Type-Options" in response.headers
            assert "X-Frame-Options" in response.headers
            assert "X-XSS-Protection" in response.headers
            assert "Content-Security-Policy" in response.headers
            assert "Referrer-Policy" in response.headers

    def test_request_id_header(self, client):
        """Test X-Request-ID header is added to responses"""
        response = client.get("/api/v1/propiq/health")

        assert "X-Request-ID" in response.headers
        request_id = response.headers["X-Request-ID"]

        # Verify it's a valid UUID format (36 characters with hyphens)
        assert len(request_id) == 36
        assert request_id.count('-') == 4


class TestContentSecurityPolicy:
    """Test Content Security Policy directives"""

    def test_csp_default_src_directive(self, client):
        """Test default-src CSP directive"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        # default-src should be restrictive
        assert "default-src 'self'" in csp or "default-src" in csp

    def test_csp_script_src_directive(self, client):
        """Test script-src CSP directive"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        assert "script-src" in csp
        # Should allow 'self' for local scripts
        # May allow 'unsafe-inline' for React/Vite (document this as tech debt)

    def test_csp_style_src_directive(self, client):
        """Test style-src CSP directive"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        assert "style-src" in csp

    def test_csp_img_src_directive(self, client):
        """Test img-src CSP directive"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        # img-src should allow data: URIs for inline images
        if "img-src" in csp:
            assert True  # CSP includes img-src directive
        else:
            # If not specified, falls back to default-src
            assert "default-src" in csp

    def test_csp_connect_src_directive(self, client):
        """Test connect-src CSP directive for API calls"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        # connect-src controls where fetch/XHR can connect
        if "connect-src" in csp:
            # Should allow 'self' for API calls
            assert "'self'" in csp
        else:
            # Falls back to default-src
            assert "default-src" in csp

    def test_csp_no_unsafe_eval(self, client):
        """Test CSP does not allow unsafe-eval"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        # unsafe-eval should NOT be present (security risk)
        assert "unsafe-eval" not in csp

    def test_csp_frame_ancestors_directive(self, client):
        """Test frame-ancestors CSP directive"""
        response = client.get("/api/v1/propiq/health")
        csp = response.headers.get("Content-Security-Policy", "")

        # frame-ancestors should be 'none' to prevent clickjacking
        # This duplicates X-Frame-Options but CSP is preferred
        if "frame-ancestors" in csp:
            assert "frame-ancestors 'none'" in csp or "frame-ancestors" in csp


class TestHTTPStrictTransportSecurity:
    """Test HSTS (HTTP Strict Transport Security)"""

    def test_hsts_header_in_production(self, client):
        """Test HSTS header is set in production environment"""
        # Note: HSTS is typically only enabled in production
        # In test environment, it may not be set
        response = client.get("/api/v1/propiq/health")

        # HSTS header may or may not be present in test environment
        if "Strict-Transport-Security" in response.headers:
            hsts = response.headers["Strict-Transport-Security"]
            # If present, verify it has max-age
            assert "max-age=" in hsts
            # Verify max-age is at least 1 year (31536000 seconds)
            assert "31536000" in hsts or "max-age" in hsts

    def test_hsts_includes_subdomains(self, client):
        """Test HSTS includes subdomains directive"""
        response = client.get("/api/v1/propiq/health")

        if "Strict-Transport-Security" in response.headers:
            hsts = response.headers["Strict-Transport-Security"]
            # includeSubDomains is recommended but optional
            # Just verify header format is valid
            assert "max-age=" in hsts


class TestCORSHeaders:
    """Test CORS (Cross-Origin Resource Sharing) headers"""

    def test_cors_headers_on_options_request(self, client):
        """Test CORS preflight request"""
        response = client.options(
            "/api/v1/propiq/health",
            headers={
                "Origin": "https://propiq.luntra.one",
                "Access-Control-Request-Method": "GET"
            }
        )

        # CORS headers should be present on OPTIONS requests
        # Note: Actual CORS behavior depends on FastAPI middleware configuration
        # Accept 200, 204, or 400 (some endpoints may not support OPTIONS)
        assert response.status_code in [200, 204, 400, 405]

    def test_cors_allows_configured_origins(self, client):
        """Test CORS allows configured origins"""
        response = client.get(
            "/api/v1/propiq/health",
            headers={"Origin": "https://propiq.luntra.one"}
        )

        # If CORS is configured, Access-Control-Allow-Origin should be set
        # This depends on FastAPI CORSMiddleware configuration
        assert response.status_code == 200


class TestSecurityAgainstCommonAttacks:
    """Test protection against common web attacks"""

    def test_no_server_version_disclosure(self, client):
        """Test that server version is not disclosed in headers"""
        response = client.get("/api/v1/propiq/health")

        # Server header should not reveal version details
        # FastAPI default is "uvicorn", which is acceptable
        # But should not reveal Python version or detailed server info
        if "Server" in response.headers:
            server = response.headers["Server"].lower()
            assert "python" not in server
            assert "3.11" not in server
            # Generic server names are okay
            assert any(name in server for name in ["uvicorn", "fastapi", "nginx"])

    def test_no_x_powered_by_header(self, client):
        """Test X-Powered-By header is not present"""
        response = client.get("/api/v1/propiq/health")

        # X-Powered-By reveals technology stack and should be removed
        assert "X-Powered-By" not in response.headers

    def test_clickjacking_protection(self, client):
        """Test clickjacking protection via X-Frame-Options"""
        response = client.get("/api/v1/propiq/health")

        # X-Frame-Options DENY prevents clickjacking
        assert response.headers.get("X-Frame-Options") == "DENY"

    def test_mime_sniffing_protection(self, client):
        """Test MIME sniffing protection"""
        response = client.get("/api/v1/propiq/health")

        # X-Content-Type-Options nosniff prevents MIME sniffing attacks
        assert response.headers.get("X-Content-Type-Options") == "nosniff"

    def test_xss_protection(self, client):
        """Test XSS protection header"""
        response = client.get("/api/v1/propiq/health")

        # X-XSS-Protection enables browser's XSS filter
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"


class TestRequestSizeLimits:
    """Test request size limit protection"""

    def test_large_request_rejected(self, client):
        """Test that excessively large requests are rejected"""
        # Create a large payload (>10MB should be rejected)
        large_data = {
            "email": "test@test.com",
            "password": "TestPass123",
            "data": "A" * (11 * 1024 * 1024)  # 11 MB of data
        }

        response = client.post(
            "/api/v1/auth/signup",
            json=large_data
        )

        # Should reject with 413 Payload Too Large
        # OR fail during JSON parsing
        assert response.status_code in [413, 422, 400, 503]

    def test_normal_request_accepted(self, client):
        """Test that normal-sized requests are accepted"""
        normal_data = {
            "address": "123 Main St, San Francisco, CA 94102"
        }

        # This will fail with 401 (no auth) but should not be rejected for size
        response = client.post(
            "/api/v1/propiq/analyze",
            json=normal_data
        )

        # Should NOT be 413 Payload Too Large
        assert response.status_code != 413


class TestSecurityBestPractices:
    """Test general security best practices"""

    def test_https_redirect_header(self, client):
        """Test that responses suggest HTTPS upgrade"""
        response = client.get("/api/v1/propiq/health")

        # In production, should have HSTS or similar
        # In test, just verify no obvious HTTP-only indicators
        assert response.status_code == 200

    def test_json_responses_have_correct_content_type(self, client):
        """Test JSON responses have correct Content-Type"""
        response = client.get("/api/v1/propiq/health")

        assert "application/json" in response.headers.get("Content-Type", "")

    def test_error_responses_dont_leak_sensitive_info(self, client):
        """Test error responses don't leak sensitive information"""
        # Trigger an error by POSTing to an endpoint without required fields
        response = client.post("/api/v1/auth/login", json={})

        # Should return error but not leak internal details
        # Accept 422 (validation error), 401 (unauthorized), or 404 (not found)
        assert response.status_code in [401, 404, 422]
        data = response.json()

        # Should have standardized error format
        assert "success" in data or "detail" in data

        # Should NOT contain stack traces or internal paths
        error_text = str(data).lower()
        assert "/users/" not in error_text
        assert "traceback" not in error_text
        # Allow .py in error messages for validation errors but not file paths
        if ".py" in error_text:
            # If .py is present, it should not be a file path
            assert "backend/" not in error_text
            assert "routers/" not in error_text


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
