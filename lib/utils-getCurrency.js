/**
 * lib/utils-getCurrency.js — Patch 14d
 *
 * INSTRUCTION: Open lib/utils.js and find the `getCurrency` function.
 * Replace it entirely with the function below, AND update the CURRENCIES
 * map to include USA → USD.
 *
 * ─────────────────────────────────────────────────────────────────────
 * FULL REPLACEMENT for the currency section of lib/utils.js:
 */

const CURRENCIES = {
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
  "USA":          { code: "USD",  symbol: "$",   locale: "en-US" },  // ✅ USD
};

const DEFAULT_CURRENCY = { code: "IDR", symbol: "Rp", locale: "id-ID" };

export function getCurrency(region) {
  return CURRENCIES[region] ?? DEFAULT_CURRENCY;
}

export function formatCurrency(amount, currency) {
  if (!amount && amount !== 0) return `${currency.symbol}0`;
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: ["IDR", "VND", "KRW"].includes(currency.code) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  }
}

export function formatIDR(amount) {
  if (!amount && amount !== 0) return "Rp 0";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  }
}
