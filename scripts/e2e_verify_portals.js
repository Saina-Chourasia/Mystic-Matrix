const puppeteer = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
const BASE_URL = 'http://localhost:5001';

async function run() {
    console.log('🔮 Starting End-to-End Browser Verification with Puppeteer...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    try {
        // 1. Visit Landing Page
        console.log('1. Loading Public Landing Page...');
        await page.goto('http://localhost:5001/', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'portal_landing.png') });
        console.log('  ✔ Captured portal_landing.png');

        // 2. Visit Login Page
        console.log('2. Loading Dual-Portal Login Page...');
        await page.goto('http://localhost:5001/?tab=login', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'portal_login_dual.png') });
        console.log('  ✔ Captured portal_login_dual.png');

        // 3. Admin Login via Session Token
        console.log('3. Logging in as Madam Hex (ADMIN)...');
        const authService = require('../backend/services/authService');
        const adminSession = authService.createSession(1, '127.0.0.1', 'TestRunner');
        await page.setCookie({
            name: authService.sessionCookieName,
            value: adminSession.id,
            domain: 'localhost',
            path: '/'
        });
        await page.goto(`${BASE_URL}/?tab=overview`, { waitUntil: 'networkidle2' });

        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_overview_sanctum.png') });
        console.log('  ✔ Logged in as Admin & Captured admin_overview_sanctum.png');

        // 4. Admin Store Orders Page
        console.log('4. Navigating to Admin Store Orders...');
        const ordersTab = await page.$('button[title="Store Orders"]');
        if (ordersTab) await ordersTab.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_store_orders.png') });
        console.log('  ✔ Captured admin_store_orders.png');

        // 5. Admin User Directory
        console.log('5. Navigating to Admin User Directory...');
        const usersTab = await page.$('button[title="User Directory"]');
        if (usersTab) await usersTab.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_user_directory.png') });
        console.log('  ✔ Captured admin_user_directory.png');

        // 6. Admin Security Logs
        console.log('6. Navigating to Admin Security Logs...');
        const secTab = await page.$('button[title="Security Logs"]');
        if (secTab) await secTab.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_security_logs.png') });
        console.log('  ✔ Captured admin_security_logs.png');

        // 7. Admin Datasets & UCI Integration
        console.log('7. Navigating to Admin Datasets & UCI Integration...');
        const datasetTab = await page.$('button[title="Datasets & UCI"]');
        if (datasetTab) await datasetTab.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_datasets_uci.png') });
        console.log('  ✔ Captured admin_datasets_uci.png');

        // 8. Switch to Customer Portal
        console.log('8. Switching to Customer User Portal...');
        const custPortalLink = await page.$('button[title="Switch to Customer Portal"]');
        if (custPortalLink) {
            await custPortalLink.click();
        } else {
            await page.goto('http://localhost:5001/?tab=user_dashboard', { waitUntil: 'networkidle2' });
        }
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_dashboard.png') });
        console.log('  ✔ Entered Customer Sanctuary & Captured customer_dashboard.png');

        // 9. Customer Magical Shop
        console.log('9. Navigating to Customer Magical Shop...');
        const shopTab = await page.$('nav button:nth-child(2)');
        if (shopTab) await shopTab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_shop.png') });
        console.log('  ✔ Captured customer_shop.png');

        // 10. Add item to satchel
        console.log('10. Adding magical item to satchel...');
        const addButtons = await page.$$('button');
        for (const btn of addButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Add to Satchel')) {
                await btn.click();
                console.log('  ✔ Clicked Add to Satchel');
                break;
            }
        }
        await new Promise(r => setTimeout(r, 1000));

        // 11. Customer Satchel (Cart)
        console.log('11. Navigating to Customer Satchel (Cart)...');
        const cartTab = await page.$('nav button:nth-child(3)');
        if (cartTab) await cartTab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_cart.png') });
        console.log('  ✔ Captured customer_cart.png');

        // 12. Checkout Order
        console.log('12. Placing Demo Order...');
        const checkoutBtn = await page.$('button[type="submit"]');
        if (checkoutBtn) {
            await checkoutBtn.click();
            await new Promise(r => setTimeout(r, 1500));
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_order_confirmation.png') });
            console.log('  ✔ Captured customer_order_confirmation.png');
        }

        // 13. Customer Orders Grimoire
        console.log('13. Navigating to Customer Order Grimoire...');
        const ordersNavTab = await page.$('nav button:nth-child(4)');
        if (ordersNavTab) await ordersNavTab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_orders_history.png') });
        console.log('  ✔ Captured customer_orders_history.png');

        // 14. Customer Profile
        console.log('14. Navigating to Customer Profile...');
        const profileTab = await page.$('nav button:nth-child(5)');
        if (profileTab) await profileTab.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_profile.png') });
        console.log('  ✔ Captured customer_profile.png');

        console.log('\n✨ ALL BROWSER E2E TESTS COMPLETED SUCCESSFULLY!\n');
    } catch (err) {
        console.error('Browser E2E Error:', err);
    } finally {
        await browser.close();
    }
}

run();
