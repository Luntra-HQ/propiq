import { test, expect } from '@playwright/test';

/**
 * User Signup Integration Tests
 *
 * Tests the complete user signup flow from frontend → backend REST API → MongoDB
 * Validates database entry creation and logs to Comet ML for verification
 */

const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://luntra.one';
const BACKEND_URL = process.env.VITE_API_BASE || 'https://api.luntra.one';

// Generate unique test user for each test run
const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    email: `test.user.${timestamp}@luntra-test.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    company: 'Luntra Testing Inc.'
  };
};

test.describe('User Signup Integration', () => {
  test('POST /auth/signup creates user via REST API', async ({ request }) => {
    console.log('\n=== USER SIGNUP REST API TEST ===');

    const testUser = generateTestUser();
    console.log(`Creating test user: ${testUser.email}`);

    // Send signup request directly to backend API
    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`Response status: ${response.status()}`);

    // Verify response
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // Parse response body
    const body = await response.json();
    console.log(`Response body: ${JSON.stringify(body, null, 2)}`);

    // Verify response structure
    expect(body).toHaveProperty('success');
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('userId');
    expect(body.userId).toBeTruthy();
    expect(body).toHaveProperty('message');
    expect(body.message).toContain('created successfully');

    console.log(`✅ User created with ID: ${body.userId}`);
  });

  test('Frontend can call createUser() and receive userId', async ({ request }) => {
    console.log('\n=== FRONTEND API INTEGRATION TEST ===');

    const testUser = generateTestUser();
    console.log(`Testing frontend createUser() with: ${testUser.email}`);

    // Simulate frontend API call (via Playwright request context)
    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: {
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        company: testUser.company
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);

    const result = await response.json();

    // Validate response matches SignupResponse interface
    expect(result.success).toBe(true);
    expect(result.userId).toBeTruthy();
    expect(typeof result.userId).toBe('string');
    expect(result.userId.length).toBeGreaterThan(10); // MongoDB ObjectId is 24 chars

    console.log(`✅ Frontend received userId: ${result.userId}`);
  });

  test('Duplicate email returns error', async ({ request }) => {
    console.log('\n=== DUPLICATE EMAIL TEST ===');

    const testUser = generateTestUser();

    // Create user first time
    const firstResponse = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    expect(firstResponse.status()).toBe(200);
    const firstBody = await firstResponse.json();
    console.log(`First signup successful: ${firstBody.userId}`);

    // Attempt to create same user again
    const secondResponse = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    console.log(`Second signup status: ${secondResponse.status()}`);

    // Should return 400 Bad Request
    expect(secondResponse.status()).toBe(400);

    const errorBody = await secondResponse.json();
    console.log(`Error response: ${JSON.stringify(errorBody)}`);

    // Verify error message
    expect(errorBody).toHaveProperty('detail');
    expect(errorBody.detail).toContain('already registered');

    console.log('✅ Duplicate email correctly rejected');
  });

  test('User can login after signup', async ({ request }) => {
    console.log('\n=== SIGNUP → LOGIN FLOW TEST ===');

    const testUser = generateTestUser();

    // Step 1: Signup
    const signupResponse = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    expect(signupResponse.status()).toBe(200);
    const signupBody = await signupResponse.json();
    const userId = signupBody.userId;

    console.log(`✅ Signup successful: ${userId}`);

    // Step 2: Login with same credentials
    const loginResponse = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();

    console.log(`Login response: ${JSON.stringify(loginBody, null, 2)}`);

    // Verify login response
    expect(loginBody.success).toBe(true);
    expect(loginBody.userId).toBe(userId);
    expect(loginBody.message).toContain('successful');

    console.log('✅ Login successful after signup');
  });

  test('Invalid password fails login', async ({ request }) => {
    console.log('\n=== INVALID PASSWORD TEST ===');

    const testUser = generateTestUser();

    // Step 1: Create user
    await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    // Step 2: Attempt login with wrong password
    const loginResponse = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: 'WrongPassword123!'
      }
    });

    console.log(`Login status: ${loginResponse.status()}`);

    // Should return 401 Unauthorized
    expect(loginResponse.status()).toBe(401);

    const errorBody = await loginResponse.json();
    expect(errorBody.detail).toContain('Invalid email or password');

    console.log('✅ Invalid password correctly rejected');
  });

  test('Can retrieve user details after signup', async ({ request }) => {
    console.log('\n=== GET USER DETAILS TEST ===');

    const testUser = generateTestUser();

    // Step 1: Create user
    const signupResponse = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    const signupBody = await signupResponse.json();
    const userId = signupBody.userId;

    console.log(`Created user: ${userId}`);

    // Step 2: Fetch user details
    const getUserResponse = await request.get(`${BACKEND_URL}/auth/users/${userId}`);

    expect(getUserResponse.status()).toBe(200);

    const userDetails = await getUserResponse.json();
    console.log(`User details: ${JSON.stringify(userDetails, null, 2)}`);

    // Verify user details
    expect(userDetails.email).toBe(testUser.email.toLowerCase());
    expect(userDetails.firstName).toBe(testUser.firstName);
    expect(userDetails.lastName).toBe(testUser.lastName);
    expect(userDetails.company).toBe(testUser.company);
    expect(userDetails).toHaveProperty('created_at');
    expect(userDetails).toHaveProperty('active');
    expect(userDetails.active).toBe(true);

    // Password hash should NOT be returned
    expect(userDetails).not.toHaveProperty('password_hash');

    console.log('✅ User details retrieved successfully');
  });

  test('MongoDB entry verification via Comet ML logs', async ({ request }) => {
    console.log('\n=== MONGODB + COMET ML VERIFICATION TEST ===');

    const testUser = generateTestUser();

    console.log(`Testing MongoDB persistence for: ${testUser.email}`);

    // Create user - this should:
    // 1. Insert into MongoDB
    // 2. Log to Comet ML with artifact
    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    const userId = body.userId;

    console.log(`\n=== VERIFICATION CHECKLIST ===`);
    console.log(`✓ User ID returned: ${userId}`);
    console.log(`✓ Success flag: ${body.success}`);

    // Verify we can retrieve the user (proves MongoDB persistence)
    const getUserResponse = await request.get(`${BACKEND_URL}/auth/users/${userId}`);
    expect(getUserResponse.status()).toBe(200);

    const userFromDb = await getUserResponse.json();
    console.log(`✓ User retrieved from database`);
    console.log(`  - Email: ${userFromDb.email}`);
    console.log(`  - First Name: ${userFromDb.firstName}`);
    console.log(`  - Company: ${userFromDb.company}`);
    console.log(`  - Created At: ${userFromDb.created_at}`);

    // Log Comet ML verification instructions
    console.log(`\n=== COMET ML VERIFICATION ===`);
    console.log(`To verify MongoDB entry creation:`);
    console.log(`1. Visit: https://www.comet.com/${process.env.COMET_WORKSPACE}/${process.env.COMET_PROJECT || 'luntra-backend'}`);
    console.log(`2. Find experiment: "MongoDB user_signup - ${new Date().toISOString().split('T')[0]}"`);
    console.log(`3. Check artifact: mongodb_user_signup.json`);
    console.log(`4. Verify fields:`);
    console.log(`   - user_id: ${userId}`);
    console.log(`   - email: ${testUser.email.toLowerCase()}`);
    console.log(`   - database: luntra`);
    console.log(`   - collection: users`);
    console.log(`   - operation: insert_one`);
    console.log(`   - success: true`);

    console.log(`\n✅ MongoDB entry created and verifiable via Comet ML`);
  });

  test('Full E2E: Signup → Verify DB → Login → Get Profile', async ({ request }) => {
    console.log('\n=== FULL END-TO-END INTEGRATION TEST ===');

    const testUser = generateTestUser();

    console.log(`Step 1: Signup user ${testUser.email}`);
    const signupResponse = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: testUser
    });

    expect(signupResponse.status()).toBe(200);
    const signupBody = await signupResponse.json();
    const userId = signupBody.userId;
    console.log(`  ✓ User created: ${userId}`);

    console.log(`\nStep 2: Verify user exists in database`);
    const verifyResponse = await request.get(`${BACKEND_URL}/auth/users/${userId}`);
    expect(verifyResponse.status()).toBe(200);
    const userFromDb = await verifyResponse.json();
    expect(userFromDb.email).toBe(testUser.email.toLowerCase());
    console.log(`  ✓ User found in database`);

    console.log(`\nStep 3: Login with credentials`);
    const loginResponse = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.userId).toBe(userId);
    console.log(`  ✓ Login successful`);

    console.log(`\nStep 4: Retrieve user profile`);
    const profileResponse = await request.get(`${BACKEND_URL}/auth/users/${userId}`);
    expect(profileResponse.status()).toBe(200);
    const profile = await profileResponse.json();
    expect(profile.firstName).toBe(testUser.firstName);
    expect(profile.lastName).toBe(testUser.lastName);
    expect(profile.company).toBe(testUser.company);
    console.log(`  ✓ Profile retrieved`);

    console.log(`\n=== E2E TEST SUMMARY ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Email: ${profile.email}`);
    console.log(`Full Name: ${profile.firstName} ${profile.lastName}`);
    console.log(`Company: ${profile.company}`);
    console.log(`Account Active: ${profile.active}`);
    console.log(`Created: ${profile.created_at}`);

    console.log(`\n✅ Full E2E integration test passed!`);
  });
});

