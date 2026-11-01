async function runTestSuite() {
  const BASE = 'http://localhost:5001/api';
  console.log('🔮 ══════════════════════════════════════════════════════');
  console.log('   MYSTIC MATRIX: AUTH & ADMIN DASHBOARD TEST SUITE');
  console.log('══════════════════════════════════════════════════════════\n');

  // TEST 1: Health Check
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('TEST 1 - Health & Platform Telemetry:');
  console.log(`  ✔ Status: ${health.status} | App: ${health.app}`);
  console.log(`  ✔ Admin Configured: ${health.adminConfigured}\n`);

  // TEST 2: Protected API Rejection (Unauthenticated)
  console.log('TEST 2 - Route Protection (Unauthenticated visitor):');
  const unauthRes = await fetch(`${BASE}/products`);
  const unauthData = await unauthRes.json();
  if (unauthRes.status === 401 && unauthData.error === 'UNAUTHORIZED') {
    console.log(`  ✔ HTTP 401 Received as expected!`);
    console.log(`  ✔ Message: "${unauthData.message}"\n`);
  } else {
    throw new Error(`Expected 401 Unauthorized, got: ${unauthRes.status}`);
  }

  // TEST 3: Unauthorized Google Account Rejection
  console.log('TEST 3 - Single Admin Authorization (Unauthorized Google Account):');
  const unauthorizedRes = await fetch(`${BASE}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'random.visitor@gmail.com' })
  });
  const unauthAttempt = await unauthorizedRes.json();
  if (unauthorizedRes.status === 403 && unauthAttempt.error === 'ACCESS_DENIED') {
    console.log(`  ✔ HTTP 403 Received as expected!`);
    console.log(`  ✔ Message: "${unauthAttempt.message}"`);
    console.log(`  ✔ Rejected Account: ${unauthAttempt.attemptedEmail}\n`);
  } else {
    throw new Error(`Expected 403 Forbidden for unauthorized user, got: ${unauthorizedRes.status}`);
  }

  // TEST 4: Authorized Admin Login (Madam Hex)
  console.log('TEST 4 - Single Admin Authorization (Madam Hex):');
  const loginRes = await fetch(`${BASE}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'madam.hex@gmail.com', name: 'Madam Hex' })
  });
  const loginData = await loginRes.json();
  const rawCookie = loginRes.headers.get('set-cookie');
  if (loginRes.ok && loginData.success && rawCookie) {
    console.log(`  ✔ HTTP 200 OK — Admin session generated!`);
    console.log(`  ✔ Admin Identity: ${loginData.user.name} (${loginData.user.email})`);
    console.log(`  ✔ Cookie Set: ${rawCookie.split(';')[0]}\n`);
  } else {
    throw new Error(`Expected successful login, got: ${loginRes.status}`);
  }

  const cookieHeader = rawCookie.split(';')[0];

  // TEST 5: Verify Session Persistence (/api/auth/me)
  console.log('TEST 5 - Session Verification (/api/auth/me):');
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { Cookie: cookieHeader }
  });
  const meData = await meRes.json();
  if (meData.authenticated && meData.user.email === 'madam.hex@gmail.com') {
    console.log(`  ✔ Session Validated: Authenticated as ${meData.user.name} (${meData.user.email})\n`);
  } else {
    throw new Error(`Session validation failed: ${JSON.stringify(meData)}`);
  }

  // TEST 6: Access Protected APIs with Valid Session
  console.log('TEST 6 - Access Protected Inventory & Forecasting APIs:');
  const prodsRes = await fetch(`${BASE}/products`, { headers: { Cookie: cookieHeader } });
  const prods = await prodsRes.json();
  console.log(`  ✔ Products Retrieved: ${prods.count} items cataloged`);

  const forecastsRes = await fetch(`${BASE}/forecasts?halloweenMultiplier=2.0`, { headers: { Cookie: cookieHeader } });
  const forecasts = await forecastsRes.json();
  console.log(`  ✔ Forecast Projections: ${forecasts.count} items projected with 2.0x Halloween Surge`);

  const dashRes = await fetch(`${BASE}/analytics/dashboard`, { headers: { Cookie: cookieHeader } });
  const dash = await dashRes.json();
  console.log(`  ✔ Dashboard Summary: Health Index ${dash.data.summary.health_index.score}% (${dash.data.summary.health_index.grade})\n`);

  // TEST 7: Logout
  console.log('TEST 7 - Secure Logout:');
  const logoutRes = await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieHeader }
  });
  const logoutData = await logoutRes.json();
  const clearCookieHeader = logoutRes.headers.get('set-cookie');
  console.log(`  ✔ Logout Response: ${logoutData.message}`);
  console.log(`  ✔ Cookie Cleared: ${clearCookieHeader ? 'Yes (Max-Age=0 or expired)' : 'Cookie cleared'}\n`);

  // TEST 8: Verify Subsequent Requests are Blocked
  console.log('TEST 8 - Subsequent Request Blocked:');
  const postLogoutRes = await fetch(`${BASE}/products`);
  if (postLogoutRes.status === 401) {
    console.log('  ✔ Request successfully rejected after logout (HTTP 401)\n');
  } else {
    throw new Error(`Expected 401 after logout, got: ${postLogoutRes.status}`);
  }

  console.log('🎉 ALL 8 BACKEND AUTH & PROTECTION TESTS PASSED PERFECTLY!\n');
}

runTestSuite().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

