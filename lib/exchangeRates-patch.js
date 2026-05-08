/**
 * lib/exchangeRates-patch.js
 *
 * FIX: USD (USA region) was not fetching live rates.
 *
 * INSTRUCTION: Open lib/exchangeRates.js and ensure the function
 * `fetchRateToIDR` handles ALL currencies including USD.
 *
 * The issue is likely that the function only fetched rates for a
 * hardcoded list that excluded USD. Replace with the version below.
 *
 * ─────────────────────────────────────────────────────────────────────
 * Replace the content of lib/exchangeRates.js with this:
 */

const CACHE = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch the live exchange rate from {code} → IDR.
 * Uses open.er-api.com which is free and covers all major currencies.
 *
 * Returns { rate: number, updatedAt: string }
 */
export async function fetchRateToIDR(currencyCode) {
  if (!currencyCode || currencyCode === "IDR") {
    return { rate: 1, updatedAt: new Date().toISOString() };
  }

  const code = currencyCode.toUpperCase();

  // Check cache
  const cached = CACHE[code];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { rate: cached.rate, updatedAt: cached.updatedAt };
  }

  try {
    // Fetch IDR rate relative to the given currency
    const res = await fetch(`https://open.er-api.com/v6/latest/${code}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.rates?.IDR) throw new Error("No IDR in response");

    const rate      = data.rates.IDR;
    const updatedAt = new Date(data.time_last_update_utc || Date.now()).toISOString();

    // Cache it
    CACHE[code] = { rate, updatedAt, ts: Date.now() };

    return { rate, updatedAt };
  } catch (err) {
    console.warn(`[exchangeRates] Failed to fetch ${code}→IDR:`, err.message);

    // Fallback rates for common currencies (used when API is down)
    const FALLBACK = {
      JPY: 111,
      KRW: 11,
      THB: 450,
      SGD: 11500,
      MYR: 3300,
      EUR: 17000,
      AUD: 10000,
      USD: 16200,  // ✅ USD fallback rate
      VND: 0.63,
      CNY: 2200,
    };

    const fallbackRate = FALLBACK[code] ?? 1;
    return { rate: fallbackRate, updatedAt: new Date().toISOString() };
  }
}

/**
 * Invalidate cached rate for a currency (call when region changes).
 */
export function invalidateRate(currencyCode) {
  if (currencyCode) delete CACHE[currencyCode.toUpperCase()];
}

/**
 * DEFAULT_RATE export (used as fallback before live rate loads)
 * This is already defined in lib/utils.js — do not duplicate.
 * Just make sure fetchRateToIDR is called on region change.
 */
