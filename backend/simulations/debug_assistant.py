#!/usr/bin/env python3
"""
PropIQ Debug Assistant
======================
A systematic debugging tool for API endpoint issues.

Inspired by methodical debugging approaches, this assistant:
1. Captures the exact error
2. Tests variations systematically
3. Identifies the root cause
4. Proposes and validates fixes

Usage:
    python3 debug_assistant.py --endpoint /auth/login --issue "422 errors"
"""

import requests
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import sys

@dataclass
class DebugTest:
    """A single debug test case"""
    name: str
    url: str
    method: str
    headers: Dict[str, str]
    data: Dict[str, Any]
    expected_status: int
    description: str


class DebugAssistant:
    """Systematic API debugging tool"""

    def __init__(self, base_url: str = "https://luntra.onrender.com"):
        self.base_url = base_url
        self.results = []

    def test_case(self, test: DebugTest) -> Dict:
        """Execute a single test case"""
        print(f"\n{'='*80}")
        print(f"TEST: {test.name}")
        print(f"{'='*80}")
        print(f"Description: {test.description}")
        print(f"URL: {test.method} {test.url}")
        print(f"Data: {json.dumps(test.data, indent=2)}")
        print()

        try:
            if test.method == "POST":
                response = requests.post(
                    test.url,
                    headers=test.headers,
                    json=test.data,
                    timeout=30
                )
            elif test.method == "GET":
                response = requests.get(
                    test.url,
                    headers=test.headers,
                    timeout=30
                )
            else:
                raise ValueError(f"Unsupported method: {test.method}")

            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = response.text

            # Evaluate result
            success = response.status_code == test.expected_status

            result = {
                'test': test.name,
                'success': success,
                'status_code': response.status_code,
                'expected_status': test.expected_status,
                'response': response_data,
                'headers': dict(response.headers)
            }

            # Print result
            status_emoji = "✅" if success else "❌"
            print(f"{status_emoji} Status: {response.status_code} (expected {test.expected_status})")
            print(f"Response:")
            print(json.dumps(response_data, indent=2))

            if not success:
                print(f"\n⚠️  TEST FAILED")
                if isinstance(response_data, dict) and 'detail' in response_data:
                    print(f"Error Detail: {response_data['detail']}")
            else:
                print(f"\n✅ TEST PASSED")

            self.results.append(result)
            return result

        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            result = {
                'test': test.name,
                'success': False,
                'error': str(e)
            }
            self.results.append(result)
            return result

    def debug_login_api(self):
        """Debug the login API endpoint"""
        print("\n" + "="*80)
        print("DEBUGGING LOGIN API")
        print("="*80)
        print()
        print("Issue: All login attempts return 422 Unprocessable Entity")
        print("Goal: Identify root cause and validate fix")
        print()

        # Test 1: Simple password (no special chars)
        test1 = DebugTest(
            name="Login with simple password",
            url=f"{self.base_url}/auth/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data={
                "email": "will.weekend@simulated.propiq.test",
                "password": "TestPassword123"  # No special chars
            },
            expected_status=200,
            description="Test if special characters in password cause issues"
        )
        result1 = self.test_case(test1)

        # Test 2: Original password (with !)
        test2 = DebugTest(
            name="Login with exclamation mark",
            url=f"{self.base_url}/auth/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data={
                "email": "will.weekend@simulated.propiq.test",
                "password": "SimTest2025!"  # With !
            },
            expected_status=200,
            description="Test if ! character is properly handled"
        )
        result2 = self.test_case(test2)

        # Test 3: Check user exists
        test3 = DebugTest(
            name="Verify user exists in database",
            url=f"{self.base_url}/auth/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data={
                "email": "nonexistent@test.com",
                "password": "anything"
            },
            expected_status=401,  # Should be 401 for invalid credentials
            description="Test authentication logic with non-existent user"
        )
        result3 = self.test_case(test3)

        # Test 4: Empty password
        test4 = DebugTest(
            name="Login with empty password",
            url=f"{self.base_url}/auth/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data={
                "email": "will.weekend@simulated.propiq.test",
                "password": ""
            },
            expected_status=422,  # Validation error expected
            description="Test Pydantic validation"
        )
        result4 = self.test_case(test4)

        # Test 5: Invalid email format
        test5 = DebugTest(
            name="Login with invalid email",
            url=f"{self.base_url}/auth/login",
            method="POST",
            headers={"Content-Type": "application/json"},
            data={
                "email": "not-an-email",
                "password": "TestPassword123"
            },
            expected_status=422,  # Validation error expected
            description="Test email validation"
        )
        result5 = self.test_case(test5)

        # Analyze results
        print("\n" + "="*80)
        print("ANALYSIS")
        print("="*80)

        passed = sum(1 for r in self.results if r.get('success', False))
        total = len(self.results)

        print(f"\nTests Passed: {passed}/{total}")
        print()

        # Diagnosis
        if result1.get('success'):
            print("✅ DIAGNOSIS: Password with special characters (!) is the issue")
            print("   The password needs to be updated in simulation config")
        elif result2.get('status_code') == 401:
            print("✅ DIAGNOSIS: Wrong password - user exists but password doesn't match")
            print("   Need to verify password used during user creation")
        elif result2.get('status_code') == 422:
            print("❌ DIAGNOSIS: Request validation issue")
            print("   Check Pydantic model in auth.py")

        print("\n" + "="*80)
        print("RECOMMENDATIONS")
        print("="*80)
        print()
        print("1. Update test user passwords to avoid special characters")
        print("2. OR: Ensure password hashing matches during user creation")
        print("3. Re-run simulation after fix")

    def generate_report(self, filename: str = "debug_report.json"):
        """Generate debug report"""
        report = {
            'total_tests': len(self.results),
            'passed': sum(1 for r in self.results if r.get('success', False)),
            'failed': sum(1 for r in self.results if not r.get('success', False)),
            'results': self.results
        }

        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"\n📊 Debug report saved to: {filename}")
        return report


def main():
    """Main entry point"""
    print("\n" + "="*80)
    print("PropIQ Debug Assistant")
    print("="*80)
    print()

    assistant = DebugAssistant()
    assistant.debug_login_api()
    assistant.generate_report()

    print("\n✅ Debugging complete!")
    print()


if __name__ == "__main__":
    main()
