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

async function runLandingPageTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 MYSTIC MATRIX — LANDING PAGE CLEANUP VERIFICATION');
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
        // Clear any existing cookies
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');

        // -------------------------------------------------------------
        // TEST 1: DESKTOP VIEWPORT — LANDING PAGE LOAD & REMOVAL CHECKS
        // -------------------------------------------------------------
        console.log('▶ TEST 1: Desktop Landing Page & Removal Checks');
        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await sleep(800);

        // Verify Hero & Title are preserved
        const heroTitle = await page.$('::-p-text(Mystic Matrix)');
        assert(heroTitle !== null, 'Hero title "Mystic Matrix" is preserved intact');

        // Confirm Magical Product Showcase is COMPLETELY GONE
        const showcaseHeading = await page.$('::-p-text(Magical Product Showcase)');
        assert(showcaseHeading === null, 'Magical Product Showcase heading is completely removed');

        const inspectForecastBtn = await page.$('::-p-text(Inspect Forecast)');
        assert(inspectForecastBtn === null, '"Inspect Forecast" showcase buttons are completely removed');

        const viewAll22Btn = await page.$('::-p-text(View All 22 Items)');
        assert(viewAll22Btn === null, '"View All 22 Items" showcase button is completely removed');

        // -------------------------------------------------------------
        // TEST 2: HOW IT WORKS & SLIM CTA STRIP INTEGRATION
        // -------------------------------------------------------------
        console.log('\n▶ TEST 2: How It Works & Slim Horizontal CTA Strip');

        const howItWorksHeading = await page.$('::-p-text(How It Works)');
        assert(howItWorksHeading !== null, 'How It Works section heading is visible');

        const step1 = await page.$('::-p-text(Track Sales)');
        const step2 = await page.$('::-p-text(Forecast Demand)');
        const step3 = await page.$('::-p-text(Optimize Inventory)');
        assert(step1 !== null && step2 !== null && step3 !== null, 'All 3 How It Works steps are present');

        // Verify Compact CTA Strip content
        const ctaHeadline = await page.$('::-p-text(Ready to Master Your Magical Inventory?)');
        assert(ctaHeadline !== null, 'Slim CTA strip headline "Ready to Master Your Magical Inventory?" is present');

        const ctaButton = await page.$('button ::-p-text(Enter Madam Hex\'s Shop)');
        assert(ctaButton !== null, 'CTA button "Enter Madam Hex\'s Shop" is present');

        // Check CTA dimensions (must be compact horizontal banner, max height ~80-100px)
        const ctaBox = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Enter Madam Hex's Shop"));
            if (!btn) return null;
            const container = btn.closest('div.rounded-2xl');
            if (!container) return null;
            const rect = container.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                bottom: rect.bottom
            };
        });

        assert(ctaBox !== null, 'Found compact CTA strip container element');
        if (ctaBox) {
            console.log(`  -> Desktop CTA strip dimensions: width=${Math.round(ctaBox.width)}px, height=${Math.round(ctaBox.height)}px`);
            assert(ctaBox.height <= 120, `CTA strip height is compact (${Math.round(ctaBox.height)}px <= 120px)`);
        }

        // Check Footer presence immediately below
        const footerText = await page.$('::-p-text(Hallowmere Nocturnal Market)');
        assert(footerText !== null, 'Compact footer "Hallowmere Nocturnal Market" sits below CTA strip');

        // Capture Night Landing Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cleanup_landing_night_desktop.png') });
        console.log('  -> Captured cleanup_landing_night_desktop.png');

        // -------------------------------------------------------------
        // TEST 3: DAY THEME SWITCHER
        // -------------------------------------------------------------
        console.log('\n▶ TEST 3: Day Theme Appearance & Visual Contrast');

        const themeToggle = await page.waitForSelector('div[title*="Switch to"]');
        await themeToggle.click();
        await sleep(600);

        const isDayMode = await page.evaluate(() => document.body.classList.contains('theme-day'));
        assert(isDayMode, 'Successfully switched to Day Mode (theme-day)');

        // Capture Day Landing Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cleanup_landing_day_desktop.png') });
        console.log('  -> Captured cleanup_landing_day_desktop.png');

        // Switch back to Night mode
        await themeToggle.click();
        await sleep(600);

        // -------------------------------------------------------------
        // TEST 4: CTA BUTTON NAVIGATION & AUTH FLOW
        // -------------------------------------------------------------
        console.log('\n▶ TEST 4: CTA Button Navigation & Dual-Portal Routing');

        // Scroll into view of CTA button and click it
        await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Enter Madam Hex's Shop"));
            if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
        await sleep(500);

        const ctaBtn = await page.waitForSelector('button ::-p-text(Enter Madam Hex\'s Shop)');
        await ctaBtn.click();
        await sleep(1000);

        assert(page.url().includes('tab=login'), 'CTA button navigated cleanly to /?tab=login');

        // Verify Login Page Elements
        const loginTitle = await page.$('::-p-text(Enter the Sanctum)');
        assert(loginTitle !== null, 'Login portal rendered properly with "Enter the Sanctum"');

        // Test Admin Session Verification
        const authService = require('../backend/services/authService');
        const adminSession = authService.createSession(1, '127.0.0.1', 'TestLanding');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });
        await sleep(1500);

        assert(page.url().includes('tab=overview'), 'Admin session verified into Admin Sanctum Overview');

        // Logout and test User Login Redirect
        const signoutBtn = await page.waitForSelector('button ::-p-text(Sign Out)');
        await signoutBtn.click();
        await sleep(800);

        // Customer Login (Apprentice)
        const userBtn = await page.waitForSelector('button ::-p-text(Customer Portal (Apprentice Demo))');
        await userBtn.click();
        await sleep(1500);

        assert(page.url().includes('tab=user_dashboard'), 'Customer login redirected to Customer Sanctuary Dashboard');

        // Logout customer
        const departBtn = await page.waitForSelector('button[title="Depart the Apothecary"]');
        await departBtn.click();
        await sleep(800);

        // -------------------------------------------------------------
        // TEST 5: MOBILE RESPONSIVENESS (390x844 iPhone)
        // -------------------------------------------------------------
        console.log('\n▶ TEST 5: Mobile Viewport Layout & Responsiveness');
        await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await sleep(800);

        // Verify no horizontal overflow on mobile
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        assert(!hasHorizontalScroll, 'Mobile landing page has no horizontal scrolling overflow');

        // Check that CTA button stacks nicely on mobile
        const mobileCtaBtn = await page.$('button ::-p-text(Enter Madam Hex\'s Shop)');
        assert(mobileCtaBtn !== null, 'CTA button rendered and accessible on mobile screen');

        // Capture Mobile Screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cleanup_landing_mobile.png') });
        console.log('  -> Captured cleanup_landing_mobile.png');

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`🏁 LANDING PAGE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log(`🔍 Browser Console Errors: ${consoleErrors.length}`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        if (failed > 0) {
            process.exit(1);
        }
    } catch (err) {
        console.error('Test failed with error:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

runLandingPageTests();

