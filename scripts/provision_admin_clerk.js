#!/usr/bin/env node
/**
 * 🛡️ MYSTIC MATRIX — Secure Server-Side Admin Clerk Provisioning Tool
 * 
 * Securely binds a verified Clerk User ID to Madam Hex's Admin account.
 * Operates strictly with server-side trusted operator privileges.
 * 
 * Usage:
 *   node scripts/provision_admin_clerk.js <clerk_user_id> [--recover]
 * 
 * Flags:
 *   --recover    Authorize rebinding if Admin account is already linked to another Clerk ID.
 */

try {
    require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
    require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
} catch (e) {
    // dotenv optional
}

const clerkService = require('../backend/services/clerkService');

async function main() {
    const rawArgs = process.argv.slice(2);
    const allowRecovery = rawArgs.includes('--recover') || rawArgs.includes('--force');
    const filteredArgs = rawArgs.filter(a => !a.startsWith('--'));

    const targetClerkId = (filteredArgs[0] || process.env.CLERK_ADMIN_USER_ID || '').trim();

    console.log('\n============================================================');
    console.log('🔮 MYSTIC MATRIX — SERVER-SIDE ADMIN CLERK PROVISIONING');
    console.log('============================================================');

    if (!targetClerkId) {
        console.error('❌ Error: Verified Clerk User ID must be provided.');
        console.log('\nUsage:');
        console.log('  node scripts/provision_admin_clerk.js <clerk_user_id> [--recover]');
        console.log('  Example: node scripts/provision_admin_clerk.js user_2aXy9ZbQW...\n');
        process.exit(1);
    }

    try {
        console.log(`\nInitiating secure operator provisioning for Clerk ID: ${targetClerkId}...`);
        const result = await clerkService.provisionAdminClerkId({
            clerkId: targetClerkId,
            isOperator: true,
            allowRecovery,
            operatorReason: 'CLI operator command execution'
        });

        console.log(`\n✔ SUCCESS: ${result.message}`);
        console.log(`  User ID  : ${result.user.id}`);
        console.log(`  Email    : ${result.user.email}`);
        console.log(`  Role     : ${result.user.role}`);
        console.log(`  Clerk ID : ${result.user.clerk_id}\n`);
    } catch (err) {
        console.error(`\n❌ Provisioning Halted: ${err.message}\n`);
        process.exit(1);
    }
}

main();
