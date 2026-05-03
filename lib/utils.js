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

export const EXTRA_REGIONS = [
  { id: "Australia", flag: "🇦🇺", subtitle: "Sydney · Melbourne" },
  { id: "Indonesia", flag: "🇮🇩", subtitle: "Bali · Jakarta" },
  { id: "Vietnam", flag: "🇻🇳", subtitle: "Hanoi · HCMC" },
  { id: "United Kingdom", flag: "🇬🇧", subtitle: "London" },
  { id: "United States", flag: "🇺🇸", subtitle: "NYC · LA" },
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
  "Taxi",
  "Walk",
  "Flight",
];

export const REGION_TRANSPORT = {
  Japan: ["JR", "Shinkansen"],
  "South Korea": ["KTX"],
  Europe: ["Tram"],
  China: ["High-speed Rail", "Metro"],
};

export function getTransportOptions(regionId) {
  return [...(REGION_TRANSPORT[regionId] || []), ...GLOBAL_TRANSPORT];
}

// ============================================
// Currency
// ============================================

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

export const DEFAULT_RATE = 110;

// ============================================
// ID GENERATOR (FIX ERROR)
// ============================================

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// ============================================
// Booking (FIX ERROR)
// ============================================

export function getBookingLink() {
  return null;
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