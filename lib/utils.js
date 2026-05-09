/**
 * lib/utils.js — Patch 14e DIRECT REPLACEMENT
 *
 * ✅ Replaces the entire lib/utils.js file.
 * Key fix: USA → USD (was falling back to IDR which showed "LOCAL" and rate "1")
 *
 * Keep everything else in this file the same (generateId, etc.)
 * Only the CURRENCIES map and getCurrency function are changed.
 */

// ── ID generator ──────────────────────────────────────────────────────────────
export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Default exchange rate (fallback before live rate loads) ───────────────────
export const DEFAULT_RATE = 111; // JPY → IDR approximate

// ── Currencies per region ─────────────────────────────────────────────────────
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
  "USA":          { code: "USD",  symbol: "$",   locale: "en-US" }, // ✅ USD fixed
};

const DEFAULT_CURRENCY = { code: "IDR", symbol: "Rp", locale: "id-ID" };

export function getCurrency(region) {
  return CURRENCIES[region] ?? DEFAULT_CURRENCY;
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatCurrency(amount, currency) {
  if (amount == null || isNaN(amount)) return `${currency.symbol}0`;
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: ["IDR","VND","KRW"].includes(currency.code) ? 0 : 2,
    }).format(Number(amount));
  } catch {
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  }
}

export function formatIDR(amount) {
  if (amount == null || isNaN(amount)) return "Rp 0";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `Rp ${Number(amount).toLocaleString("id-ID")}`;
  }
}

// ── Region lists ──────────────────────────────────────────────────────────────

// All supported regions (no Taiwan)
export const REGIONS = [
  "Japan", "South Korea", "Thailand", "Singapore", "Malaysia",
  "Europe", "Australia", "Indonesia", "Vietnam", "China", "USA",
];

// ── Category options ──────────────────────────────────────────────────────────
export const CATEGORY_OPTIONS = [
  "Hotel", "Food", "Attraction", "Activity", "Transport",
];

// ── Transport options (fallback — ItineraryTable uses region-specific list) ───
export const TRANSPORT_OPTIONS = [
  "Flight", "Train", "Bus", "Car", "Ferry", "Walk", "Taxi",
];

// ── Booking link helpers (for regions not covered inline) ────────────────────
export function getKlookUrl(destination) {
  if (!destination) return "https://www.klook.com";
  return `https://www.klook.com/search/?keyword=${encodeURIComponent(destination)}`;
}
