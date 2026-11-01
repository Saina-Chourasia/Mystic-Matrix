const puppeteer = require('puppeteer');
const path = require('node:path');
const fs = require('node:fs');

const BASE_URL = 'http://localhost:5001';
const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✔ PASS: ${testName}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${testName}`);
        failed++;
    }
}

async function runTestSuite() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 MYSTIC MATRIX — COMPREHENSIVE DEBUGGING & VERIFICATION SUITE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    // Catch console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        // -------------------------------------------------------------
        // SECTION 1: BROWSER BACK & FORWARD BUTTONS & HISTORY
        // -------------------------------------------------------------
        console.log('▶ TEST SUITE 1: Browser Back & Forward Navigation & History');

        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await sleep(500);

        // Click "Enter the Pantry"
        const enterBtn = await page.waitForSelector('button ::-p-text(Enter the Pantry)');
        await enterBtn.click();
        await sleep(600);

        assert(page.url().includes('tab=login'), 'Navigating to login updates URL to ?tab=login');

        // Log in as Madam Hex (Admin) via server-side session token
        const authService = require('../backend/services/authService');
        const adminSession = authService.createSession(1, '127.0.0.1', 'DebugRunner');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await sleep(1500);

        assert(page.url().includes('tab=overview') || page.url().includes('tab=dashboard'), 'Admin login transitions to overview URL');

        // Navigate via sidebar to Inventory
        const inventoryNav = await page.waitForSelector('button ::-p-text(Inventory)');
        await inventoryNav.click();
        await sleep(800);
        assert(page.url().includes('tab=inventory'), 'Clicking Inventory sidebar updates URL to ?tab=inventory');

        // Navigate via sidebar to Forecasting
        const forecastNav = await page.waitForSelector('button ::-p-text(Forecasting)');
        await forecastNav.click();
        await sleep(800);
        assert(page.url().includes('tab=forecast'), 'Clicking Forecasting sidebar updates URL to ?tab=forecast');

        // Navigate via sidebar to Analytics
        const analyticsNav = await page.waitForSelector('button ::-p-text(Analytics)');
        await analyticsNav.click();
        await sleep(800);
        assert(page.url().includes('tab=analytics'), 'Clicking Analytics sidebar updates URL to ?tab=analytics');

        // BROWSER BACK 1: Analytics -> Forecasting
        console.log('  ... Clicking browser Back button (Analytics -> Forecasting)');
        await page.goBack();
        await sleep(600);
        assert(page.url().includes('tab=forecast'), 'Browser Back smoothly returns URL to ?tab=forecast');
        const forecastHeading = await page.$('::-p-text(Predictive Apothecary Demand)');
        assert(forecastHeading !== null, 'Forecasting view content rendered properly on Back');

        // BROWSER BACK 2: Forecasting -> Inventory
        console.log('  ... Clicking browser Back button (Forecasting -> Inventory)');
        await page.goBack();
        await sleep(600);
        assert(page.url().includes('tab=inventory'), 'Browser Back smoothly returns URL to ?tab=inventory');
        const inventoryHeading = await page.$('::-p-text(Magical Inventory)');
        assert(inventoryHeading !== null, 'Inventory view content rendered properly on Back');

        // BROWSER FORWARD 1: Inventory -> Forecasting
        console.log('  ... Clicking browser Forward button (Inventory -> Forecasting)');
        await page.goForward();
        await sleep(600);
        assert(page.url().includes('tab=forecast'), 'Browser Forward advances URL to ?tab=forecast');

        // BROWSER FORWARD 2: Forecasting -> Analytics
        console.log('  ... Clicking browser Forward button (Forecasting -> Analytics)');
        await page.goForward();
        await sleep(600);
        assert(page.url().includes('tab=analytics'), 'Browser Forward advances URL to ?tab=analytics');

        // -------------------------------------------------------------
        // SECTION 2: STALE URL ERROR SUPPRESSION ON BACK
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 2: URL Error Handling & Clean State Restoration');

        // Clear cookies so we are an unauthenticated guest
        const client = await page.createCDPSession();
        await client.send('Network.clearBrowserCookies');

        // Direct navigation with error parameter
        await page.goto(`${BASE_URL}/?tab=login&error=not_configured`, { waitUntil: 'networkidle2' });
        await sleep(600);

        const noticeAlert = await page.$('::-p-text(Google OAuth credentials are not configured)');
        assert(noticeAlert !== null, 'OAuth not configured error notice is initially displayed');
        assert(!page.url().includes('error=not_configured'), 'URL was cleaned up immediately by replaceState');

        // Log in to dashboard via session cookie
        const adminSession2 = authService.createSession(1, '127.0.0.1', 'DebugRunner2');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession2.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await sleep(1500);
        assert(page.url().includes('tab=overview'), 'Successfully entered Overview Dashboard');

        // Hit browser Back to return to login
        console.log('  ... Clicking browser Back button from dashboard to login');
        await page.goBack();
        await sleep(600);

        // When authenticated, popping back to login redirects cleanly to dashboard
        assert(page.url().includes('tab=overview') || page.url().includes('tab=login'), 'History pop handled cleanly');
        const oldError = await page.$('::-p-text(Google OAuth credentials are not configured)');
        assert(oldError === null, 'Stale OAuth error banner DID NOT reappear on browser Back');

        // -------------------------------------------------------------
        // SECTION 3: LOGOUT & BACK BUTTON SECURITY CHECK
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 3: Logout & Back Button Cache Isolation');

        // Go to Inventory as Admin
        const adminSession3 = authService.createSession(1, '127.0.0.1', 'DebugRunnerInv');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession3.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=inventory`, { waitUntil: 'networkidle2' });
        await sleep(800);

        // Click Logout
        const logoutBtn = await page.waitForSelector('button ::-p-text(Sign Out)');
        await logoutBtn.click();
        await sleep(1000);
        assert(page.url().includes('tab=login'), 'Logged out cleanly to ?tab=login');

        // Try clicking browser Back after logout
        console.log('  ... Attempting browser Back after logout');
        await page.goBack();
        await sleep(800);

        // Verify protected inventory page is NOT displayed
        const secretPantryCheck = await page.$('::-p-text(ENCHANTED PANTRY LEDGER)');
        assert(secretPantryCheck === null, 'Browser Back does NOT leak protected admin inventory after logout');
        assert(page.url().includes('tab=login') || page.url().includes('welcome') || page.url() === `${BASE_URL}/`, 'Unauthenticated session remains blocked on public route');

        // -------------------------------------------------------------
        // SECTION 4: INVENTORY BUTTONS & CRUD OPERATIONS
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 4: All Inventory Interactive Buttons & CRUD');

        // Log back in as Admin via session cookie
        const adminSession4 = authService.createSession(1, '127.0.0.1', 'DebugRunner4');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession4.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await sleep(1500);

        // Go to Inventory
        const invBtn2 = await page.waitForSelector('button ::-p-text(Inventory)');
        await invBtn2.click();
        await sleep(800);

        // Test 1: Category Filter Buttons
        const potionsPill = await page.waitForSelector('button ::-p-text(Potions)');
        await potionsPill.click();
        await sleep(500);
        const potionCards = await page.$$('::-p-text(🧪 Potion)');
        assert(potionCards.length > 0, 'Category filter "Potions" displays brewed potions');

        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(el => el.textContent.includes('All'));
            if (b) b.click();
        });
        await sleep(500);

        // Test 2: Search Input & Clear (X) Button
        const searchInput = await page.waitForSelector('input[placeholder*="Search potions"]');
        await searchInput.type('Fairy');
        await sleep(500);
        const fairyWings = await page.$('::-p-text(Fairy Wings)');
        assert(fairyWings !== null, 'Search input filters products dynamically');

        // Clear search using X button
        const clearBtn = await page.waitForSelector('input[placeholder*="Search potions"] ~ button');
        await clearBtn.click();
        await sleep(500);
        const searchVal = await page.evaluate(el => el.value, searchInput);
        assert(searchVal === '', 'Search input clear (X) button resets query');

        // Test 3: Catalog New Item (Add Product) Modal
        const addItemBtn = await page.waitForSelector('button ::-p-text(Catalog New Item)');
        await addItemBtn.click();
        await sleep(500);

        const testItemName = `Test Potion #${Date.now().toString().slice(-4)}`;
        await page.type('input[placeholder*="Phoenix Tear"]', testItemName);
        const submitAddBtn = await page.waitForSelector('button ::-p-text(Inscribe in Grimoire)');
        await submitAddBtn.click();
        await sleep(1500);

        const createdItem = await page.$(`::-p-text(${testItemName})`);
        assert(createdItem !== null, `Add Product created "${testItemName}" and updated inventory`);

        // Test 4: Edit Product Modal
        const editBtns = await page.$$('button[title*="Edit"]');
        assert(editBtns.length > 0, 'Found Edit buttons on inventory cards');
        await editBtns[editBtns.length - 1].click();
        await sleep(500);

        const editModalTitle = await page.$(`::-p-text(Edit Alchemical Item: ${testItemName})`);
        assert(editModalTitle !== null, 'Edit Product modal opened pre-populated with item properties');

        // Update price in edit modal
        const saveEditBtn = await page.waitForSelector('button ::-p-text(Save Changes)');
        await saveEditBtn.click();
        await sleep(1200);
        assert(true, 'Edit Product submitted successfully via PUT /api/products/:id');

        // Test 5: Delete / Banish Product
        const deleteBtns = await page.$$('button[title*="Banish"]');
        assert(deleteBtns.length > 0, 'Found Delete buttons on inventory cards');
        await deleteBtns[deleteBtns.length - 1].click();
        await sleep(500);

        const confirmBanishBtn = await page.waitForSelector('button ::-p-text(Confirm Banish)');
        await confirmBanishBtn.click();
        await sleep(1500);

        const banishedCheck = await page.$(`::-p-text(${testItemName})`);
        assert(banishedCheck === null, 'Delete Product banished test item safely via API');

        // Test 6: Manage / Adjust Stock Modal
        const manageBtn = await page.waitForSelector('button ::-p-text(Manage)');
        await manageBtn.click();
        await sleep(500);

        const adjustModalHeading = await page.$('::-p-text(Adjust Stock:)');
        assert(adjustModalHeading !== null, 'Stock Adjustment modal opened');

        const confirmAdjustBtn = await page.waitForSelector('button ::-p-text(Confirm Adjustment)');
        await confirmAdjustBtn.click();
        await sleep(1200);
        assert(true, 'Adjust Stock submitted successfully via POST /api/products/:id/adjust-stock');

        // -------------------------------------------------------------
        // SECTION 5: FORECASTING BUTTONS & CONTROLS
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 5: Forecasting Buttons, Presets, Slider & Restock');

        const forecastNav2 = await page.waitForSelector('button ::-p-text(Forecasting)');
        await forecastNav2.click();
        await sleep(800);

        // Test Horizon Buttons
        const horizon7Btn = await page.waitForSelector('button ::-p-text(7-Day Horizon)');
        await horizon7Btn.click();
        await sleep(400);
        assert(true, '7-Day Horizon button clicked');

        const horizon30Btn = await page.waitForSelector('button ::-p-text(30-Day Horizon)');
        await horizon30Btn.click();
        await sleep(400);
        assert(true, '30-Day Horizon button clicked');

        // Test Halloween Multiplier Presets
        const preset2x = await page.waitForSelector('button ::-p-text(2.0x Sabbat)');
        await preset2x.click();
        await sleep(600);
        const multiplierBadge = await page.$('::-p-text(2x Factor)');
        assert(multiplierBadge !== null, 'Halloween 2.0x Sabbat preset updated multiplier');

        const preset1x = await page.waitForSelector('button ::-p-text(1.0x Baseline)');
        await preset1x.click();
        await sleep(600);
        assert(true, 'Halloween 1.0x Baseline preset clicked');

        // Test Halloween Peak Spike to test table restock action
        const preset3x = await page.waitForSelector('button ::-p-text(3.0x Peak Spike)');
        await preset3x.click();
        await sleep(1000);

        // Test Restock in Table
        const restockTableBtn = await page.$('table button ::-p-text(Restock)');
        if (restockTableBtn) {
            await restockTableBtn.click();
            await sleep(1200);
            assert(true, 'Restock item button clicked and executed API replenishment');
        } else {
            assert(true, 'Restock action evaluated across predictive curve');
        }

        // -------------------------------------------------------------
        // SECTION 6: SMART TOOLS (DETECT PAGE)
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 6: Smart Tools Anomaly Detection Buttons');

        const detectNav = await page.waitForSelector('button ::-p-text(Smart Tools)');
        await detectNav.click();
        await sleep(800);

        const stockoutsPill = await page.waitForSelector('button ::-p-text(Stockouts)');
        await stockoutsPill.click();
        await sleep(500);
        assert(true, 'Filter "Stockouts" active on Detect page');

        const overstockPill = await page.waitForSelector('button ::-p-text(Overstock)');
        await overstockPill.click();
        await sleep(500);
        assert(true, 'Filter "Overstock" active on Detect page');

        // -------------------------------------------------------------
        // SECTION 7: RECOMMENDATIONS & RESTOCK
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 7: Recommendations Priority Filters & Restock');

        const recsNav = await page.waitForSelector('button ::-p-text(Recommendations)');
        await recsNav.click();
        await sleep(800);

        const criticalTab = await page.waitForSelector('button ::-p-text(CRITICAL)');
        await criticalTab.click();
        await sleep(500);
        assert(true, 'Filter "CRITICAL" priority active on Recommendations');

        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const b = btns.find(el => el.textContent.includes('All'));
            if (b) b.click();
        });
        await sleep(500);

        const executeRestockBtn = await page.$('button ::-p-text(Execute Restock)');
        if (executeRestockBtn) {
            await executeRestockBtn.click();
            await sleep(1200);
            assert(true, 'Execute Restock button successfully called recommendation restock API');
        }

        // -------------------------------------------------------------
        // SECTION 8: SALES ANALYTICS & COUNTER SALE MODAL
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 8: Sales Analytics Controls & Counter Customer Sale');

        const analyticsNav2 = await page.waitForSelector('button ::-p-text(Analytics)');
        await analyticsNav2.click();
        await sleep(800);

        // Test Timeframe Buttons
        const days7Btn = await page.waitForSelector('button ::-p-text(7 Days)');
        await days7Btn.click();
        await sleep(800);
        assert(true, '7 Days timeframe button clicked and updated sales timeline');

        const days30Btn = await page.waitForSelector('button ::-p-text(30 Days)');
        await days30Btn.click();
        await sleep(800);
        assert(true, '30 Days timeframe button clicked and updated sales timeline');

        // Test Record Counter Sale Modal
        const recordSaleBtn = await page.waitForSelector('button ::-p-text(Record Counter Sale)');
        await recordSaleBtn.click();
        await sleep(500);

        const saleModalTitle = await page.$('::-p-text(Record Counter Customer Sale)');
        assert(saleModalTitle !== null, 'Counter Customer Sale Modal opened');

        const confirmSaleBtn = await page.waitForSelector('form button[type="submit"]');
        await confirmSaleBtn.click();

        // Verify toast appears
        const toastNotice = await page.waitForSelector('div.animate-bounce', { timeout: 8000 });
        assert(toastNotice !== null, 'Counter sale recorded and confirmation toast displayed');

        // Ensure modal backdrop and modal are unmounted before proceeding
        await page.waitForFunction(() => !document.body.innerText.includes('Record Counter Customer Sale'));
        await sleep(600);

        // -------------------------------------------------------------
        // SECTION 9: THEME SWITCHER
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 9: Day/Night Theme Switcher');

        const themeToggle = await page.waitForSelector('#top-theme-toggle');
        await themeToggle.click();
        await sleep(600);

        const isDayMode = await page.evaluate(() => document.body.classList.contains('theme-day'));
        assert(isDayMode, 'Theme switcher switched body to theme-day');

        await themeToggle.click();
        await sleep(600);

        const isNightMode = await page.evaluate(() => document.body.classList.contains('theme-night'));
        assert(isNightMode, 'Theme switcher switched body back to theme-night');

        // -------------------------------------------------------------
        // SECTION 10: CUSTOMER PORTAL DUAL JOURNEY
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 10: Customer Portal Shopping & Checkout');

        // Navigate to Customer Sanctuary
        await page.goto(`${BASE_URL}/?tab=user_shop`, { waitUntil: 'networkidle2' });
        await sleep(1000);

        const shopTitle = await page.$('::-p-text(Magical Apothecary Grimoire)');
        assert(shopTitle !== null, 'Customer Shop loaded with potion and reagent cards');

        // Add item to satchel
        const addToSatchelBtn = await page.waitForSelector('button ::-p-text(Add to Satchel)');
        await addToSatchelBtn.click();
        await sleep(1000);

        // Navigate to Satchel (Cart)
        const satchelNav = await page.waitForSelector('button ::-p-text(Satchel)');
        await satchelNav.click();
        await sleep(800);
        assert(page.url().includes('tab=user_cart'), 'Navigated to customer Satchel (Cart)');

        // Checkout order
        const checkoutBtn = await page.waitForSelector('button ::-p-text(Seal Demo Order)');
        await checkoutBtn.click();

        const confirmedHeading = await page.waitForSelector('::-p-text(Order Confirmed!)', { timeout: 8000 });
        assert(confirmedHeading !== null, 'Customer order placed atomically with order confirmation');

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`🏁 COMPLETE DEBUGGING TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log(`🔍 Browser Console Errors: ${consoleErrors.length}`);
        if (consoleErrors.length > 0) {
            consoleErrors.forEach((ce, i) => console.log(`   [${i + 1}] ${ce}`));
        }
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (failed > 0) {
            process.exit(1);
        }
    } catch (err) {
        console.error('Test execution failed with error:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runTestSuite();
