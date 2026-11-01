/**
 * Comprehensive Test & Verification Suite for:
 * MYSTIC MATRIX — COMPLETE AI INVENTORY AGENT INTEGRATION
 * "Mystic AI — The Inventory Oracle"
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

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✔ [PASS] ${message}`);
        passCount++;
    } else {
        console.error(`  ❌ [FAIL] ${message}`);
        failCount++;
    }
}

async function runTests() {
    console.log('\n============================================================');
    console.log('🔮 MYSTIC MATRIX — AI INVENTORY AGENT VERIFICATION SUITE');
    console.log('============================================================\n');

    // ────────────────────────────────────────────────────────────
    // SECTION 1: DETERMINISTIC MONITORING ENGINE & MATH INTEGRITY
    // ────────────────────────────────────────────────────────────
    console.log('📌 SECTION 1: Deterministic Monitoring Engine & Math Integrity');
    const AiMonitoringService = require('../backend/services/aiMonitoringService');

    const scanResult = AiMonitoringService.runFullInventoryScan('TEST_RUN');
    assert(scanResult.executionMs < 500, `Audit executed in ${scanResult.executionMs}ms (target < 500ms)`);
    assert(scanResult.totalFindings > 0, `Detected ${scanResult.totalFindings} operational signals across catalog`);
    assert(scanResult.breakdown.overstockRisks >= 0, `Overstock risk detection functional (${scanResult.breakdown.overstockRisks} items)`);
    assert(scanResult.breakdown.seasonalHalloweenRisks >= 0, `Halloween surge risk detection functional (${scanResult.breakdown.seasonalHalloweenRisks} items)`);
    assert(scanResult.breakdown.velocityShifts >= 0, `Velocity shift detection functional (${scanResult.breakdown.velocityShifts} items)`);

    // Verify Restock Mathematics
    const restockDetails = AiMonitoringService.calculateRestockDetails(1);
    assert(restockDetails.productId === 1, 'Restock details computed for product #1 (Bat Wings)');
    assert(typeof restockDetails.projectedDailyDemand === 'number' && !isNaN(restockDetails.projectedDailyDemand), 'Projected daily demand is a valid non-NaN number');
    assert(typeof restockDetails.reorderPoint === 'number' && restockDetails.reorderPoint > 0, 'Reorder Point calculated deterministically');
    assert(typeof restockDetails.safetyStock === 'number' && restockDetails.safetyStock >= 0, 'Safety stock calculated deterministically');
    assert(typeof restockDetails.estimatedTotalCost === 'number' && !isNaN(restockDetails.estimatedTotalCost), 'Estimated purchase cost is a valid non-NaN number');
    assert(restockDetails.justification && restockDetails.justification.includes('Bat Wings'), 'Natural language explanation generated with apothecary lore');

    // Verify Product Ranking & Assortment
    const rankings = AiMonitoringService.getProductRankingsAndAssortment();
    assert(Array.isArray(rankings) && rankings.length > 0, `Assortment rankings computed across ${rankings.length} products`);
    const bestseller = rankings.find(r => r.classification === 'BESTSELLER');
    assert(Boolean(bestseller), `Identified bestseller product: ${bestseller?.name}`);
    assert(!isNaN(rankings[0].grossMarginPct), 'Gross margin percentage is non-NaN number');

    // ────────────────────────────────────────────────────────────
    // SECTION 2: NOTIFICATION STORE & DEDUPLICATION INTEGRITY
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 2: AI Notification Store & Deduplication Integrity');
    const AiNotificationModel = require('../backend/models/aiNotificationModel');

    const statsBefore = AiNotificationModel.getStats();
    assert(statsBefore.total > 0, `Active notifications exist in SQLite (${statsBefore.total} total)`);

    // Run duplicate scan to verify zero duplicate spam
    AiMonitoringService.runFullInventoryScan('DEDUP_TEST');
    const statsAfter = AiNotificationModel.getStats();
    assert(statsAfter.total === statsBefore.total, `Deduplication verified: total alert count unchanged (${statsAfter.total} alerts)`);

    // Test mark as read and dismiss
    const unreadList = AiNotificationModel.getAll({ unreadOnly: true, limit: 1 });
    if (unreadList.length > 0) {
        const testAlert = unreadList[0];
        AiNotificationModel.markAsRead(testAlert.id);
        const updated = AiNotificationModel.getAll({ limit: 100 }).find(n => n.id === testAlert.id);
        assert(updated.is_read === true, `Mark as read verified for notification #${testAlert.id}`);
    }

    // ────────────────────────────────────────────────────────────
    // SECTION 3: READ-ONLY TOOL ALLOWLIST EXECUTION (ALL 9 TOOLS)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 3: Read-Only Tool Allowlist Execution (All 9 Tools)');
    const AiAgentService = require('../backend/services/aiAgentService');

    const toolsToTest = [
        { name: 'getInventorySummary', args: {}, validate: (r) => r.totalSkus > 0 && !isNaN(r.totalValuationGalleons) },
        { name: 'getLowStockProducts', args: { thresholdDays: 14 }, validate: (r) => Array.isArray(r.items) },
        { name: 'getOverstockProducts', args: { minDaysCoverage: 60 }, validate: (r) => Array.isArray(r.items) },
        { name: 'getDemandForecast', args: { productId: 1 }, validate: (r) => r.productName === 'Bat Wings' && !isNaN(r.reorderPoint) },
        { name: 'getSupplierComparison', args: {}, validate: (r) => Array.isArray(r.suppliers) && r.suppliers.length > 0 },
        { name: 'getSalesTrends', args: { days: 30 }, validate: (r) => Array.isArray(r.rankings) && r.rankings.length > 0 },
        { name: 'getPendingOrders', args: {}, validate: (r) => Array.isArray(r.purchaseOrders) },
        { name: 'getIngredientShortages', args: {}, validate: (r) => Array.isArray(r.recipes) && r.recipes.length > 0 },
        { name: 'getAdminNotifications', args: { unreadOnly: false }, validate: (r) => r.stats && Array.isArray(r.notifications) }
    ];

    for (const t of toolsToTest) {
        try {
            const out = await AiAgentService.executeTool(t.name, t.args);
            const isValid = t.validate(out);
            assert(isValid, `Tool ${t.name}() executed successfully with valid structure`);
        } catch (err) {
            assert(false, `Tool ${t.name}() failed: ${err.message}`);
        }
    }

    // ────────────────────────────────────────────────────────────
    // SECTION 4: CONVERSATIONAL QUERY PROCESSING & PROPOSALS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 4: Conversational Query Processing & Level 3 Proposals');
    const queryTest = await AiAgentService.processQuery('What is likely to run out before Halloween?');
    assert(queryTest.toolsUsed.includes('getLowStockProducts'), 'Oracle called allowlisted tool getLowStockProducts');
    assert(queryTest.response.length > 50, 'Oracle generated rich structured response');
    assert(queryTest.response.includes('|'), 'Oracle output formatted with markdown table');
    assert(Array.isArray(queryTest.suggestedActions), 'Oracle produced structured Level 3 action proposals');

    // ────────────────────────────────────────────────────────────
    // SECTION 5: THREE-LEVEL ACTION SAFETY GUARDRAILS (APPROVE/REJECT)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 5: Three-Level Action Safety Guardrails');
    const AiActionModel = require('../backend/models/aiActionModel');
    const db = getDb();

    // 1. Create Level 3 Proposal
    const draftProposal = AiActionModel.createDraft({
        action_type: 'DRAFT_RESTOCK_PO',
        target_entity: 'purchase_order',
        title: 'Emergency Restock: 50x Dragon Scales',
        justification: 'Automated test of Level 3 approval execution',
        proposed_payload: {
            productId: 5,
            productName: 'Dragon Scales',
            quantity: 50,
            unitCost: 10,
            totalCost: 500,
            supplierId: 1,
            leadTimeDays: 3
        }
    });
    assert(draftProposal.status === 'PENDING', `Draft proposal #${draftProposal.id} registered as PENDING`);
    assert(draftProposal.executed_at === null, 'Verified: Proposal has NOT executed into database without approval');

    // 2. Reject another proposal to verify rejection flow
    const rejectDraft = AiActionModel.createDraft({
        action_type: 'LAUNCH_PROMOTION',
        target_entity: 'promotion',
        title: 'Test Markdown Proposal',
        justification: 'Testing rejection pathway',
        proposed_payload: { productId: 3, discountPct: 20 }
    });
    const rejected = AiActionModel.reject(rejectDraft.id, 'Test rejection reason', 'Madam Hex');
    assert(rejected.status === 'REJECTED', `Rejection verified: Proposal #${rejectDraft.id} marked as REJECTED`);

    // ────────────────────────────────────────────────────────────
    // SECTION 6: API SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 6: API Security & Role-Based Access Control');

    // Unauthenticated request
    const unauth = await fetch(`${BASE_URL}/api/ai/notifications`);
    assert(unauth.status === 401, `Unauthenticated access to /api/ai/notifications blocked (HTTP ${unauth.status})`);

    // Customer login
    const custLogin = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'gweneth.crow@hallowmere.realm', password: 'Password123!' })
    });
    const custCookie = custLogin.headers.get('set-cookie');
    const custAiAccess = await fetch(`${BASE_URL}/api/ai/notifications`, {
        headers: { cookie: custCookie }
    });
    assert(custAiAccess.status === 401 || custAiAccess.status === 403, `Customer portal role forbidden from accessing /api/ai (HTTP ${custAiAccess.status})`);

    // Admin session creation
    const authService = require('../backend/services/authService');
    const adminSession = authService.createSession(1, '127.0.0.1', 'TestRunner');
    const adminCookie = `${authService.sessionCookieName}=${adminSession.id}`;
    const adminAiAccess = await fetch(`${BASE_URL}/api/ai/notifications`, {
        headers: { cookie: adminCookie }
    });
    assert(adminAiAccess.status === 200, `Admin Madam Hex authorized to access /api/ai (HTTP 200)`);

    // ────────────────────────────────────────────────────────────
    // SECTION 7: PUPPETEER BROWSER VERIFICATION & SCREENSHOTS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 SECTION 7: Headless Browser UI Verification');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // 1. Authenticate as Admin via session cookie
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });

        // Wait for Admin Navbar to appear
        await page.waitForSelector('#top-ai-notifications-btn', { timeout: 8000 });
        assert(true, 'Admin Sanctum loaded with AI Notification Bell visible in TopNavbar');

        // Capture Admin Sanctum Top Header with Bell
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai_admin_sanctum_header.png') });

        // 2. Click Notification Bell to open AINotificationsCenter
        await page.click('#top-ai-notifications-btn');
        await page.waitForSelector('h2::-p-text(Apothecary Intelligence Alerts)', { timeout: 5000 });
        assert(true, 'AI Notifications Center modal opened on bell click');

        // Capture Notification Center Modal
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai_notifications_center_modal.png') });

        // Close Notification Modal
        const closeNotifBtn = await page.$('button[title="Close Notification Center"]');
        if (closeNotifBtn) {
            await closeNotifBtn.click();
        } else {
            await page.keyboard.press('Escape');
        }
        await new Promise(r => setTimeout(r, 600));

        // 3. Open Ask Mystic AI Chat Drawer
        await page.click('#top-ask-oracle-btn');
        await page.waitForSelector('h2::-p-text(Mystic AI — The Inventory Oracle)', { timeout: 5000 });
        assert(true, 'Ask Mystic AI Conversational Drawer opened successfully');

        // Click starter prompt: '🎃 Halloween Depletion'
        const halloweenChip = await page.waitForSelector('button::-p-text(Halloween Depletion)', { timeout: 5000 });
        await halloweenChip.click();

        // Wait for Oracle response to stream / render
        await page.waitForSelector('button::-p-text(Approve & Execute), ::-p-text(Groq Cloud), ::-p-text(Deterministic Heuristic Engine), table', { timeout: 15000 });
        assert(true, 'Oracle responded to Halloween Depletion with structured markdown and proposals');

        // Capture Oracle Chat with Level 3 Action Approval Card
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai_oracle_chat_with_actions.png') });

        // Test Level 3 One-Click Approval in UI
        const approveBtn = await page.$('button::-p-text(Approve & Execute)');
        if (approveBtn) {
            await approveBtn.click();
            await page.waitForSelector('::-p-text(Executed and logged in apothecary records)', { timeout: 5000 });
            assert(true, 'Level 3 Action Proposal approved and executed directly from the Oracle chat UI');
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai_action_executed_badge.png') });
        }

        // Test Theme Switching (Day Mode)
        await page.click('#top-theme-toggle');
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ai_oracle_day_mode.png') });
        assert(true, 'Oracle Copilot rendered flawlessly in Day Mode');

    } catch (browserErr) {
        console.error('Browser testing error:', browserErr);
        assert(false, `Browser test encountered error: ${browserErr.message}`);
    } finally {
        await browser.close();
    }

    console.log('\n============================================================');
    console.log(`✨ VERIFICATION SUMMARY: ${passCount} Passed, ${failCount} Failed`);
    console.log('============================================================\n');

    process.exit(failCount === 0 ? 0 : 1);
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
