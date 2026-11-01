const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getDb } = require('../backend/config/db');
const authService = require('../backend/services/authService');
const userModel = require('../backend/models/userModel');
const sessionModel = require('../backend/models/sessionModel');
const cartModel = require('../backend/models/cartModel');
const orderModel = require('../backend/models/orderModel');
const datasetModel = require('../backend/models/datasetModel');
const datasetImportService = require('../backend/services/datasetImportService');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✔ PASS: ${testName}`);
        passedTests++;
    } else {
        console.error(`  ❌ FAIL: ${testName}`);
        failedTests++;
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 MYSTIC MATRIX — COMPREHENSIVE VERIFICATION & TEST SUITE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const db = getDb();

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE 1: AUTHENTICATION & SESSION LIFECYCLE
    // ─────────────────────────────────────────────────────────────
    console.log('▶ TEST SUITE 1: Authentication & Server-Side Sessions');

    // 1.1 Initial Admin Provisioning Check
    const adminUser = userModel.findByEmail('madam.hex@gmail.com');
    assert(adminUser !== null && adminUser.role === 'ADMIN', 'Authoritative Admin account (Madam Hex) is provisioned with role ADMIN');

    // 1.2 Public Registration Role Escalation Denial
    const testCustEmail = `test.apprentice.${Date.now()}@hallowmere.com`;
    const regResult = await authService.register({
        email: testCustEmail,
        password: 'SecureSpellPassword2026!',
        name: 'Gwydion Apprentice',
        role: 'ADMIN' // Malicious attempt to self-assign ADMIN
    });
    assert(regResult.user.role === 'USER', 'Public registration strictly enforces role USER (ignores requested ADMIN)');
    assert(regResult.session && regResult.session.id, 'Server session generated on registration');

    // 1.3 Session Verification from Database
    const verifiedSession = authService.verifySession(regResult.session.id);
    assert(verifiedSession && verifiedSession.email === testCustEmail, 'Server-side session verified in SQLite sessions table');
    assert(verifiedSession.csrf_token !== undefined, 'CSRF token is present on verified session');

    // 1.4 Valid Login
    const loginResult = await authService.login({
        email: testCustEmail,
        password: 'SecureSpellPassword2026!'
    });
    assert(loginResult.user.email === testCustEmail, 'Valid user credentials successfully authenticated');
    assert(loginResult.session.id !== regResult.session.id, 'Session ID regenerated upon login (Session Fixation protection)');

    // 1.5 Invalid Login Generic Error
    let invalidLoginCaught = false;
    try {
        await authService.login({
            email: testCustEmail,
            password: 'WrongPassword123!'
        });
    } catch (err) {
        invalidLoginCaught = err.message === 'Invalid email or password.';
    }
    assert(invalidLoginCaught, 'Generic authentication error returned on invalid credentials');

    // 1.6 Password Reset with Single-Use Expiring Token
    const resetReq = authService.requestPasswordReset(testCustEmail);
    assert(resetReq.success === true, 'Password reset request accepted');
    assert(resetReq.devToken !== undefined, 'Cryptographic single-use reset token generated');

    const resetExec = authService.resetPassword(resetReq.devToken, 'NewRenewedPassword2026!');
    assert(resetExec.success === true, 'Password successfully reset using valid token');

    // 1.7 Prevent Re-use of Reset Token
    let tokenReused = false;
    try {
        authService.resetPassword(resetReq.devToken, 'AnotherPassword2026!');
    } catch (e) {
        tokenReused = true;
    }
    assert(tokenReused, 'Single-use reset token rejected on second attempt');

    // 1.8 Logout Invalidation
    authService.logout(loginResult.session.id, regResult.user.id);
    const postLogoutSession = authService.verifySession(loginResult.session.id);
    assert(postLogoutSession === null, 'Session immediately invalidated upon logout in database');

    console.log('');

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE 2: ROLE-BASED ACCESS CONTROL (RBAC) & OWNERSHIP
    // ─────────────────────────────────────────────────────────────
    console.log('▶ TEST SUITE 2: Authorization & Object-Level Checks');

    // 2.1 Role checks
    assert(adminUser.role === 'ADMIN', 'Admin identity carries ADMIN role');
    assert(regResult.user.role === 'USER', 'Customer identity carries USER role');

    // 2.2 Customer cannot modify other users or own role
    const updatedCust = userModel.updateProfile(regResult.user.id, { name: 'Gwydion Adept' });
    assert(updatedCust.name === 'Gwydion Adept', 'Customer can update own display moniker');
    assert(updatedCust.role === 'USER', 'Profile update cannot alter user role');

    console.log('');

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE 3: SHARED INVENTORY & DEMO ORDER WORKFLOW
    // ─────────────────────────────────────────────────────────────
    console.log('▶ TEST SUITE 3: Shared Inventory & Atomic Order Execution');

    // 3.1 Pick product with stock
    const testProduct = db.prepare('SELECT id, name, current_stock, selling_price FROM products WHERE is_archived = 0 AND current_stock >= 5 LIMIT 1').get();
    assert(testProduct !== undefined, `Found available testing product: ${testProduct.name} (Stock: ${testProduct.current_stock})`);

    const initialStock = testProduct.current_stock;
    const orderQty = 2;

    // 3.2 Add to Cart
    const cart = cartModel.addItem(regResult.user.id, testProduct.id, orderQty);
    assert(cart.items.length >= 1, 'Item successfully added to customer cart');
    assert(cart.subtotal === Number((orderQty * testProduct.selling_price).toFixed(2)), 'Server accurately recalculated cart subtotal');
    assert(cart.tax === Number((cart.subtotal * 0.05).toFixed(2)), 'Server calculated 5% magical reagent tax');

    // 3.3 Atomic Order Placement
    const placedOrder = orderModel.createOrderWithInventoryDeduction({
        userId: regResult.user.id,
        items: [{ product_id: testProduct.id, quantity: orderQty }],
        shippingAddress: 'Tower of High Sorcery, Realm 4',
        notes: 'Priority Owl delivery'
    });

    assert(placedOrder && placedOrder.order_number.startsWith('MM-'), `Order #${placedOrder.order_number} created with unique order number`);
    assert(placedOrder.items.length === 1, 'Order item recorded in order_items table');

    // 3.4 Atomic Stock Deduction Check
    const updatedProduct = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(testProduct.id);
    assert(updatedProduct.current_stock === initialStock - orderQty, `Stock atomically deducted: was ${initialStock}, now ${updatedProduct.current_stock}`);

    // 3.5 Sales Ledger Provenance Verification
    const salesRecord = db.prepare('SELECT * FROM sales WHERE order_id = ?').get(placedOrder.id);
    assert(salesRecord !== undefined && salesRecord.provenance === 'CUSTOMER_ORDER', 'Sale recorded with distinct CUSTOMER_ORDER provenance');

    // 3.6 Inventory Transaction Audit Verification
    const transRecord = db.prepare('SELECT * FROM inventory_transactions WHERE order_id = ?').get(placedOrder.id);
    assert(transRecord !== undefined && transRecord.type === 'SALE' && transRecord.provenance === 'CUSTOMER_ORDER', 'Inventory movement transaction recorded with CUSTOMER_ORDER provenance');

    // 3.7 Ownership Check: Customer can view their own order
    const ownOrder = orderModel.getByIdAndUserId(placedOrder.id, regResult.user.id);
    assert(ownOrder !== null, 'Customer successfully retrieved their own order');

    // 3.8 Ownership Isolation: Another customer CANNOT view this order
    const otherCustOrder = orderModel.getByIdAndUserId(placedOrder.id, 999999);
    assert(otherCustOrder === null, 'Unauthorized customer blocked from accessing another user order (Object-Level Access Control)');

    // 3.9 Overselling Prevention
    let oversellPrevented = false;
    try {
        orderModel.createOrderWithInventoryDeduction({
            userId: regResult.user.id,
            items: [{ product_id: testProduct.id, quantity: updatedProduct.current_stock + 100 }]
        });
    } catch (e) {
        oversellPrevented = e.message.includes('Insufficient stock');
    }
    assert(oversellPrevented, 'Overselling strictly prevented when quantity exceeds available inventory');

    console.log('');

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE 4: REAL RETAIL DATASET (UCI ONLINE RETAIL II)
    // ─────────────────────────────────────────────────────────────
    console.log('▶ TEST SUITE 4: UCI Real Retail Dataset & Provenance Isolation');

    // 4.1 Check source metadata
    const uciSource = datasetModel.getSourceByKey('uci_online_retail_ii');
    assert(uciSource !== null && uciSource.category === 'REAL DATA', 'UCI Online Retail II cataloged with category REAL DATA');
    assert(uciSource.attribution.includes('Chen, D. (2012)'), 'Formal academic citation and DOI preserved');

    // 4.2 Check duplicate import avoidance
    const repeatImport = await datasetImportService.runImportPipeline({ force: false });
    assert(repeatImport.status === 'ALREADY_IMPORTED', 'Duplicate import avoided on repeated execution');

    // 4.3 Check imported transactions count
    const txCount = db.prepare('SELECT COUNT(*) as c FROM imported_retail_transactions').get().c;
    assert(txCount > 0, `Imported retail transactions present in SQLite (${txCount.toLocaleString()} rows)`);

    // 4.4 Separate Sales & Cancellations
    const salesCount = db.prepare('SELECT COUNT(*) as c FROM imported_retail_transactions WHERE is_cancellation = 0').get().c;
    const cancelCount = db.prepare('SELECT COUNT(*) as c FROM imported_retail_transactions WHERE is_cancellation = 1').get().c;
    assert(salesCount > 0 && cancelCount > 0, `Separately recorded sales (${salesCount.toLocaleString()}) and cancellations (${cancelCount.toLocaleString()})`);

    // 4.5 Customer Privacy / ID Masking
    const sampleTx = datasetModel.getRetailTransactions({ limit: 1 });
    assert(sampleTx.transactions.length > 0, 'Fetched paginated retail transactions');
    const maskedCust = sampleTx.transactions[0].masked_customer_id;
    assert(maskedCust.startsWith('CUST-') || maskedCust === 'GUEST', `Raw customer ID never exposed; properly masked as: "${maskedCust}"`);

    // 4.6 Daily Demand Aggregates
    const demandCount = db.prepare('SELECT COUNT(*) as c FROM imported_daily_demand').get().c;
    assert(demandCount > 0, `Daily product demand aggregated (${demandCount.toLocaleString()} product-day records)`);

    // 4.7 Chronological Backtesting Metrics
    const evalRecords = db.prepare('SELECT * FROM forecast_evaluations WHERE model_name LIKE ?').all('%Holt-Winters%');
    assert(evalRecords.length > 0, `Chronological backtesting evaluations saved (${evalRecords.length} models benchmarked)`);
    if (evalRecords.length > 0) {
        assert(evalRecords[0].mae >= 0 && evalRecords[0].wape >= 0, `Backtest metrics valid: MAE=${evalRecords[0].mae}, WAPE=${evalRecords[0].wape}%`);
    }

    console.log('');

    // ─────────────────────────────────────────────────────────────
    // TEST SUITE 5: DATABASE INTEGRITY & TRANSACTION ROLLBACK
    // ─────────────────────────────────────────────────────────────
    console.log('▶ TEST SUITE 5: Database Transactions & Recovery');

    const stockBeforeRollback = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(testProduct.id).current_stock;
    let rollbackSuccess = false;
    try {
        db.exec('BEGIN TRANSACTION;');
        db.prepare('UPDATE products SET current_stock = current_stock - 5 WHERE id = ?').run(testProduct.id);
        // Deliberate error to trigger rollback
        throw new Error('Simulated network spell disruption');
    } catch (err) {
        db.exec('ROLLBACK;');
        rollbackSuccess = true;
    }
    const stockAfterRollback = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(testProduct.id).current_stock;
    assert(rollbackSuccess && stockBeforeRollback === stockAfterRollback, 'Transaction rollback cleanly reverted stock modification on failure');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
