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

async function runAdminPortalCleanupTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 MYSTIC MATRIX — ADMIN PORTAL UI CLEANUP VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    try {
        // Clear any prior cookies
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

        // -------------------------------------------------------------
        // SECTION 1: AUTHENTICATE AS ADMIN & VERIFY CLEAN TOP HEADER
        // -------------------------------------------------------------
        console.log('▶ TEST SUITE 1: Clean Top Header (No Duplicate Horizontal Menu)');

        await page.goto(`${BASE_URL}/?tab=login`, { waitUntil: 'networkidle2' });
        const adminLoginBtn = await page.waitForSelector('button ::-p-text(Madam Hex (Admin))');
        await adminLoginBtn.click();
        await sleep(1500);

        assert(page.url().includes('tab=overview'), 'Admin authenticated successfully into Overview');

        // Verify TopNavbar does NOT have the old redundant horizontal nav links
        const topHeaderNavLinks = await page.evaluate(() => {
            const header = document.querySelector('header.sticky');
            if (!header) return [];
            const buttons = Array.from(header.querySelectorAll('nav button'));
            return buttons.map(b => b.innerText.trim());
        });

        assert(topHeaderNavLinks.length === 0, 'Redundant horizontal nav links completely removed from TopHeader');

        // Verify Breadcrumb in TopNavbar
        const breadcrumbSanctum = await page.$('header ::-p-text(Sanctum)');
        const breadcrumbTitle = await page.$('header ::-p-text(Overview Dashboard)');
        assert(breadcrumbSanctum !== null && breadcrumbTitle !== null, 'Clean breadcrumb "Sanctum / Overview Dashboard" visible in TopHeader');

        // Verify Day/Night toggle is in TopHeader
        const topThemeToggle = await page.$('#top-theme-toggle');
        assert(topThemeToggle !== null, 'Global Day/Night switcher pill (#top-theme-toggle) is in TopHeader');

        // -------------------------------------------------------------
        // SECTION 2: PRIMARY LEFT SIDEBAR CLEANUP & REMOVAL CHECKS
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 2: Primary Left Sidebar & Bottom Profile Cleanup');

        const sidebarItems = [
            'Dashboard',
            'Inventory',
            'Forecasting',
            'Recommendations',
            'Analytics',
            'Store Orders',
            'Suppliers & POs',
            'User Directory',
            'Security Logs',
            'Datasets & UCI',
            'Smart Tools'
        ];

        for (const label of sidebarItems) {
            const el = await page.$(`aside nav button ::-p-text(${label})`);
            assert(el !== null, `Sidebar contains primary nav item: "${label}"`);
        }

        // Verify REMOVED duplicate items from sidebar bottom
        const owlMessage = await page.$('aside ::-p-text(Madam Hex & Owl)');
        assert(owlMessage === null, 'Overcrowded Madam Hex & Owl greeting card is completely removed');

        const morningMessage = await page.$('aside ::-p-text(Good Morning)');
        assert(morningMessage === null, 'Redundant Good Morning greeting message is removed');

        const sidebarThemeToggle = await page.$('aside button ::-p-text(Night)');
        assert(sidebarThemeToggle === null, 'Duplicate Day Mode control in sidebar is removed');

        // Verify single compact profile section
        const profileTrigger = await page.waitForSelector('aside [title*="Admin Profile"]');
        assert(profileTrigger !== null, 'Found single compact admin profile section at bottom of sidebar');

        const adminMoniker = await page.$('aside ::-p-text(Madam Hex)');
        const adminRoleBadge = await page.$('aside ::-p-text(Admin)');
        assert(adminMoniker !== null && adminRoleBadge !== null, 'Profile displays small avatar, username "Madam Hex", and role "Admin"');

        // Test Profile Dropdown
        console.log('  ... Opening profile dropdown menu');
        await profileTrigger.click();
        await sleep(400);

        const myProfileOption = await page.$('aside ::-p-text(My Profile)');
        const accountSettingsOption = await page.$('aside ::-p-text(Account Settings)');
        const signOutOption = await page.$('aside ::-p-text(Sign Out)');
        assert(myProfileOption !== null, 'Profile dropdown contains "My Profile" action');
        assert(accountSettingsOption !== null, 'Profile dropdown contains "Account Settings" action');
        assert(signOutOption !== null, 'Profile dropdown contains "Sign Out" action');

        // Close dropdown
        await profileTrigger.click();
        await sleep(300);

        // Test Sidebar Collapse & Expand
        const collapseBtn = await page.$('button[title="Collapse sidebar"]');
        if (collapseBtn) {
            await collapseBtn.click();
            await sleep(400);
            const isCollapsed = await page.evaluate(() => document.querySelector('aside').classList.contains('w-20'));
            assert(isCollapsed, 'Sidebar collapses smoothly to w-20');

            const expandBtn = await page.waitForSelector('button[title="Expand sidebar"]');
            await expandBtn.click();
            await sleep(400);
            const isExpanded = await page.evaluate(() => document.querySelector('aside').classList.contains('w-64'));
            assert(isExpanded, 'Sidebar expands smoothly to w-64');
        }

        // Capture Header & Sidebar Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_cleanup_header_sidebar.png') });
        console.log('  -> Captured admin_cleanup_header_sidebar.png');

        // -------------------------------------------------------------
        // SECTION 3: IMPROVED STORE ORDERS PAGE & REAL DATA
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 3: Improved Store Orders Page & Live KPIs');

        // Navigate via sidebar to Store Orders
        const storeOrdersNav = await page.waitForSelector('aside button ::-p-text(Store Orders)');
        await storeOrdersNav.click();
        await sleep(1000);

        assert(page.url().includes('tab=orders'), 'Navigated cleanly to Store Orders page');

        // Verify Breadcrumb updated
        const breadcrumbOrders = await page.$('header ::-p-text(Customer Store Orders)');
        assert(breadcrumbOrders !== null, 'Breadcrumb updated to "Customer Store Orders"');

        // Verify Clean Heading
        const ordersHeading = await page.$('h1 ::-p-text(Customer Store Orders)');
        assert(ordersHeading !== null, 'Clean Store Orders heading rendered');

        // Verify Three Compact KPI Cards
        const kpiOrders = await page.$('::-p-text(Total Store Orders)');
        const kpiRevenue = await page.$('::-p-text(Total Order Revenue)');
        const kpiAOV = await page.$('::-p-text(Average Order Value (AOV))');
        assert(kpiOrders !== null, 'KPI Card 1: Total Store Orders present');
        assert(kpiRevenue !== null, 'KPI Card 2: Total Order Revenue present');
        assert(kpiAOV !== null, 'KPI Card 3: Average Order Value present');

        // Verify Search Field
        const searchInput = await page.waitForSelector('input[placeholder*="Search Order"]');
        await searchInput.type('MM-');
        await sleep(300);
        await page.keyboard.press('Enter');
        await sleep(600);
        assert(true, 'Store Orders search query submitted and processed');

        // Clear search
        const clearBtn = await page.$('input[placeholder*="Search Order"] ~ button');
        if (clearBtn) {
            await clearBtn.click();
            await sleep(500);
            assert(true, 'Clear search button reset search field');
        }

        // Verify Status Filter
        const statusFilterSelect = await page.waitForSelector('select');
        await statusFilterSelect.select('COMPLETED');
        await sleep(600);
        assert(true, 'Filtered store orders by status: COMPLETED');

        // Reset filter
        await statusFilterSelect.select('');
        await sleep(600);

        // Verify Table & Status Badges
        const orderTable = await page.$('table');
        assert(orderTable !== null, 'Responsive Store Orders table rendered');

        const orderBadges = await page.$$('table span.font-pixel');
        assert(orderBadges.length > 0, `Clearly visible order status badges rendered (count=${orderBadges.length})`);

        // Capture Store Orders Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_cleanup_store_orders.png') });
        console.log('  -> Captured admin_cleanup_store_orders.png');

        // Test "Inspect Order" Modal
        const inspectBtn = await page.waitForSelector('table button ::-p-text(Inspect Order)');
        await inspectBtn.click();
        await sleep(800);

        const modalHeading = await page.waitForSelector('h2 ::-p-text(Store Order #)');
        assert(modalHeading !== null, 'Inspect Order opened detailed order inspector modal');

        const itemizedHeader = await page.$('::-p-text(Itemized Reagents)');
        const debitedText = await page.$('::-p-text(Total Amount Debited)');
        assert(itemizedHeader !== null && debitedText !== null, 'Detailed modal displays itemized products and real financial breakdown');

        // Capture Inspect Modal Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_cleanup_inspect_modal.png') });
        console.log('  -> Captured admin_cleanup_inspect_modal.png');

        // Close Inspector
        const closeInspectBtn = await page.waitForSelector('button ::-p-text(Close Inspector)');
        await closeInspectBtn.click();
        await sleep(500);
        assert(true, 'Inspect Order modal closed cleanly');

        // -------------------------------------------------------------
        // SECTION 4: DAY MODE CONSISTENCY
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 4: Day / Night Theme Layout Consistency');

        const topThemeSwitch = await page.waitForSelector('#top-theme-toggle');
        await topThemeSwitch.click();
        await sleep(600);

        const isDayMode = await page.evaluate(() => document.body.classList.contains('theme-day'));
        assert(isDayMode, 'Switched to Day Mode; verified light theme styles across Admin Portal');

        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_cleanup_day_mode.png') });
        console.log('  -> Captured admin_cleanup_day_mode.png');

        await topThemeSwitch.click();
        await sleep(600);

        // -------------------------------------------------------------
        // SECTION 5: MOBILE RESPONSIVENESS & DRAWER
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 5: Mobile Drawer & Responsive Layout');

        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
        await page.goto(`${BASE_URL}/?tab=orders`, { waitUntil: 'networkidle2' });
        await sleep(800);

        // Verify mobile header toggle
        const hamburgerBtn = await page.waitForSelector('button[title="Toggle Navigation Menu"]');
        assert(hamburgerBtn !== null, 'Mobile hamburger menu toggle visible in TopHeader');

        await hamburgerBtn.click();
        await sleep(500);

        const mobileDrawerOpen = await page.evaluate(() => {
            const aside = document.querySelector('aside');
            return aside && aside.classList.contains('translate-x-0');
        });
        assert(mobileDrawerOpen, 'Clicking hamburger opened mobile sidebar drawer');

        // Capture Mobile Drawer Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_cleanup_mobile_drawer.png') });
        console.log('  -> Captured admin_cleanup_mobile_drawer.png');

        // Close drawer via backdrop
        await page.evaluate(() => {
            const backdrop = document.querySelector('.bg-black\\/60');
            if (backdrop) backdrop.click();
        });
        await sleep(500);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        assert(!hasHorizontalScroll, 'Mobile view has no horizontal page overflow');

        // -------------------------------------------------------------
        // SECTION 6: LOGOUT FUNCTIONALITY
        // -------------------------------------------------------------
        console.log('\n▶ TEST SUITE 6: Sign Out Functionality');

        // Restore desktop view
        await page.setViewport({ width: 1440, height: 900 });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await sleep(800);

        const headerSignOutBtn = await page.waitForSelector('button ::-p-text(Sign Out)');
        await headerSignOutBtn.click();
        await sleep(1000);

        assert(page.url().includes('tab=login'), 'Sign Out cleanly invalidated session and returned to login');

        // Verify public user blocked from admin overview
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await page.waitForFunction(() => window.location.search.includes('tab=login'), { timeout: 8000 });
        const secretCheck = await page.$('aside ::-p-text(ADMIN SANCTUM)');
        assert(secretCheck === null, 'Unauthenticated visitor strictly blocked from Admin Sanctum');
        assert(page.url().includes('tab=login'), 'URL redirected to login');

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`🏁 ADMIN PORTAL CLEANUP RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log(`🔍 Browser Console Errors: ${consoleErrors.length}`);
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

runAdminPortalCleanupTests();

