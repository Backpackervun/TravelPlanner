/**
 * lib/exchangeRates.js
 *
 * Live exchange rates with 1-hour in-memory cache.
 * API: open.er-api.com (free, no key, CORS-safe for browsers)
 *
 * All rates stored as: 1 unit of FOREIGN currency → how many IDR
 */

const FALLBACK = {
  JPY: 105, KRW: 11,   THB: 425,  SGD: 11200,
  MYR: 3400, EUR: 17500, CNY: 2150, VND: 0.63,
  TWD: 500,  HKD: 2050, AUD: 10500, GBP: 20000,
  USD: 16000, IDR: 1,
};

let _cache = null;
let _ts    = 0;
const TTL  = 60 * 60 * 1000; // 1 hour

async function _fetchRates() {
  // Fetch with IDR as base. Response: { conversion_rates: { JPY: 0.0091, ... } }
  // Invert: 1 IDR = 0.0091 JPY  →  1 JPY = 1/0.0091 IDR ≈ 110 IDR
  const r = await fetch("https://open.er-api.com/v6/latest/IDR", {
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = await r.json();
  if (!json?.conversion_rates) throw new Error("Bad response");
  const out = {};
  for (const [code, perIDR] of Object.entries(json.conversion_rates)) {
    if (perIDR > 0) out[code] = Math.round(1 / perIDR);
  }
  return out;
}

/** Load rates (from cache or API). Never throws — falls back to FALLBACK. */
export async function loadRates() {
  const now = Date.now();
  if (_cache && now - _ts < TTL) return _cache;
  try {
    _cache = await _fetchRates();
    _ts    = now;
  } catch (e) {
    console.warn("[rates] API failed, using fallback:", e.message);
    if (!_cache) _cache = { ...FALLBACK };
    _ts = now; // suppress retries for TTL period
  }
  return _cache;
}

/** Get rate for one currency code (1 unit → IDR). Uses cache or fallback. */
export function getRate(code) {
  if (!code || code === "IDR") return 1;
  return _cache?.[code] ?? FALLBACK[code] ?? 1;
}

/** Force-expire the cache and re-fetch. Returns { rates, source }. */
export async function refreshRates() {
  _cache = null; _ts = 0;
  const rates = await loadRates();
  const source = rates === FALLBACK ? "fallback" : "live";
  return { rates, source };
}
