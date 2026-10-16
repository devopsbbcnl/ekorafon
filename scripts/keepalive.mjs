#!/usr/bin/env node
// Keeps the free-tier API awake (Render sleeps after ~15 min idle) and the
// Supabase project active by hitting an endpoint that queries the database.
//
// Usage:  node scripts/keepalive.mjs
// Env:    KEEPALIVE_URL   default https://nelly.ekorafon.com/api/health/db
//         MIN_MINUTES     default 10
//         MAX_MINUTES     default 13   (must stay under Render's 15 min idle limit)
//
// Run it on a machine that is always on (VPS, home server, Raspberry Pi) under
// pm2, systemd, or a Windows scheduled task. No dependencies; needs Node 18+.

const URL_ = process.env.KEEPALIVE_URL || "https://nelly.ekorafon.com/api/health/db";
const MIN = Number(process.env.MIN_MINUTES || 10);
const MAX = Number(process.env.MAX_MINUTES || 13);

if (!(MIN > 0 && MAX >= MIN && MAX < 15)) {
  console.error("MIN_MINUTES/MAX_MINUTES must satisfy 0 < min <= max < 15");
  process.exit(1);
}

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ping() {
  const started = Date.now();
  try {
    // A cold start can take up to a minute, so allow a generous timeout.
    const res = await fetch(URL_, { signal: AbortSignal.timeout(90_000) });
    log(`${res.status} ${URL_} (${Date.now() - started} ms)`);
    return res.ok;
  } catch (err) {
    log(`FAILED ${URL_}: ${err.message}`);
    return false;
  }
}

while (true) {
  const ok = await ping();
  // After a failure, retry sooner so a sleeping instance is woken quickly.
  const minutes = ok ? MIN + Math.random() * (MAX - MIN) : 2;
  log(`next ping in ${minutes.toFixed(1)} min`);
  await sleep(minutes * 60_000);
}
