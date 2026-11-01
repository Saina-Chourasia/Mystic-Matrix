const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const http = require('node:http');
const app = require('../backend/server');

let passed = 0;
let failed = 0;

function assert(condition, name) {
    if (condition) {
        console.log(`  ✔ HTTP PASS: ${name}`);
        passed++;
    } else {
        console.error(`  ❌ HTTP FAIL: ${name}`);
        failed++;
    }
}

async function run() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🌐 HTTP API INTEGRATION & ROUTE SECURITY TESTS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    let adminCookie = '';
    let customerCookie = '';
    let adminCsrf = '';
    let customerCsrf = '';

    try {
        // 1. Health check
        const healthRes = await fetch(`${baseUrl}/api/health`);
        const healthJson = await healthRes.json();
        assert(healthRes.status === 200 && healthJson.status === 'online', 'GET /api/health returns online');

        // 2. Admin Session Generation
        const authService = require('../backend/services/authService');
        const adminSession = authService.createSession(1, '127.0.0.1', 'TestRunner');
        adminCookie = `${authService.sessionCookieName}=${adminSession.id}`;
        
        const adminMeRes = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Cookie: adminCookie }
        });
        const adminMeJson = await adminMeRes.json();
        assert(adminMeRes.status === 200 && adminMeJson.authenticated === true && adminMeJson.user.role === 'ADMIN', 'Session verification confirms Madam Hex as ADMIN');
        adminCsrf = adminSession.csrf_token;

        // 3. Customer Login
        const custLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'apprentice@hallowmere.com',
                password: 'Hallowmere2026!Spell'
            })
        });
        const custLoginJson = await custLoginRes.json();
        const rawCustCookie = custLoginRes.headers.get('set-cookie');
        assert(custLoginRes.status === 200 && custLoginJson.user.role === 'USER', 'POST /api/auth/login logs in Customer as USER');

        customerCookie = rawCustCookie.split(';')[0];
        customerCsrf = custLoginJson.csrfToken;

        // 4. GET /api/auth/me for customer
        const meRes = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { 'Cookie': customerCookie }
        });
        const meJson = await meRes.json();
        assert(meRes.status === 200 && meJson.authenticated === true && meJson.user.role === 'USER', 'GET /api/auth/me validates customer session');

        // 5. Customer Browse Catalog
        const shopRes = await fetch(`${baseUrl}/api/shop/products`);
        const shopJson = await shopRes.json();
        assert(shopRes.status === 200 && shopJson.data.length > 0, `GET /api/shop/products returns ${shopJson.data.length} magical products`);

        // 6. Customer Add to Cart
        const targetProd = shopJson.data[0];
        const addCartRes = await fetch(`${baseUrl}/api/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': customerCookie,
                'x-csrf-token': customerCsrf
            },
            body: JSON.stringify({ productId: targetProd.id, quantity: 1 })
        });
        const addCartJson = await addCartRes.json();
        assert(addCartRes.status === 200 && addCartJson.data.items.length > 0, 'POST /api/cart/items adds item to cart');

        // 7. Customer Place Demo Order
        const orderRes = await fetch(`${baseUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': customerCookie,
                'x-csrf-token': customerCsrf
            },
            body: JSON.stringify({
                shippingAddress: 'Raven Crest Library #3',
                notes: 'Deliver via nocturnal raven'
            })
        });
        const orderJson = await orderRes.json();
        assert(orderRes.status === 201 && orderJson.data.order_number.startsWith('MM-'), `POST /api/orders places demo order #${orderJson.data?.order_number}`);

        // 8. Customer Order History
        const myOrdersRes = await fetch(`${baseUrl}/api/orders/my`, {
            headers: { 'Cookie': customerCookie }
        });
        const myOrdersJson = await myOrdersRes.json();
        assert(myOrdersRes.status === 200 && myOrdersJson.data.length > 0, 'GET /api/orders/my lists customer orders');

        // 9. RBAC Test: Customer attempts to access Admin API
        const custAdminAttempt = await fetch(`${baseUrl}/api/admin/dashboard`, {
            headers: { 'Cookie': customerCookie }
        });
        assert(custAdminAttempt.status === 403, 'Customer strictly BLOCKED with 403 Forbidden on GET /api/admin/dashboard');

        // 10. Admin Access to Admin Dashboard
        const adminDashRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
            headers: { 'Cookie': adminCookie }
        });
        const adminDashJson = await adminDashRes.json();
        assert(adminDashRes.status === 200 && adminDashJson.data.inventory !== undefined, 'Admin successfully accesses GET /api/admin/dashboard');

        // 11. Admin Access to Store Orders
        const adminOrdersRes = await fetch(`${baseUrl}/api/admin/orders`, {
            headers: { 'Cookie': adminCookie }
        });
        const adminOrdersJson = await adminOrdersRes.json();
        assert(adminOrdersRes.status === 200 && adminOrdersJson.data.length > 0, `Admin successfully retrieves all store customer orders (${adminOrdersJson.data.length} orders)`);

        // 12. Admin Access to Datasets & UCI Records
        const adminDatasetsRes = await fetch(`${baseUrl}/api/admin/datasets`, {
            headers: { 'Cookie': adminCookie }
        });
        const adminDatasetsJson = await adminDatasetsRes.json();
        assert(adminDatasetsRes.status === 200 && adminDatasetsJson.data.sources.length === 2, 'Admin retrieves both dataset sources (DEMO DATA & REAL DATA)');

        // 13. Unauthenticated User Blocked on Protected API
        const unauthRes = await fetch(`${baseUrl}/api/orders/my`);
        assert(unauthRes.status === 401, 'Unauthenticated visitor blocked with 401 on GET /api/orders/my');

    } finally {
        server.close();
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`🏁 HTTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

run().catch(err => {
    console.error('HTTP test failure:', err);
    process.exit(1);
});

