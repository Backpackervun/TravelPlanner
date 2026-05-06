/**
 * lib/exchangeRates.js
 *
 * Fetches real-time exchange rates for the IDR conversion column.
 * Uses open.er-api.com (free, no API key needed, CORS-safe for browsers).
 *
 * Strategy:
 *   1. First load → fetch from API, store in module-level cache
 *   2. Cache expires after 1 hour → re-fetch
 *   3. If fetch fails (no internet, API down) → use hardcoded fallback rates
 *   4. User can still override any rate manually in the header
 */

// ── Fallback rates (1 UNIT of each currency → IDR) ───────────────────────────
// These are approximate. Only used when the API call fails.
const FALLBACK_RATES = {
  JPY: 105,
  KRW:   11,
  THB:  425,
  SGD: 11200,
  MYR: 3400,
  CNY: 2150,
  EUR: 17500,
  USD: 16000,
  AUD: 10500,
  GBP: 20000,
  VND:   0.63,
  IDR:   1,
};

// ── In-memory cache ───────────────────────────────────────────────────────────
let _cachedRates = null;       // { [currencyCode]: rateToIDR }
let _cacheTimestamp = 0;       // ms since epoch
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ── Fetcher ───────────────────────────────────────────────────────────────────

/**
 * Fetch all IDR-based rates from open.er-api.com.
 *
 * The endpoint returns:
 *   { base_code: "IDR", conversion_rates: { JPY: 0.0091, ... } }
 *
 * Meaning: 1 IDR = 0.0091 JPY → 1 JPY = 1/0.0091 IDR ≈ 110 IDR
 *
 * We invert each rate so the result map is "1 unit of X = ? IDR".
 */
async function fetchFromAPI() {
  const res = await fetch("https://open.er-api.com/v6/latest/IDR", {
    // 8-second timeout so we don't hang on slow connections
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.conversion_rates) throw new Error("Unexpected response shape");

  // Invert: 1 IDR = X [foreign] → 1 [foreign] = 1/X IDR
  const rates = {};
  for (const [code, valuePerIDR] of Object.entries(data.conversion_rates)) {
    if (valuePerIDR > 0) {
      rates[code] = 1 / valuePerIDR;
    }
  }
  return rates;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load exchange rates (from cache or API). Returns a map of
 * { [currencyCode]: rateToIDR }.
 *
 * Never throws — falls back to FALLBACK_RATES on error.
 */
export async function loadRates() {
  const now = Date.now();
  const cacheValid = _cachedRates && (now - _cacheTimestamp) < CACHE_TTL_MS;
  if (cacheValid) return _cachedRates;

  try {
    _cachedRates = await fetchFromAPI();
    _cacheTimestamp = now;
    return _cachedRates;
  } catch (err) {
    console.warn("[exchangeRates] API fetch failed, using fallback rates:", err.message);
    // Cache the fallback too, so we don't retry on every row edit
    _cachedRates = { ...FALLBACK_RATES };
    _cacheTimestamp = now;
    return _cachedRates;
  }
}

/**
 * Get the rate for a specific currency (1 unit → IDR).
 * Falls back to FALLBACK_RATES if not in cache.
 */
export function getRate(currencyCode) {
  if (!currencyCode || currencyCode === "IDR") return 1;
  const fromCache = _cachedRates?.[currencyCode];
  if (fromCache != null) return Math.round(fromCache);
  return FALLBACK_RATES[currencyCode] ?? 1;
}

/**
 * Force-refresh the cache (e.g. user clicks a "refresh rates" button).
 * Returns updated rates map.
 */
export async function refreshRates() {
  _cachedRates = null;
  _cacheTimestamp = 0;
  return loadRates();
}
