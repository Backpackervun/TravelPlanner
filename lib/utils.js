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
  if (!region) {
    return {
      code: "JPY",
      symbol: "¥",
      locale: "ja-JP",
    };
  }

  // Handle object region
  if (typeof region === "object") {
    region = region.id || region.name || "";
  }

  const found = CURRENCIES[String(region).trim()];

  return (
    found || {
      code: "JPY",
      symbol: "¥",
      locale: "ja-JP",
    }
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatCurrency(amount, currency) {
  const safeCurrency = currency || {
    code: "JPY",
    symbol: "¥",
    locale: "ja-JP",
  };

  const value = Number(amount || 0);

  try {
    return new Intl.NumberFormat(safeCurrency.locale, {
      style: "currency",
      currency: safeCurrency.code,
      maximumFractionDigits: ["IDR", "VND", "KRW"].includes(safeCurrency.code)
        ? 0
        : 2,
    }).format(value);
  } catch {
    return `${safeCurrency.symbol}${value.toLocaleString()}`;
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
// ── Chart category styles ────────────────────────────────────────────────────

export const CATEGORY_STYLES = {
  Hotel: {
    bar: "#2563EB",
  },
  Food: {
    bar: "#F59E0B",
  },
  Attraction: {
    bar: "#8B5CF6",
  },
  Activity: {
    bar: "#10B981",
  },
  Transport: {
    bar: "#EF4444",
  },
};

// ── Transport chart colors ──────────────────────────────────────────────────

export function transportColor(name = "") {
  const key = String(name).toLowerCase();

  if (key.includes("flight")) return "#2563EB";
  if (key.includes("train")) return "#10B981";
  if (key.includes("bus")) return "#F59E0B";
  if (key.includes("car")) return "#8B5CF6";
  if (key.includes("walk")) return "#6B7280";
  if (key.includes("taxi")) return "#EF4444";
  if (key.includes("ferry")) return "#06B6D4";

  return "#94A3B8";
}

// ── Simple local formatter ──────────────────────────────────────────────────

export function formatLocal(amount) {
  const num = Number(amount || 0);

  return num.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}
// ─────────────────────────────────────────────────────────────
// MAP / ROUTE HELPERS
// ─────────────────────────────────────────────────────────────

export function buildMapUrl(destination = "") {
  if (!destination) return "#";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

export function buildRouteUrl(from = "", to = "") {
  if (!from || !to) return "#";

  return `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
}

// ─────────────────────────────────────────────────────────────
// BOOKING HELPERS
// ─────────────────────────────────────────────────────────────

export function getBookingLink(row = {}, region = "") {
  const q =
    row.destination ||
    row.city ||
    region ||
    "";

  if (!q) {
    return "https://www.booking.com";
  }

  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q)}`;
}

// ─────────────────────────────────────────────────────────────
// TRANSPORT ICONS
// ─────────────────────────────────────────────────────────────

export function transportIcon(transport = "") {
  const key = String(transport).toLowerCase();

  if (key.includes("flight")) return "✈️";
  if (key.includes("train")) return "🚆";
  if (key.includes("bus")) return "🚌";
  if (key.includes("car")) return "🚗";
  if (key.includes("walk")) return "🚶";
  if (key.includes("taxi")) return "🚕";
  if (key.includes("ferry")) return "⛴️";

  return "📍";
}