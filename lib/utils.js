// ============================================
// Regions
// ============================================

export const CORE_REGIONS = [
  { id: "Japan", flag: "🇯🇵", subtitle: "Tokyo · Osaka · Kyoto" },
  { id: "South Korea", flag: "🇰🇷", subtitle: "Seoul · Busan · Jeju" },
  { id: "Thailand", flag: "🇹🇭", subtitle: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore", flag: "🇸🇬", subtitle: "City state" },
  { id: "Malaysia", flag: "🇲🇾", subtitle: "KL · Penang · Borneo" },
  { id: "China", flag: "🇨🇳", subtitle: "Beijing · Shanghai · Guangzhou" },
  { id: "Europe", flag: "🇪🇺", subtitle: "Trains, trams, FlixBus" },
];

export const REGION_CURRENCY = {
  Japan: { code: "JPY", symbol: "¥" },
  "South Korea": { code: "KRW", symbol: "₩" },
  Singapore: { code: "SGD", symbol: "S$" },
  Thailand: { code: "THB", symbol: "฿" },
  Europe: { code: "EUR", symbol: "€" },
  Malaysia: { code: "MYR", symbol: "RM " },
  China: { code: "CNY", symbol: "¥" },
};

export function getCurrency(region) {
  return REGION_CURRENCY[region] ?? { code: "LOCAL", symbol: "" };
}

// ============================================
// Categories (FIX ERROR)
// ============================================

export const CATEGORY_OPTIONS = ["Hotel", "Food", "Attraction", "Activity", "Transport"];

export const CATEGORY_ICONS = {
  Hotel: "🏨",
  Food: "🍜",
  Attraction: "📍",
  Activity: "🎯",
  Transport: "🚆",
};

export const CATEGORY_STYLES = {
  Hotel: { bar: "#8B5CF6" },
  Food: { bar: "#F59E0B" },
  Attraction: { bar: "#10B981" },
  Activity: { bar: "#3B82F6" },
  Transport: { bar: "#0B3C5D" },
};

// ============================================
// Transport
// ============================================

export function transportIcon(t) {
  if (!t) return "🚩";
  const k = t.toLowerCase();
  if (k.includes("flight")) return "✈️";
  if (k.includes("train")) return "🚆";
  if (k.includes("metro")) return "🚇";
  if (k.includes("bus")) return "🚌";
  return "🚗";
}

export function transportColor() {
  return "#0B3C5D";
}

// ============================================
// Helpers (FIX ERROR)
// ============================================

export function generated() {
  return true;
}

export function formatLocal(n) {
  return (Number(n) || 0).toLocaleString("en-US");
}

export function checkRegionMismatch() {
  return false;
}

// ============================================
// Map
// ============================================

export function buildMapUrl(destination) {
  if (!destination) return null;
  return `https://www.google.com/maps/search/?query=${encodeURIComponent(destination)}`;
}

export function buildRouteUrl(from, to) {
  if (!from || !to) return null;
  return `https://www.google.com/maps/dir/?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
}

// ============================================
// Format
// ============================================

export function formatCurrency(n, currency) {
  return (currency?.symbol ?? "") + (Number(n) || 0).toLocaleString("en-US");
}

export function formatIDR(n) {
  return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
}