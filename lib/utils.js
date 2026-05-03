// ============================================
// Regions
// ============================================

export const CORE_REGIONS = [
  { id: "Japan",        flag: "🇯🇵", subtitle: "Tokyo · Osaka · Kyoto" },
  { id: "South Korea",  flag: "🇰🇷", subtitle: "Seoul · Busan · Jeju" },
  { id: "Thailand",     flag: "🇹🇭", subtitle: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore",    flag: "🇸🇬", subtitle: "City state" },
  { id: "Malaysia",     flag: "🇲🇾", subtitle: "KL · Penang · Borneo" },

  // ✅ CHINA
  { id: "China",        flag: "🇨🇳", subtitle: "Beijing · Shanghai · Guangzhou" },

  { id: "Europe",       flag: "🇪🇺", subtitle: "Trains, trams, FlixBus" },
];

export const EXTRA_REGIONS = [
  { id: "Australia",       flag: "🇦🇺", subtitle: "Sydney · Melbourne · Cairns" },
  { id: "Indonesia",       flag: "🇮🇩", subtitle: "Bali · Jakarta · Yogyakarta" },
  { id: "Vietnam",         flag: "🇻🇳", subtitle: "Hanoi · HCMC · Hoi An" },
  { id: "United Kingdom",  flag: "🇬🇧", subtitle: "London · Edinburgh · Manchester" },
  { id: "United States",   flag: "🇺🇸", subtitle: "NYC · LA · Vegas" },
];

export const ALL_REGIONS = [...CORE_REGIONS, ...EXTRA_REGIONS];

export function getRegion(regionId) {
  return ALL_REGIONS.find((r) => r.id === regionId) ?? null;
}

// ============================================
// Transport
// ============================================

export const GLOBAL_TRANSPORT = [
  "Train",
  "Metro / Subway",
  "Bus",
  "Car",
  "Taxi / Ride-hailing",
  "Walk",
  "Flight",
  "Ferry",
];

export const REGION_TRANSPORT = {
  Japan:           ["JR", "Shinkansen"],
  "South Korea":   ["KTX", "Subway"],
  Europe:          ["Tram", "FlixBus"],

  // ✅ CHINA
  China:           ["High-speed Rail", "Metro"],
};

export function getTransportOptions(regionId) {
  const extras = REGION_TRANSPORT[regionId] ?? [];
  const all = [...extras, ...GLOBAL_TRANSPORT];
  return Array.from(new Set(all));
}

// ============================================
// Categories (FIX ERROR)
// ============================================

export const CATEGORY_OPTIONS = ["Hotel", "Food", "Attraction", "Activity", "Transport"];

export const CATEGORY_STYLES = {
  Hotel: { bar: "#8B5CF6" },
  Food: { bar: "#F59E0B" },
  Attraction: { bar: "#10B981" },
  Activity: { bar: "#3B82F6" },
  Transport: { bar: "#0B3C5D" },
};

// ============================================
// Icons (FIX ERROR)
// ============================================

export function transportIcon(t) {
  if (!t) return "🚩";
  const k = t.toLowerCase();
  if (k.includes("flight")) return "✈️";
  if (k.includes("train")) return "🚆";
  if (k.includes("metro")) return "🚇";
  if (k.includes("bus")) return "🚌";
  if (k.includes("car")) return "🚗";
  return "🚩";
}

// ============================================
// Map (FIX ERROR)
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
// Booking (FIX ERROR)
// ============================================

export function getBookingLink() {
  return null; // simple fallback
}

// ============================================
// Currency
// ============================================

export const REGION_CURRENCY = {
  Japan:             { code: "JPY", symbol: "¥" },
  "South Korea":     { code: "KRW", symbol: "₩" },
  Singapore:         { code: "SGD", symbol: "S$" },
  Thailand:          { code: "THB", symbol: "฿" },
  Europe:            { code: "EUR", symbol: "€" },
  Australia:         { code: "AUD", symbol: "A$" },
  Indonesia:         { code: "IDR", symbol: "Rp " },
  Malaysia:          { code: "MYR", symbol: "RM " },
  Vietnam:           { code: "VND", symbol: "₫" },
  "United Kingdom":  { code: "GBP", symbol: "£" },
  "United States":   { code: "USD", symbol: "$" },

  // ✅ CHINA
  China:             { code: "CNY", symbol: "¥" },
};

export function getCurrency(regionId) {
  return REGION_CURRENCY[regionId] ?? { code: "LOCAL", symbol: "" };
}

export const DEFAULT_RATE = 110;

// ============================================
// Format
// ============================================

export function formatCurrency(n, currency) {
  return (currency?.symbol ?? "") + (Number(n) || 0).toLocaleString("en-US");
}

export function formatIDR(n) {
  return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
}