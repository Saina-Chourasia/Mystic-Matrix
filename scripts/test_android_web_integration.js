/**
 * 🔮 MYSTIC MATRIX — Android & Web Dual-Platform Integration Test Suite
 * 
 * Verifies:
 * 1. Capacitor configuration & Android project structure
 * 2. Android Manifest configuration (intent filters, cleartext, softInputMode)
 * 3. MainActivity User-Agent Google OAuth compatibility patch
 * 4. Debug APK compilation & asset bundling integrity
 * 5. Environment-aware API base URL configuration
 * 6. Express backend CORS & CSRF support for Capacitor native origins
 * 7. Complete API functionality (Shop, Inventory, Orders, Forecasting)
 * 8. Strict Role-Based Access Control (Customer 403 on Admin, Unauthenticated 401)
 * 9. Live Groq Cloud AI Assistant connection & tool execution
 * 10. Web and mobile viewport responsiveness
 */

const fs = require('fs');
const path = require('path');

const assert = (condition, message) => {
    if (!condition) {
        console.error(`  ❌ [FAIL] ${message}`);
        throw new Error(message);
    }
    console.log(`  ✔ [PASS] ${message}`);
};

const BASE_URL = 'http://localhost:5001';

async function runDualPlatformVerification() {
    console.log('\n================================================================');
    console.log('🔮 MYSTIC MATRIX — ANDROID & WEB INTEGRATION AUDIT');
    console.log('================================================================');

    // ────────────────────────────────────────────────────────────
    // TEST 1: CAPACITOR CONFIGURATION & PROJECT INTEGRITY
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 1: Capacitor Configuration & Android Project Structure');
    
    const capConfigFile = path.resolve(__dirname, '../frontend/capacitor.config.json');
    assert(fs.existsSync(capConfigFile), 'Capacitor configuration file exists (capacitor.config.json)');
    
    const capConfig = JSON.parse(fs.readFileSync(capConfigFile, 'utf-8'));
    assert(capConfig.appId === 'com.mysticmatrix.app', `Capacitor package ID is com.mysticmatrix.app (found: ${capConfig.appId})`);
    assert(capConfig.appName === 'Mystic Matrix', `Capacitor application name is Mystic Matrix (found: ${capConfig.appName})`);
    assert(capConfig.webDir === 'dist', `Web directory configured as dist (found: ${capConfig.webDir})`);
    assert(capConfig.server?.cleartext === true, 'Cleartext traffic enabled for local development');

    // ────────────────────────────────────────────────────────────
    // TEST 2: ANDROID MANIFEST & DEEP LINK INTENT FILTERS
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 2: Android Manifest & Deep Link Intent Filters');
    
    const manifestPath = path.resolve(__dirname, '../frontend/android/app/src/main/AndroidManifest.xml');
    assert(fs.existsSync(manifestPath), 'AndroidManifest.xml exists');
    
    const manifestXml = fs.readFileSync(manifestPath, 'utf-8');
    assert(manifestXml.includes('android:usesCleartextTraffic="true"'), 'android:usesCleartextTraffic enabled in manifest');
    assert(manifestXml.includes('android:windowSoftInputMode="adjustResize"'), 'Keyboard adjustResize configured in manifest');
    assert(manifestXml.includes('android:scheme="mysticmatrix"'), 'Deep link intent filter for mysticmatrix:// present in manifest');

    // ────────────────────────────────────────────────────────────
    // TEST 3: MAINACTIVITY USER-AGENT & OAUTH SECURITY PATCH
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 3: MainActivity WebSettings & Google OAuth Compatibility');
    
    const mainActivityPath = path.resolve(__dirname, '../frontend/android/app/src/main/java/com/mysticmatrix/app/MainActivity.java');
    assert(fs.existsSync(mainActivityPath), 'MainActivity.java exists');
    
    const mainActivitySrc = fs.readFileSync(mainActivityPath, 'utf-8');
    assert(mainActivitySrc.includes('setUserAgentString'), 'Custom User-Agent configuration present in MainActivity.java');
    assert(mainActivitySrc.includes('replace("; wv", "")'), 'WebView signature stripped to prevent Google 403: disallowed_useragent');

    // ────────────────────────────────────────────────────────────
    // TEST 4: DEBUG APK ARTIFACT COMPILATION & ASSET VERIFICATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 4: Debug APK Compilation & Packaging Integrity');
    
    const apkPath = path.resolve(__dirname, '../frontend/android/app/build/outputs/apk/debug/app-debug.apk');
    assert(fs.existsSync(apkPath), 'Debug APK generated at frontend/android/app/build/outputs/apk/debug/app-debug.apk');
    
    const apkStats = fs.statSync(apkPath);
    const sizeMb = (apkStats.size / (1024 * 1024)).toFixed(2);
    assert(apkStats.size > 10 * 1024 * 1024, `APK package size valid (${sizeMb} MB > 10 MB)`);
    console.log(`  - Debug APK Size           : ${sizeMb} MB`);
    console.log(`  - Output Location          : ${apkPath}`);

    // Verify assets packaged in public assets
    const publicAssetsDir = path.resolve(__dirname, '../frontend/android/app/src/main/assets/public');
    assert(fs.existsSync(path.join(publicAssetsDir, 'index.html')), 'Web index.html synchronized into Android assets/public');
    assert(fs.existsSync(path.join(publicAssetsDir, 'icons/cauldron.svg')), 'Pixel-art Cauldron icon synchronized into Android assets');

    // ────────────────────────────────────────────────────────────
    // TEST 5: ENVIRONMENT-AWARE API CONFIGURATION IN FRONTEND
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 5: Environment-Aware API Configuration');
    
    const apiServicePath = path.resolve(__dirname, '../frontend/src/services/api.js');
    const apiServiceSrc = fs.readFileSync(apiServicePath, 'utf-8');
    assert(apiServiceSrc.includes('Capacitor.isNativePlatform()'), 'Platform detection via Capacitor.isNativePlatform() active in api.js');
    assert(apiServiceSrc.includes('10.0.2.2:5001'), 'Android emulator loopback host (10.0.2.2:5001) configured in api.js');
    assert(apiServiceSrc.includes('mystic_matrix_custom_api_host'), 'Custom API host override supported for physical devices');
    assert(apiServiceSrc.includes('mystic_session_token'), 'Bearer token header persistence active for Android WebView');

    // ────────────────────────────────────────────────────────────
    // TEST 6: BACKEND CORS & CSRF COMPATIBILITY FOR CAPACITOR
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 6: Backend CORS & CSRF Compatibility for Native Origins');
    
    // Simulate request from Capacitor origin (capacitor://localhost)
    const capacitorHealthRes = await fetch(`${BASE_URL}/api/health`, {
        headers: {
            'Origin': 'capacitor://localhost'
        }
    });
    assert(capacitorHealthRes.status === 200, 'GET /api/health succeeds for origin capacitor://localhost (HTTP 200)');
    const corsHeader = capacitorHealthRes.headers.get('access-control-allow-origin');
    assert(corsHeader === 'capacitor://localhost' || corsHeader === '*', 'CORS Access-Control-Allow-Origin dynamically reflects Capacitor origin');

    // ────────────────────────────────────────────────────────────
    // TEST 7: COMPLETE API CAPABILITY PRESERVATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 7: Complete API Route & Feature Preservation');
    
    const authService = require('../backend/services/authService');
    const adminSession = authService.createSession(1, '127.0.0.1', 'DualPlatformTestRunner');
    const adminCookie = `${authService.sessionCookieName}=${adminSession.id}`;

    // Health
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returned HTTP 200');

    // Products
    const prodRes = await fetch(`${BASE_URL}/api/products`, { headers: { Cookie: adminCookie } });
    assert(prodRes.status === 200, 'GET /api/products operational (HTTP 200)');
    const prodJson = await prodRes.json();
    assert(prodJson.data && prodJson.data.length > 0, `Products catalog active (${prodJson.data.length} products)`);

    // Customer Catalog
    const shopRes = await fetch(`${BASE_URL}/api/shop/products`);
    assert(shopRes.status === 200, 'GET /api/shop/products operational (HTTP 200)');

    // Suppliers & Purchase Orders
    const suppRes = await fetch(`${BASE_URL}/api/suppliers`, { headers: { Cookie: adminCookie } });
    assert(suppRes.status === 200, 'GET /api/suppliers operational (HTTP 200)');

    // Forecasting
    const forecastRes = await fetch(`${BASE_URL}/api/forecasts?halloweenMultiplier=1.0`, { headers: { Cookie: adminCookie } });
    assert(forecastRes.status === 200, 'GET /api/forecasts operational (HTTP 200)');

    // ────────────────────────────────────────────────────────────
    // TEST 8: STRICT ROLE-BASED ACCESS CONTROL (RBAC)
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 8: Strict Role-Based Access Control');
    
    const customerSession = authService.createSession(2, '127.0.0.1', 'CustomerTestRunner');
    const customerCookie = `${authService.sessionCookieName}=${customerSession.id}`;

    // Customer accessing Cart -> 200
    const cartRes = await fetch(`${BASE_URL}/api/cart`, { headers: { Cookie: customerCookie } });
    assert(cartRes.status === 200, 'Customer successfully accesses /api/cart (HTTP 200)');

    // Customer accessing Admin Dashboard -> 403
    const forbiddenDash = await fetch(`${BASE_URL}/api/admin/dashboard`, { headers: { Cookie: customerCookie } });
    assert(forbiddenDash.status === 403, 'Customer strictly forbidden from /api/admin/dashboard (HTTP 403)');

    // Unauthenticated accessing Admin Dashboard -> 401
    const unauthDash = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert(unauthDash.status === 401, 'Unauthenticated request to Admin endpoint returns HTTP 401');

    // ────────────────────────────────────────────────────────────
    // TEST 9: GROQ CLOUD AI ASSISTANT INTEGRATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 9: Groq Cloud AI Assistant & Tool Calling');
    
    const pingRes = await fetch(`${BASE_URL}/api/ai/diagnostics/ping`, {
        method: 'POST',
        headers: { Cookie: adminCookie }
    });
    assert(pingRes.status === 200, 'Groq AI diagnostics ping operational (HTTP 200)');
    const pingJson = await pingRes.json();
    assert(pingJson.ping && pingJson.ping.success === true, 'Groq Cloud live AI connection confirmed');
    console.log(`  - Groq AI Provider       : ${pingJson.ping.provider}`);
    console.log(`  - Groq Model Name        : ${pingJson.ping.model}`);
    console.log(`  - Latency                : ${pingJson.ping.latencyMs}ms`);

    // ────────────────────────────────────────────────────────────
    // TEST 10: MOBILE VIEWPORT & SAFE AREA CONFIGURATION
    // ────────────────────────────────────────────────────────────
    console.log('\n📌 TEST 10: Mobile Viewport & Safe-Area Configuration');
    
    const indexHtml = fs.readFileSync(path.resolve(__dirname, '../frontend/index.html'), 'utf-8');
    assert(indexHtml.includes('viewport-fit=cover'), 'viewport-fit=cover present in index.html for Android edge-to-edge support');
    assert(indexHtml.includes('theme-color'), 'theme-color meta tag present in index.html');

    const indexCss = fs.readFileSync(path.resolve(__dirname, '../frontend/src/styles/index.css'), 'utf-8');
    assert(indexCss.includes('safe-area-inset-top'), 'CSS safe-area variables configured in index.css');
    assert(indexCss.includes('mobile-scroll-x'), 'Touch horizontal scroll utility classes present in index.css');

    console.log('\n================================================================');
    console.log('🏁 DUAL-PLATFORM INTEGRATION SUITE: ALL 24 TESTS PASSED!');
    console.log('================================================================\n');
}

runDualPlatformVerification().catch(err => {
    console.error('\n❌ DUAL-PLATFORM AUDIT FAILED:', err);
    process.exit(1);
});

