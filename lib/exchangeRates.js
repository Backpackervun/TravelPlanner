/**
 * lib/exchangeRates.js — Complete replacement (Patch 14d)
 *
 * FIX: USD (and all non-IDR currencies) now fetch live rates.
 * Previously USD was likely returning 1 (IDR fallback) because
 * getCurrency("USA") returned the IDR default.
 *
 * Uses open.er-api.com — free, no API key required.
 */

const CACHE     = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live exchange rate from `currencyCode` → IDR.
 * @returns {{ rate: number, updatedAt: string }}
 */
export async function fetchRateToIDR(currencyCode) {
  if (!currencyCode || currencyCode === "IDR") {
    return { rate: 1, updatedAt: new Date().toISOString() };
  }

  const code = currencyCode.toUpperCase();

  // Return cached rate if fresh
  const cached = CACHE[code];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { rate: cached.rate, updatedAt: cached.updatedAt };
  }

  try {
    const res  = await fetch(`https://open.er-api.com/v6/latest/${code}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.rates?.IDR) throw new Error("IDR not in response");

    const rate      = data.rates.IDR;
    const updatedAt = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toISOString()
      : new Date().toISOString();

    CACHE[code] = { rate, updatedAt, ts: Date.now() };
    return { rate, updatedAt };

  } catch (err) {
    console.warn(`[exchangeRates] ${code}→IDR failed:`, err.message);

    // Fallback rates (approximate, used only when API is unreachable)
    const FALLBACK = {
      JPY:  111,
      KRW:  11,
      THB:  450,
      SGD:  11500,
      MYR:  3300,
      EUR:  17000,
      AUD:  10500,
      USD:  16200,   // ✅ USD fallback
      VND:  0.63,
      CNY:  2200,
    };

    const rate = FALLBACK[code] ?? 1;
    return { rate, updatedAt: new Date().toISOString() };
  }
}

/**
 * Invalidate cached rate for a currency.
 * Call when the user changes region so a fresh rate is fetched.
 */
export function invalidateRate(currencyCode) {
  if (currencyCode) delete CACHE[currencyCode.toUpperCase()];
}
