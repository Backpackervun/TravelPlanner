/**
 * lib/exchangeRates.js
 *
 * CORRECT approach: fetch with the SOURCE currency as base,
 * then read .rates.IDR directly for exact 1-to-1 conversion.
 *
 * Example:
 *   GET https://open.er-api.com/v6/latest/EUR
 *   → data.rates.IDR = 20123
 *   → 1 EUR = 20,123 IDR  ✅
 *
 * This is more accurate than fetching IDR as base and inverting.
 */

// Per-currency cache — { EUR: { rate, updatedAt, ts } }
const _cache = {};
const TTL    = 60 * 60 * 1000; // 1 hour

/** Fetch 1 unit of `currencyCode` → IDR. Caches result for 1 hour. */
export async function fetchRateToIDR(currencyCode) {
  if (!currencyCode || currencyCode === "IDR") return { rate: 1, updatedAt: new Date().toISOString(), source: "same" };

  const now     = Date.now();
  const cached  = _cache[currencyCode];
  if (cached && now - cached.ts < TTL) {
    return { rate: cached.rate, updatedAt: cached.updatedAt, source: "cache" };
  }

  const res = await fetch(
    `https://open.er-api.com/v6/latest/${currencyCode}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${currencyCode}`);
  const json = await res.json();
  if (json.result !== "success") throw new Error(`API error: ${json["error-type"]}`);
  if (!json.rates?.IDR) throw new Error(`IDR not in rates for ${currencyCode}`);

  const rate       = Math.round(json.rates.IDR);
  const updatedAt  = json.time_last_update_utc ?? new Date().toUTCString();

  _cache[currencyCode] = { rate, updatedAt, ts: now };
  return { rate, updatedAt, source: "live" };
}

/** Get cached rate for a currency without re-fetching. Returns null if not cached. */
export function getCachedRate(currencyCode) {
  if (currencyCode === "IDR") return { rate: 1, updatedAt: null };
  return _cache[currencyCode] ?? null;
}

/** Invalidate cache for a currency (force re-fetch next time). */
export function invalidateRate(currencyCode) {
  delete _cache[currencyCode];
}