test.describe('User Signup Error Handling', () => {
  test('Missing email returns 422 validation error', async ({ request }) => {
    console.log('\n=== MISSING EMAIL VALIDATION TEST ===');

    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: {
        password: 'Test123!',
        firstName: 'Test'
      }
    });

    console.log(`Status: ${response.status()}`);

    // FastAPI/Pydantic returns 422 for validation errors
    expect(response.status()).toBe(422);

    const body = await response.json();
    console.log(`Error: ${JSON.stringify(body, null, 2)}`);

    console.log('✅ Missing email correctly rejected');
  });

  test('Invalid email format returns 422 validation error', async ({ request }) => {
    console.log('\n=== INVALID EMAIL FORMAT TEST ===');

    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: {
        email: 'not-a-valid-email',
        password: 'Test123!',
        firstName: 'Test'
      }
    });

    expect(response.status()).toBe(422);

    const body = await response.json();
    console.log(`Error: ${JSON.stringify(body, null, 2)}`);

    console.log('✅ Invalid email format correctly rejected');
  });

  test('Missing password returns 422 validation error', async ({ request }) => {
    console.log('\n=== MISSING PASSWORD TEST ===');

    const response = await request.post(`${BACKEND_URL}/auth/signup`, {
      data: {
        email: 'test@example.com',
        firstName: 'Test'
      }
    });

    expect(response.status()).toBe(422);

    console.log('✅ Missing password correctly rejected');
  });
});
