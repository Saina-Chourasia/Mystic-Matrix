const fs = require('fs');
const path = require('path');
const authService = require('../backend/services/authService');

async function captureOne(url, outPath, width = 1280, height = 750, asAdmin = false) {
  console.log(`\n--- Capturing: ${url} (Admin: ${asAdmin}) ---`);
  const encoded = encodeURIComponent(url);
  const targetRes = await fetch(`http://localhost:9222/json/new?${encoded}`, { method: 'PUT' });
  const target = await targetRes.json();
  const wsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data.result);
    }
  };

  await new Promise((res) => (ws.onopen = res));

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  if (asAdmin) {
    const adminToken = authService.createSessionToken({
      email: 'madam.hex@gmail.com',
      name: 'Madam Hex',
      picture: '',
      role: 'admin'
    });
    await send('Network.setCookie', {
      name: 'mystic_admin_session',
      value: adminToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
    // Reload so cookies apply to initial document request
    await send('Page.navigate', { url });
  } else {
    await send('Network.clearBrowserCookies');
    await send('Page.navigate', { url });
  }

  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: false
  });

  // Wait for React to render
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const evalRes = await send('Runtime.evaluate', {
      expression: 'Boolean(document.getElementById("root") && document.getElementById("root").innerText.length > 50)',
      returnByValue: true
    });
    if (evalRes && evalRes.result && evalRes.result.value) {
      ready = true;
      break;
    }
  }

  console.log(`Page ready: ${ready}, waiting 1500ms for images and animations...`);
  await new Promise((r) => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(shot.data, 'base64');
  fs.writeFileSync(outPath, buffer);
  console.log(`✔ Saved screenshot: ${outPath} (${buffer.length} bytes)`);

  await send('Target.closeTarget', { targetId: target.id });
  ws.close();
}

async function main() {
  const outDir = '/Users/sainakumari/Desktop/Hexventory/docs/screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tasks = [
    { name: '1_day_landing.png', url: 'http://localhost:5001/?theme=day&tab=welcome', w: 1280, h: 720, admin: false },
    { name: '2_night_landing.png', url: 'http://localhost:5001/?theme=night&tab=welcome', w: 1280, h: 720, admin: false },
    { name: '3_day_inventory.png', url: 'http://localhost:5001/?theme=day&tab=inventory', w: 1280, h: 800, admin: true },
    { name: '4_night_inventory.png', url: 'http://localhost:5001/?theme=night&tab=inventory', w: 1280, h: 800, admin: true },
    { name: '5_login_night.png', url: 'http://localhost:5001/?theme=night&tab=login', w: 1280, h: 750, admin: false },
    { name: '6_login_day.png', url: 'http://localhost:5001/?theme=day&tab=login', w: 1280, h: 750, admin: false },
    { name: '7_login_access_denied.png', url: 'http://localhost:5001/?theme=night&tab=login&error=access_denied&email=random.user@gmail.com', w: 1280, h: 750, admin: false },
    { name: '8_admin_overview_night.png', url: 'http://localhost:5001/?theme=night&tab=overview', w: 1280, h: 800, admin: true },
    { name: '9_admin_overview_day.png', url: 'http://localhost:5001/?theme=day&tab=overview', w: 1280, h: 800, admin: true },
    { name: 'resp_1920_day.png', url: 'http://localhost:5001/?theme=day&tab=welcome', w: 1920, h: 1080, admin: false },
    { name: 'resp_1440_night.png', url: 'http://localhost:5001/?theme=night&tab=welcome', w: 1440, h: 900, admin: false },
    { name: 'resp_1024_day.png', url: 'http://localhost:5001/?theme=day&tab=welcome', w: 1024, h: 768, admin: false },
    { name: 'resp_768_night.png', url: 'http://localhost:5001/?theme=night&tab=welcome', w: 768, h: 1024, admin: false },
    { name: 'resp_390_mobile.png', url: 'http://localhost:5001/?theme=night&tab=welcome', w: 390, h: 844, admin: false }
  ];

  for (const t of tasks) {
    const dest = path.join(outDir, t.name);
    await captureOne(t.url, dest, t.w, t.h, t.admin);
  }

  console.log('\n🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
