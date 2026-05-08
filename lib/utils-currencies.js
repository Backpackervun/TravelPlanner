/**
 * lib/utils-currencies.js
 *
 * Patch for getCurrency() in lib/utils.js
 *
 * PROBLEM: USA shows "LOCAL" instead of "USD $"
 * Fix: Update the CURRENCIES map in lib/utils.js to include USA → USD
 *
 * INSTRUCTION: In lib/utils.js, find the CURRENCIES object (or array)
 * and make sure it contains this entry for USA:
 *
 * "USA": { code: "USD", symbol: "$", locale: "en-US" }
 *
 * Also REMOVE "Taiwan" from any REGIONS list in utils.js if present.
 *
 * If getCurrency() uses a switch/map, add:
 *   case "USA": return { code: "USD", symbol: "$", locale: "en-US" };
 *
 * ─────────────────────────────────────────────────────────────────────
 * If you prefer, replace the getCurrency function in lib/utils.js with
 * this complete version:
 */

const CURRENCY_MAP = {
  "Japan":        { code: "JPY",  symbol: "¥",   locale: "ja-JP" },
  "South Korea":  { code: "KRW",  symbol: "₩",   locale: "ko-KR" },
  "Thailand":     { code: "THB",  symbol: "฿",   locale: "th-TH" },
  "Singapore":    { code: "SGD",  symbol: "S$",  locale: "en-SG" },
  "Malaysia":     { code: "MYR",  symbol: "RM",  locale: "ms-MY" },
  "Europe":       { code: "EUR",  symbol: "€",   locale: "de-DE" },
  "Australia":    { code: "AUD",  symbol: "A$",  locale: "en-AU" },
  "Indonesia":    { code: "IDR",  symbol: "Rp",  locale: "id-ID" },
  "Vietnam":      { code: "VND",  symbol: "₫",   locale: "vi-VN" },
  "China":        { code: "CNY",  symbol: "¥",   locale: "zh-CN" },
  "USA":          { code: "USD",  symbol: "$",   locale: "en-US" },
  // IDR fallback
  "default":      { code: "IDR",  symbol: "Rp",  locale: "id-ID" },
};

/**
 * Replace getCurrency in lib/utils.js with this function:
 */
export function getCurrency(region) {
  return CURRENCY_MAP[region] ?? CURRENCY_MAP.default;
}

/**
 * Replace formatCurrency in lib/utils.js with this (handles all currencies):
 */
export function formatCurrency(amount, currency) {
  if (!amount && amount !== 0) return `${currency.symbol}0`;
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: currency.code === "VND" || currency.code === "IDR" || currency.code === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  }
}
