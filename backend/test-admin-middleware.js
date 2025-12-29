const adminAuth = require('./middleware/adminAuth');

function mockReq(email) {
    return {
        user: {
            email: email
        }
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

const runTest = (description, email, expectedStatus) => {
    console.log(`Test: ${description}`);
    const req = mockReq(email);
    const res = mockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    adminAuth(req, res, next);

    if (expectedStatus === 200) {
        if (nextCalled) {
            console.log('PASS: next() was called as expected.');
        } else {
            console.log('FAIL: next() was NOT called.');
        }
    } else {
        if (!nextCalled && res.statusCode === expectedStatus) {
            console.log(`PASS: Met expected status ${expectedStatus}.`);
        } else {
            console.log(`FAIL: Expected status ${expectedStatus}, got ${res.statusCode} (nextCalled: ${nextCalled})`);
        }
    }
    console.log('---');
};

console.log('Running Admin Auth Tests...\n');

// Test 1: Authorized User
runTest('Authorized Admin (nikhilm.cs24@bmsce.ac.in)', 'nikhilm.cs24@bmsce.ac.in', 200);

// Test 2: Unauthorized User
runTest('Unauthorized User (other@bmsce.ac.in)', 'other@bmsce.ac.in', 403);

// Test 3: Unauthorized User (attacker)
runTest('Unauthorized External (hacker@example.com)', 'hacker@example.com', 403);

// Test 4: No User (Should be caught by auth middleware, but adminAuth checks req.user existence too)
console.log('Test: No User (Unauthenticated)');
const reqNoUser = {};
const resNoUser = mockRes();
let nextCalledNoUser = false;
const nextNoUser = () => { nextCalledNoUser = true; };

adminAuth(reqNoUser, resNoUser, nextNoUser);

if (resNoUser.statusCode === 401) {
    console.log('PASS: Met expected status 401.');
} else {
    console.log(`FAIL: Expected status 401, got ${resNoUser.statusCode}`);
}
console.log('---');
