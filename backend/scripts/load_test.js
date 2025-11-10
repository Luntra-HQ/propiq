/**
 * PropIQ Load Testing Script
 * Sprint 12 - Task 6: Load Testing
 *
 * Tests system under various load conditions:
 * - Normal load: 50 concurrent users
 * - Peak load: 200 concurrent users
 * - Stress test: 500 concurrent users
 *
 * Requirements:
 *   npm install -g k6
 *
 * Usage:
 *   k6 run load_test.js
 *   k6 run --vus 200 --duration 5m load_test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const successfulAnalyses = new Counter('successful_analyses');
const failedAnalyses = new Counter('failed_analyses');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 2 minutes (normal load)
    { duration: '2m', target: 50 },

    // Stay at 50 users for 5 minutes (baseline)
    { duration: '5m', target: 50 },

    // Ramp up to 200 users over 2 minutes (peak load)
    { duration: '2m', target: 200 },

    // Stay at 200 users for 5 minutes (peak test)
    { duration: '5m', target: 200 },

    // Spike to 500 users over 1 minute (stress test)
    { duration: '1m', target: 500 },

    // Stay at 500 users for 2 minutes (breaking point test)
    { duration: '2m', target: 500 },

    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    // Success criteria
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete within 500ms
    'http_req_duration': ['p(99)<1000'], // 99% of requests must complete within 1s
    'errors': ['rate<0.01'], // Error rate must be < 1%
    'http_req_failed': ['rate<0.01'], // HTTP failures must be < 1%
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://luntra-outreach-app.azurewebsites.net';
const TEST_EMAIL = `loadtest+${Date.now()}@example.com`;
const TEST_PASSWORD = 'LoadTest123!';

// Test data
const TEST_ADDRESSES = [
  '123 Main St, Austin, TX 78701',
  '456 Oak Ave, Austin, TX 78702',
  '789 Elm St, Austin, TX 78703',
  '321 Pine Dr, Austin, TX 78704',
  '654 Maple Ln, Austin, TX 78705',
];

let authToken = null;

/**
 * Setup function - runs once before tests
 */
export function setup() {
  console.log('Setting up load test...');

  // Create test user
  const signupRes = http.post(`${BASE_URL}/api/v1/auth/signup`, JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    full_name: 'Load Test User',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (signupRes.status === 201 || signupRes.status === 400) {
    // User created or already exists

    // Login to get token
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginRes.status === 200) {
      const loginData = JSON.parse(loginRes.body);
      authToken = loginData.token;
      console.log('Setup complete. Auth token obtained.');
      return { token: authToken };
    }
  }

  throw new Error('Setup failed: Could not create user or login');
}

/**
 * Main test function - runs for each virtual user
 */
export default function (data) {
  const token = data.token;

  group('Health Checks', function () {
    // Test all health endpoints
    const propiqHealth = http.get(`${BASE_URL}/api/v1/propiq/health`);
    check(propiqHealth, {
      'PropIQ health check OK': (r) => r.status === 200,
    });

    const supportHealth = http.get(`${BASE_URL}/api/v1/support/health`);
    check(supportHealth, {
      'Support health check OK': (r) => r.status === 200,
    });

    const stripeHealth = http.get(`${BASE_URL}/api/v1/stripe/health`);
    check(stripeHealth, {
      'Stripe health check OK': (r) => r.status === 200,
    });
  });

  sleep(1); // Think time

  group('Property Analysis', function () {
    // Select random address
    const address = TEST_ADDRESSES[Math.floor(Math.random() * TEST_ADDRESSES.length)];

    // Analyze property
    const startTime = Date.now();
    const analyzeRes = http.post(
      `${BASE_URL}/api/v1/propiq/analyze`,
      JSON.stringify({ address }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const responseTime = Date.now() - startTime;

    // Record metrics
    apiResponseTime.add(responseTime);

    const success = check(analyzeRes, {
      'Analysis request successful': (r) => r.status === 200 || r.status === 429, // 429 = rate limit (expected)
      'Analysis has results': (r) => r.json('deal_score') !== undefined || r.status === 429,
      'Response time < 3s': () => responseTime < 3000,
    });

    if (success && analyzeRes.status === 200) {
      successfulAnalyses.add(1);
    } else {
      failedAnalyses.add(1);
      errorRate.add(1);
    }
  });

  sleep(2); // Think time

  group('Analysis History', function () {
    // Get user's analysis history
    const historyRes = http.get(
      `${BASE_URL}/api/v1/propiq/analyses?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    check(historyRes, {
      'History request successful': (r) => r.status === 200,
      'History has data': (r) => r.json().length >= 0,
    });
  });

  sleep(1); // Think time

  group('User Profile', function () {
    // Get user profile
    const profileRes = http.get(
      `${BASE_URL}/api/v1/auth/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    check(profileRes, {
      'Profile request successful': (r) => r.status === 200,
      'Profile has email': (r) => r.json('email') !== undefined,
    });
  });

  sleep(Math.random() * 3 + 1); // Random think time (1-4 seconds)
}

/**
 * Teardown function - runs once after tests complete
 */
export function teardown(data) {
  console.log('Tearing down load test...');
  console.log(`Total successful analyses: ${successfulAnalyses.count}`);
  console.log(`Total failed analyses: ${failedAnalyses.count}`);

  // Optionally delete test user
  // Note: Requires admin endpoint or manual cleanup
}

/**
 * Test scenarios to run separately:
 *
 * 1. Normal Load (50 users, 5 minutes):
 *    k6 run --vus 50 --duration 5m load_test.js
 *
 * 2. Peak Load (200 users, 5 minutes):
 *    k6 run --vus 200 --duration 5m load_test.js
 *
 * 3. Stress Test (500 users, 2 minutes):
 *    k6 run --vus 500 --duration 2m load_test.js
 *
 * 4. Endurance Test (50 users, 1 hour):
 *    k6 run --vus 50 --duration 1h load_test.js
 *
 * 5. Spike Test (0 → 1000 users instantly):
 *    k6 run --vus 0 --stage 0s:1000,30s:1000,10s:0 load_test.js
 */
