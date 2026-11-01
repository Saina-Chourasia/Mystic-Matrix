/**
 * Comprehensive Verification & Test Suite for:
 * MYSTIC MATRIX — GROQ AI INTEGRATION & AUDIT
 * Validates official Groq SDK integration, 9 read-only tools, fallback engine,
 * Level 3 guardrails, and Admin-only diagnostics.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../backend/config/db');

const BASE_URL = 'http://localhost:5001';
const SCREENSHOTS_DIR = '/Users/sainakumari/.gemini/antigravity/brain/df1e120e-895d-416e-a790-1404bdb1d679/screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✔ [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  ❌ [FAIL] ${message}`);
        failed++;
    }
}

async function runGroqAudit() {
    console.log('\n============================================================');
    console.log('🔮 MYSTIC MATRIX — GROQ AI INTEGRATION AUDIT & TEST SUITE');
    console.log('============================================================\n');

    // ────────────────────────────────────────────────────────────
    // 1. AUDIT ACTIVE AI PROVIDER & DIAGNOSTICS ENDPOINT
    // ────────────────────────────────────────────────────────────
    console.log('📌 STEP 1: Audit Active AI Provider & Diagnostics Endpoint');
    
    // Generate authorized Admin session cookie directly from server service
    const authService = require('../backend/services/authService');
    const adminSession = authService.createSession(1, '127.0.0.1', 'TestRunner');
    const adminCookie = `${authService.sessionCookieName}=${adminSession.id}`;

    // Call /api/ai/diagnostics
    const diagRes = await fetch(`${BASE_URL}/api/ai/diagnostics`, {
        headers: { cookie: adminCookie }
    });
    assert(diagRes.status === 200, 'Admin Diagnostics endpoint reachable (/api/ai/diagnostics)');
    const diagJson = await diagRes.json();
    const diag = diagJson.diagnostics;

    console.log('\n  [DIAGNOSTICS AUDIT RESULT]');
    console.log(`  - Configured Target Provider : ${diag.configuredProvider}`);
    console.log(`  - Actual Active Provider     : ${diag.activeProvider}`);
    console.log(`  - Active Model               : ${diag.model}`);
    console.log(`  - Groq Key Configured        : ${diag.groqKeyConfigured ? 'YES (Masked: ' + diag.groqMaskedKey + ')' : 'NO'}`);
    console.log(`  - SDK Implementation         : ${diag.sdk} (${diag.sdkVersion})`);
    console.log(`  - Tool Calling Enabled       : ${diag.toolCallingEnabled}`);
    console.log(`  - Tools Online               : ${diag.toolsCount} / 9`);
    console.log(`  - Action Safety Guardrail    : ${diag.guardrailLevel}\n`);

    assert(diag.configuredProvider === 'groq', 'Target AI provider is configured as Groq');
    assert(diag.toolsCount === 9, 'All 9 read-only inventory tools registered');
    assert(diag.guardrailLevel.includes('Level 3'), 'Level 3 human approval guardrail is active');
    assert(diag.groqMaskedKey === null || !diag.groqMaskedKey.includes(process.env.GROQ_API_KEY || 'MISSING'), 'API Key is strictly masked (zero cleartext exposure)');

    // ────────────────────────────────────────────────────────────
    // 2. LIVE PROVIDER PING TEST
    // ────────────────────────────────────────────────────────────
    console.log('📌 STEP 2: Provider Ping Connection Test');
    const pingRes = await fetch(`${BASE_URL}/api/ai/diagnostics/ping`, {
        method: 'POST',
        headers: { cookie: adminCookie }
    });
    assert(pingRes.status === 200, 'Provider ping endpoint returned HTTP 200');
    const pingJson = await pingRes.json();
    console.log(`  - Ping Status: ${pingJson.ping.status}`);
    console.log(`  - Message: ${pingJson.ping.message}`);

    if (diag.groqKeyConfigured) {
        if (pingJson.ping.success) {
            assert(pingJson.ping.provider === 'groq', `Real authenticated ping to Groq succeeded (${pingJson.ping.latencyMs}ms)`);
        } else {
            console.log(`  ℹ Groq API Key is configured but live ping failed: ${pingJson.ping.error}`);
            assert(pingJson.ping.status === 'FALLBACK_ACTIVE', 'Seamless fallback to heuristic oracle triggered on ping failure');
        }
    } else {
        assert(pingJson.ping.status === 'FALLBACK_ACTIVE', 'Verified: In absence of GROQ_API_KEY, deterministic fallback engine is active');
    }

    // ────────────────────────────────────────────────────────────
    // 3. OFFICIAL GROQ SDK & TOOL SCHEMAS VERIFICATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 STEP 3: Official Groq SDK & Tool Calling Schemas');
    const Groq = require('../backend/node_modules/groq-sdk');
    assert(typeof Groq === 'function', 'Official groq-sdk package loaded in backend');

    const testClient = new Groq({ apiKey: 'gsk_mock_test_key_for_schema_audit_only' });
    assert(typeof testClient.chat.completions.create === 'function', 'Groq chat.completions.create is available');

    const AiAgentService = require('../backend/services/aiAgentService');

    // Verify all 9 tools execute properly
    const tools = [
        'getInventorySummary',
        'getLowStockProducts',
        'getOverstockProducts',
        'getDemandForecast',
        'getSupplierComparison',
        'getSalesTrends',
        'getPendingOrders',
        'getIngredientShortages',
        'getAdminNotifications'
    ];

    for (const toolName of tools) {
        try {
            const out = await AiAgentService.executeTool(toolName, {});
            assert(Boolean(out), `Tool ${toolName}() executed and returned valid data`);
        } catch (err) {
            assert(false, `Tool ${toolName}() threw error: ${err.message}`);
        }
    }

    // ────────────────────────────────────────────────────────────
    // 4. CONVERSATIONAL QUERY PROCESSING & PROVIDER REPORTING
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 STEP 4: Conversational Chat & Provider Origin Reporting');
    const chatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', cookie: adminCookie },
        body: JSON.stringify({ message: 'What is likely to run out before Halloween?' })
    });
    assert(chatRes.status === 200, 'Chat query endpoint returned HTTP 200');
    const chatJson = await chatRes.json();

    console.log(`  - Response Provider Origin : ${chatJson.provider}`);
    console.log(`  - Response Model           : ${chatJson.model}`);
    console.log(`  - Tools Used               : [${chatJson.toolsUsed.join(', ')}]`);
    console.log(`  - Suggested Actions Count  : ${chatJson.suggestedActions?.length || 0}`);

    assert(Boolean(chatJson.provider), `Provider origin clearly identified: ${chatJson.provider}`);
    assert(chatJson.toolsUsed.length > 0, `At least one tool was utilized: ${chatJson.toolsUsed[0]}`);
    assert(chatJson.message && chatJson.message.length > 50, 'Response returned comprehensive answer');

    // ────────────────────────────────────────────────────────────
    // 5. LEVEL 3 ACTION APPROVAL SAFETY GUARDRAIL
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 STEP 5: Level 3 Action Approval Safety Guardrails');
    const db = getDb();

    // Verify draft action from chatJson has status PENDING
    let testActionId = null;
    if (chatJson.suggestedActions && chatJson.suggestedActions.length > 0) {
        const action = chatJson.suggestedActions[0];
        testActionId = action.id;
        assert(action.status === 'PENDING', `Suggested action #${action.id} created with status PENDING`);

        // Approve action via Admin endpoint
        const approveRes = await fetch(`${BASE_URL}/api/ai/actions/${action.id}/approve`, {
            method: 'POST',
            headers: { cookie: adminCookie }
        });
        assert(approveRes.status === 200, `Admin approved action #${action.id}`);
        const approveJson = await approveRes.json();
        assert(approveJson.action.status === 'EXECUTED', `Action #${action.id} marked as EXECUTED in database`);

        // Verify audit log entry created
        const audit = db.prepare("SELECT * FROM audit_logs WHERE entity_type = 'AI_AGENT' AND entity_id = ?").get(String(action.id));
        assert(Boolean(audit), `Audit log record verified for executed action #${action.id}`);
    } else {
        assert(false, 'Expected suggested actions from chat query');
    }

    // ────────────────────────────────────────────────────────────
    // 6. RBAC & SECURITY PROTECTION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 STEP 6: RBAC & Security Isolation');
    const unauthDiag = await fetch(`${BASE_URL}/api/ai/diagnostics`);
    assert(unauthDiag.status === 401, `Unauthenticated request to diagnostics blocked (HTTP ${unauthDiag.status})`);

    const custLogin = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'gweneth.crow@hallowmere.realm', password: 'Password123!' })
    });
    const custCookie = custLogin.headers.get('set-cookie');
    const custDiag = await fetch(`${BASE_URL}/api/ai/diagnostics`, {
        headers: { cookie: custCookie }
    });
    assert(custDiag.status === 401 || custDiag.status === 403, `Customer portal user forbidden from diagnostics (HTTP ${custDiag.status})`);

    // ────────────────────────────────────────────────────────────
    // 7. PUPPETEER BROWSER VERIFICATION & DIAGNOSTICS PANEL
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 STEP 7: Browser UI Verification & Diagnostics Panel');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // Authenticate as Admin Madam Hex via session cookie
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('#top-ask-oracle-btn', { timeout: 8000 });
        assert(true, 'Admin Sanctum loaded with Ask Oracle button');

        // Open Ask Mystic AI Chat Drawer
        await page.click('#top-ask-oracle-btn');
        await page.waitForSelector('#oracle-diagnostics-btn', { timeout: 5000 });
        assert(true, 'Oracle Chat drawer opened with Diagnostics button visible');

        // Open Diagnostics Panel
        await page.click('#oracle-diagnostics-btn');
        await page.waitForSelector('::-p-text(AI Provider Diagnostics (Admin Only))', { timeout: 5000 });
        assert(true, 'Admin AI Diagnostics Panel opened successfully');

        // Click Ping button in Diagnostics Panel
        const pingBtn = await page.$('button::-p-text(Test Connection (Ping))');
        if (pingBtn) {
            await pingBtn.click();
            await page.waitForSelector('::-p-text(FALLBACK_ACTIVE), ::-p-text(CONNECTED)', { timeout: 6000 });
            assert(true, 'Live connection ping test executed from UI diagnostics panel');
        }

        // Capture screenshot of Diagnostics Panel in Night Mode
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'groq_ai_diagnostics_panel.png') });
        assert(true, 'Captured screenshot: groq_ai_diagnostics_panel.png');

        // Close Diagnostics Panel & Ask question
        await page.click('#oracle-diagnostics-btn');
        await new Promise(r => setTimeout(r, 300));

        const promptBtn = await page.waitForSelector('button::-p-text(Halloween Depletion)', { timeout: 5000 });
        await promptBtn.click();

        // Wait for response with provider tag
        await page.waitForSelector('::-p-text(Groq Cloud), ::-p-text(Deterministic Heuristic Engine)', { timeout: 15000 });
        assert(true, 'Chat message rendered with visible provider attribution tag');

        // Capture chat with provider tag in Night Mode
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'groq_chat_provider_attribution_night.png') });

        // Switch to Day Mode
        await page.click('#top-theme-toggle');
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'groq_chat_provider_attribution_day.png') });
        assert(true, 'Chat and Diagnostics rendered cleanly in Day Mode');

    } catch (browserErr) {
        console.error('Browser testing error:', browserErr);
        assert(false, `Browser test encountered error: ${browserErr.message}`);
    } finally {
        await browser.close();
    }

    console.log('\n============================================================');
    console.log(`🏁 GROQ AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('============================================================\n');

    process.exit(failed === 0 ? 0 : 1);
}

runGroqAudit().catch(err => {
    console.error('Fatal audit error:', err);
    process.exit(1);
});

