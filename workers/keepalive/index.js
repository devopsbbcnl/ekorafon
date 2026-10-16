// Cloudflare Worker that keeps the free-tier API awake (Render sleeps after
// ~15 min idle) and the Supabase project active, by calling an endpoint that
// queries the database.
//
// The cron trigger fires every 10 minutes; each run first waits a random
// 0-180 s, so consecutive pings land 10-13 minutes apart.

const MAX_JITTER_S = 180;
const ATTEMPTS = 3;
const RETRY_DELAY_S = 30;
const TIMEOUT_MS = 90_000; // a cold start can take up to a minute

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

async function ping(url) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const started = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      console.log(`attempt ${attempt}: ${res.status} ${url} (${Date.now() - started} ms)`);
      if (res.ok) return true;
    } catch (err) {
      console.log(`attempt ${attempt}: FAILED ${url}: ${err.message}`);
    }
    if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_S);
  }
  return false;
}

export default {
  async scheduled(controller, env, ctx) {
    const url = env.KEEPALIVE_URL;
    const jitter = Math.floor(Math.random() * (MAX_JITTER_S + 1));
    ctx.waitUntil(
      (async () => {
        await sleep(jitter);
        const ok = await ping(url);
        if (!ok) console.error(`keepalive gave up after ${ATTEMPTS} attempts: ${url}`);
      })(),
    );
  },
};
