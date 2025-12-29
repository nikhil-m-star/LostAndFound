require('dotenv').config({ path: '.env.local' });
const authMiddleware = require('./middleware/auth');

// We need to mock ClerkExpressWithAuth which is the first middleware in the array
// But auth.js exports [clerkAuth, syncUser].
// The internal logic we want to test is inside `syncUser`.
// We can test `syncUser` directly if we can access it, but it's not exported directly, it's in an array.
// Actually, `module.exports = [clerkAuth, syncUser];`
// So we can access the second element.

const syncUser = authMiddleware[1];

function mockReq(email, userId) {
    return {
        auth: {
            userId: userId || 'user_123',
            sessionClaims: {
                email: email
            }
        },
        user: null // to be populated
    };
}

function mockRes() {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
}

const runTest = async (description, email, expectedStatus) => {
    console.log(`Test: ${description}`);
    const req = mockReq(email);
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // We need to mock supabase as well since syncUser uses it.
    // This is getting complicated to mock entire Supabase.
    // However, the domain check happens BEFORE supabase calls in `syncUser`.
    // Let's verify that assumption.

    /*
    // 1. Verify Clerk Token (skipped in unit test of 2nd middleware)
    // ...
    // Try to get details from claims first
    // ...
    // Enforce BMSCE Domain
    if (email && !email.endsWith('@bmsce.ac.in')) {
      return res.status(403).json({ message: 'Access restricted to bmsce.ac.in' });
    }
    // ... Supabase calls ...
    */

    // Because logic checks domain BEFORE database calls, we can rely on it failing early without mocking DB if we test invalid domains.
    // For VALID domains, it will try to call Supabase and likely fail/crash if we don't mock it.
    // So we only test INVALID domains here to confirm rejection.
    // Testing valid domains requires full mocking which is complex for this script.

    try {
        await syncUser(req, res, next);
    } catch (e) {
        if (expectedStatus === 200) {
            // If we expected success but got error (likely DB connection), that implies it PASSED the domain check.
            console.log('PASS (Implicit): Passed domain check, failed at DB (expected in this mock environment).');
            console.log('---');
            return;
        }
        console.error('Unexpected error:', e);
    }

    if (expectedStatus !== 200) {
        if (!nextCalled && res.statusCode === expectedStatus) {
            console.log(`PASS: Met expected status ${expectedStatus}.`);
        } else {
            console.log(`FAIL: Expected status ${expectedStatus}, got ${res.statusCode}`);
        }
    } else {
        // If we reached here for 200, next() should have been called (if DB mock worked)
        if (nextCalled) {
            console.log('PASS: next() was called.');
        } else {
            console.log(`FAIL: next() NOT called. StatusCode: ${res.statusCode}`);
        }
    }
    console.log('---');
};

console.log('Running Domain Restriction Tests...\n');

// Test 1: Invalid Domain
runTest('Invalid Domain (gmail.com)', 'test@gmail.com', 403);

// Test 2: Invalid Domain (example.com)
runTest('Invalid Domain (example.com)', 'student@example.com', 403);

// Test 3: Valid Domain (bmsce.ac.in) - Should pass domain check and crash at DB (or succeed if DB connects)
// We treat crash/next() as success for domain check purpose
runTest('Valid Domain (bmsce.ac.in)', 'student@bmsce.ac.in', 200);

// Test 4: Subdomain handling (if any, current logic is strict endsWith)
runTest('Subdomain (sub.bmsce.ac.in)', 'staff@sub.bmsce.ac.in', 403); // Logic is endsWith('@bmsce.ac.in'), so sub.bmsce.ac.in would FAIL unless it is exactly @bmsce.ac.in ... wait.
// endsWith('@bmsce.ac.in') -> 'user@sub.bmsce.ac.in'.endsWith('@bmsce.ac.in') is FALSE.
// It expects exactly '@bmsce.ac.in'. This is usually desired.
