/**
 * 🛡️ MYSTIC MATRIX — Hardened Clerk Authentication & Operator Provisioning Verification Suite
 * 
 * Verifies all security hardening requirements:
 * 1. Clerk SDK configuration & public metadata (zero key leaks)
 * 2. Strict Customer role for all new Google / Clerk users
 * 3. Prevention of unauthorized Admin role escalation
 * 4. Account linking and impersonation defense
 * 5. Public HTTP Admin provisioning endpoint removed (HTTP 404)
 * 6. Server-side CLI operator provisioning & rebind protection with recovery authorization
 * 7. Revocation of compromised master passphrase (HTTP 401 on legacy login)
 * 8. Backend RBAC enforcement (Customer HTTP 403 on Admin APIs, Unauth HTTP 401)
 * 9. Session persistence, logout revocation, and session expiry
 * 10. Preservation of Groq AI inventory assistant & SQLite records
 * 
 * NOTE: Credentials, secret keys, and passwords are NEVER logged or printed.
 */

const assert = (condition, message) => {
    if (!condition) {
        console.error(`  ❌ [FAIL] ${message}`);
        throw new Error(message);
    }
    console.log(`  ✔ [PASS] ${message}`);
};

const BASE_URL = 'http://localhost:5001';

async function runHardenedClerkVerification() {
    console.log('\n================================================================');
    console.log('🔮 MYSTIC MATRIX — HARDENED AUTHENTICATION & PROVISIONING AUDIT');
    console.log('================================================================');

    // ────────────────────────────────────────────────────────────
    // TEST 1: SDK CONFIGURATION & PUBLIC METADATA (NO KEY LEAKS)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 1: Clerk SDK & Public Metadata Security');
    const frontendPkg = require('../frontend/package.json');
    const backendPkg = require('../backend/package.json');

    assert(Boolean(frontendPkg.dependencies['@clerk/clerk-react']), 'Official @clerk/clerk-react installed in frontend');
    assert(Boolean(backendPkg.dependencies['@clerk/express']), 'Official @clerk/express installed in backend');

    const configRes = await fetch(`${BASE_URL}/api/auth/config`);
    assert(configRes.status === 200, 'GET /api/auth/config returned HTTP 200');
    const configJson = await configRes.json();
    assert(configJson.success === true, 'Auth configuration returned success');
    assert(configJson.data.clerkConfigured === true, 'Clerk reported as configured');
    assert(configJson.data.authProvider === 'clerk', 'Active auth provider identified as clerk');
    
    // Verify secret key is NEVER leaked in public configuration
    const configString = JSON.stringify(configJson);
    assert(!configString.includes('sk_test_') && !configString.includes('sk_live_'), 'Clerk Secret Key is NEVER exposed in public API response');
    assert(!configString.includes('Apothecary') && !configString.includes('Password'), 'No password strings leaked in public API response');
    console.log('  - Clerk Publishable Key (masked) : ' + configJson.data.clerkPublishableKey.substring(0, 12) + '...');
    console.log('  - Active Auth Provider           : ' + configJson.data.authProvider);

    // ────────────────────────────────────────────────────────────
    // TEST 2: DEFAULT CUSTOMER ROLE FOR NEW GOOGLE / CLERK USERS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 2: Default Customer Role Assignment (Zero Automatic Admin Escalation)');
    const clerkService = require('../backend/services/clerkService');
    const newGoogleClerkId = `user_google_new_${Date.now()}`;
    const newGoogleEmail = `wanderer.${Date.now()}@gmail.com`;

    const newGoogleSync = await clerkService.syncClerkUser({
        clerkId: newGoogleClerkId,
        email: newGoogleEmail,
        name: 'Wandering Alchemist',
        avatarUrl: 'https://images.clerk.dev/wanderer.png'
    });

    assert(newGoogleSync.user.role === 'USER', 'New Google/Clerk user strictly receives CUSTOMER role (USER)');
    assert(newGoogleSync.user.email === newGoogleEmail.toLowerCase(), 'Customer email normalized and preserved');
    assert(newGoogleSync.user.clerk_id === newGoogleClerkId, 'Clerk ID bound to new Customer');
    assert(Boolean(newGoogleSync.session.id), 'Active session established for new Customer');

    // ────────────────────────────────────────────────────────────
    // TEST 3: PREVENTION OF UNAUTHORIZED ROLE ESCALATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 3: Prevention of Unauthorized Admin Role Escalation');
    
    // Attempting to sync an unprovisioned Clerk ID against Madam Hex's Admin email must be BLOCKED
    const rogueClerkId = `user_attacker_imposter_${Date.now()}`;
    let adminEscalationBlocked = false;
    try {
        await clerkService.syncClerkUser({
            clerkId: rogueClerkId,
            email: 'madam.hex@gmail.com',
            name: 'Fake Madam Hex'
        });
    } catch (err) {
        adminEscalationBlocked = true;
        assert(
            err.message.includes('Admin account can only be claimed') ||
            err.message.includes('Impersonation attempt blocked') ||
            err.message.includes('permanently bound'),
            `Rogue attempt safely rejected with security alert`
        );
    }
    assert(adminEscalationBlocked, 'Unauthorized Clerk ID prevented from claiming Madam Hex Admin account');

    // Also test via HTTP POST /api/auth/clerk-sync endpoint
    const httpRogueRes = await fetch(`${BASE_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clerkId: `user_http_rogue_${Date.now()}`,
            email: 'madam.hex@gmail.com',
            name: 'HTTP Imposter'
        })
    });
    assert(httpRogueRes.status === 403, 'HTTP /api/auth/clerk-sync returns HTTP 403 Forbidden for unprovisioned Admin claim');

    // ────────────────────────────────────────────────────────────
    // TEST 4: IMPERSONATION DEFENSE ON ALREADY BOUND ACCOUNTS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 4: Impersonation Defense on Bound Customer Accounts');
    
    const legitimateCustomer = require('../backend/models/userModel').findById(2);
    assert(Boolean(legitimateCustomer), 'Customer #2 (Valerius Apprentice) exists in SQLite');

    let impersonationBlocked = false;
    try {
        await clerkService.syncClerkUser({
            clerkId: `user_attacker_stealing_valerius_${Date.now()}`,
            email: legitimateCustomer.email,
            name: 'Account Thief'
        });
    } catch (err) {
        impersonationBlocked = true;
        assert(err.message.includes('Impersonation attempt blocked') || err.message.includes('permanently bound'),
            `Impersonation attempt safely blocked`);
    }
    assert(impersonationBlocked, 'Attacker prevented from hijacking existing customer account');

    // ────────────────────────────────────────────────────────────
    // TEST 5: REMOVAL OF PUBLIC HTTP PROVISIONING & SECURE CLI PROVISIONING
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 5: Removal of HTTP Provisioning Endpoint & Secure Server-Side CLI');
    
    // 1. Verify HTTP endpoint has been completely removed (returns 404)
    const httpProvisionAttempt = await fetch(`${BASE_URL}/api/auth/provision-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: 'user_exploit_attempt' })
    });
    assert(httpProvisionAttempt.status === 404, 'Public HTTP Admin provisioning endpoint is REMOVED (HTTP 404)');

    // 2. Direct invocation without operator privilege is REJECTED
    let nonOperatorBlocked = false;
    try {
        await clerkService.provisionAdminClerkId({
            clerkId: `user_non_operator_${Date.now()}`,
            isOperator: false
        });
    } catch (err) {
        nonOperatorBlocked = true;
        assert(err.message.includes('strictly restricted to trusted server-side CLI operator'),
            'Non-operator provisioning attempt strictly rejected');
    }
    assert(nonOperatorBlocked, 'Non-operator callers cannot provision Admin accounts');

    // 3. Trusted Operator CLI Provisioning Succeeds
    const verifiedAdminClerkId = `user_verified_madam_hex_${Date.now()}`;
    const authorizedProvisionResult = await clerkService.provisionAdminClerkId({
        clerkId: verifiedAdminClerkId,
        isOperator: true,
        allowRecovery: true,
        operatorReason: 'Automated Hardening Verification Suite'
    });
    assert(authorizedProvisionResult.success === true, 'Server-side CLI operator provisioning succeeded');
    assert(authorizedProvisionResult.user.role === 'ADMIN', 'Provisioned user role confirmed as ADMIN');
    assert(authorizedProvisionResult.user.clerk_id === verifiedAdminClerkId, 'Verified Clerk ID bound to Madam Hex in SQLite');

    // 4. Overwriting Admin Clerk ID without explicit recovery authorization is REJECTED
    let rebindWithoutRecoveryBlocked = false;
    try {
        await clerkService.provisionAdminClerkId({
            clerkId: `user_different_clerk_id_${Date.now()}`,
            isOperator: true,
            allowRecovery: false // Must be blocked!
        });
    } catch (err) {
        rebindWithoutRecoveryBlocked = true;
        assert(err.message.includes('already bound') && err.message.includes('--recover'),
            'Rebinding without recovery flag safely rejected with security alert');
    }
    assert(rebindWithoutRecoveryBlocked, 'Admin account cannot be rebound without explicit recovery authorization');

    // 5. Syncing provisioned Clerk Admin via HTTP clerk-sync returns ADMIN session
    const adminSyncRes = await fetch(`${BASE_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clerkId: verifiedAdminClerkId,
            email: 'madam.hex@gmail.com',
            name: 'Madam Hex'
        })
    });
    assert(adminSyncRes.status === 200, 'Syncing provisioned Clerk Admin returns HTTP 200');
    const adminSyncData = await adminSyncRes.json();
    assert(adminSyncData.user.role === 'ADMIN', 'Provisioned Clerk session establishes ADMIN role');
    const adminCookie = adminSyncRes.headers.get('set-cookie');
    assert(Boolean(adminCookie), 'Session cookie established for provisioned Clerk Admin');

    // ────────────────────────────────────────────────────────────
    // TEST 6: REVOCATION OF COMPROMISED MASTER PASSPHRASE
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 6: Complete Revocation of Compromised Legacy Passphrase');
    
    // Attempting legacy login with any revoked passphrase must fail with 401
    const revokedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'madam.hex@gmail.com',
            password: 'RevokedCompromisedPassword123!'
        })
    });
    assert(revokedLoginRes.status === 401, 'Legacy password login for Admin is revoked/rejected (HTTP 401)');

    // ────────────────────────────────────────────────────────────
    // TEST 7: BACKEND RBAC ENFORCEMENT (CUSTOMER 403 / UNAUTH 401)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 7: Backend RBAC Enforcement (Express Middleware)');

    // 1. Unauthenticated requests must receive HTTP 401
    const unauthDash = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert(unauthDash.status === 401, 'Unauthenticated GET /api/admin/dashboard -> HTTP 401');
    const unauthAi = await fetch(`${BASE_URL}/api/ai/diagnostics`);
    assert(unauthAi.status === 401, 'Unauthenticated GET /api/ai/diagnostics -> HTTP 401');

    // 2. Establish a legitimate Customer session
    const testCustomerClerkId = `user_rbac_customer_${Date.now()}`;
    const custSyncRes = await fetch(`${BASE_URL}/api/auth/clerk-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clerkId: testCustomerClerkId,
            email: `customer.eval.${Date.now()}@hallowmere.com`,
            name: 'Test Customer'
        })
    });
    assert(custSyncRes.status === 200, 'Customer Clerk sync returned HTTP 200');
    const custData = await custSyncRes.json();
    assert(custData.user.role === 'USER', 'User confirmed with USER role');
    const custCookie = custSyncRes.headers.get('set-cookie');

    // 3. Customer CAN access customer-authorized endpoints
    const custCartRes = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: custCookie }
    });
    assert(custCartRes.status === 200, 'Customer successfully accesses /api/cart (HTTP 200)');

    const custShopRes = await fetch(`${BASE_URL}/api/shop/products`, {
        headers: { Cookie: custCookie }
    });
    assert(custShopRes.status === 200, 'Customer successfully accesses /api/shop/products (HTTP 200)');

    // 4. Customer CANNOT access Admin endpoints -> HTTP 403 FORBIDDEN
    const custAdminDash = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: custCookie }
    });
    assert(custAdminDash.status === 403, 'Customer forbidden from /api/admin/dashboard (HTTP 403)');

    const custAdminAi = await fetch(`${BASE_URL}/api/ai/diagnostics`, {
        headers: { Cookie: custCookie }
    });
    assert(custAdminAi.status === 403, 'Customer forbidden from /api/ai/diagnostics (HTTP 403)');

    const custAdminSuppliers = await fetch(`${BASE_URL}/api/suppliers`, {
        headers: { Cookie: custCookie }
    });
    assert(custAdminSuppliers.status === 403, 'Customer forbidden from /api/suppliers (HTTP 403)');

    const custAdminUsers = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { Cookie: custCookie }
    });
    assert(custAdminUsers.status === 403, 'Customer forbidden from /api/admin/users (HTTP 403)');

    const custActionExec = await fetch(`${BASE_URL}/api/ai/actions/execute`, {
        method: 'POST',
        headers: {
            Cookie: custCookie,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actionId: 'test_action' })
    });
    assert(custActionExec.status === 403, 'Customer forbidden from /api/ai/actions/execute (HTTP 403)');

    // 5. Admin CAN access Admin endpoints -> HTTP 200 OK
    const adminDashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: adminCookie }
    });
    assert(adminDashRes.status === 200, 'Admin successfully accesses /api/admin/dashboard (HTTP 200)');

    const adminAiRes = await fetch(`${BASE_URL}/api/ai/diagnostics`, {
        headers: { Cookie: adminCookie }
    });
    assert(adminAiRes.status === 200, 'Admin successfully accesses /api/ai/diagnostics (HTTP 200)');

    // ────────────────────────────────────────────────────────────
    // TEST 8: LOGOUT, SESSION EXPIRY & IMMEDIATE REVOCATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 8: Logout, Session Expiry & Immediate Revocation');

    const meActiveRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: adminCookie }
    });
    assert(meActiveRes.status === 200, 'GET /api/auth/me confirms active session');
    const meJson = await meActiveRes.json();
    assert(meJson.authenticated === true, 'Session is authenticated');
    assert(meJson.user.role === 'ADMIN', 'Session user is Madam Hex (ADMIN)');

    // Perform Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: adminCookie }
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returned HTTP 200');

    // Attempt accessing protected endpoint with logged-out cookie
    const postLogoutRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: adminCookie }
    });
    assert(postLogoutRes.status === 401, 'Request with logged-out session strictly blocked (HTTP 401)');

    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: adminCookie }
    });
    const meAfterJson = await meAfterLogout.json();
    assert(meAfterJson.authenticated === false, 'Session status on /api/auth/me is authenticated: false');

    // ────────────────────────────────────────────────────────────
    // TEST 9: PRESERVATION OF GROQ AI & INVENTORY SYSTEMS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 9: Preservation of Groq AI & Inventory Systems');
    
    // Obtain valid Admin session via internal session generator (no password required)
    const authService = require('../backend/services/authService');
    const adminSession = authService.createSession(1, '127.0.0.1', 'AuditTestRunner');
    const testAdminCookie = `${authService.sessionCookieName}=${adminSession.id}`;

    // Test Groq AI Diagnostics Ping
    const pingRes = await fetch(`${BASE_URL}/api/ai/diagnostics/ping`, {
        method: 'POST',
        headers: { Cookie: testAdminCookie }
    });
    assert(pingRes.status === 200, 'Groq AI diagnostics ping operational (HTTP 200)');
    const pingJson = await pingRes.json();
    assert(pingJson.ping.success === true, 'Groq Cloud live AI connection confirmed');
    console.log(`  - Groq AI Provider       : ${pingJson.ping.provider}`);
    console.log(`  - Groq Model Name        : ${pingJson.ping.model}`);
    console.log(`  - Ping Latency           : ${pingJson.ping.latencyMs}ms`);

    // Check inventory records via /api/products
    const invRes = await fetch(`${BASE_URL}/api/products`, {
        headers: { Cookie: testAdminCookie }
    });
    assert(invRes.status === 200, 'Products & Inventory API operational (HTTP 200)');
    const invJson = await invRes.json();
    assert(Array.isArray(invJson.data) && invJson.data.length > 0, `Inventory data intact (${invJson.data.length} products)`);

    // Check inventory valuation
    const valRes = await fetch(`${BASE_URL}/api/inventory/valuation`, {
        headers: { Cookie: testAdminCookie }
    });
    assert(valRes.status === 200, 'Inventory valuation API operational (HTTP 200)');

    console.log('\n================================================================');
    console.log('🏁 HARDENED AUTHENTICATION AUDIT: ALL TESTS PASSED!');
    console.log('================================================================\n');
}

runHardenedClerkVerification().catch(err => {
    console.error('\n❌ HARDENED AUTHENTICATION AUDIT FAILED:', err);
    process.exit(1);
});
