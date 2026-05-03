// ============================================
// Regions
// ============================================

export const CORE_REGIONS = [
  { id: "Japan",        flag: "🇯🇵", subtitle: "Tokyo · Osaka · Kyoto" },
  { id: "South Korea",  flag: "🇰🇷", subtitle: "Seoul · Busan · Jeju" },
  { id: "Thailand",     flag: "🇹🇭", subtitle: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore",    flag: "🇸🇬", subtitle: "City state" },
  { id: "Malaysia",     flag: "🇲🇾", subtitle: "KL · Penang · Borneo" },

  // ✅ CHINA (DITAMBAHKAN)
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
// Categories
// ============================================

export const CATEGORY_OPTIONS = ["Hotel", "Food", "Attraction", "Activity", "Transport"];

export const CATEGORY_ICONS = {
  Hotel:      "🏨",
  Food:       "🍜",
  Attraction: "🎯",
  Activity:   "🎡",
  Transport:  "🚆",
};

export const CATEGORY_STYLES = {
  Hotel: {
    chip: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-cat-hotel",
    bar: "#8B5CF6",
  },
  Food: {
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-cat-meals",
    bar: "#F59E0B",
  },
  Attraction: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-cat-attraction",
    bar: "#10B981",
  },
  Activity: {
    chip: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-cat-transport",
    bar: "#3B82F6",
  },
  Transport: {
    chip: "bg-navy-50 text-navy-500 ring-1 ring-navy-100",
    dot: "bg-navy-500",
    bar: "#0B3C5D",
  },
};

// ============================================
// Transport icons
// ============================================

export function transportIcon(t) {
  if (!t) return "🚩";
  const k = t.toLowerCase();
  if (k.includes("flight")) return "✈️";
  if (k.includes("shinkansen") || k.includes("ktx")) return "🚄";
  if (k.includes("ferry")) return "⛴️";
  if (k.includes("walk")) return "🚶";
  if (k.includes("taxi") || k.includes("ride")) return "🚕";
  if (k.includes("car")) return "🚗";
  if (k.includes("flixbus") || k.includes("bus")) return "🚌";
  if (k.includes("tram")) return "🚊";
  if (k.includes("metro") || k.includes("subway")) return "🚇";
  if (k.includes("jr") || k.includes("train")) return "🚆";
  return "🚩";
}

export const TRANSPORT_COLORS = {
  "Flight": "#8B5CF6",
  "Shinkansen": "#0EA5E9",
  "KTX": "#0EA5E9",
  "Train": "#0B3C5D",
  "JR": "#0B3C5D",
  "Tram": "#1D5C8C",
  "Metro / Subway": "#1E40AF",
  "Subway": "#1E40AF",
  "Bus": "#10B981",
  "FlixBus": "#10B981",
  "Car": "#F59E0B",
  "Taxi / Ride-hailing": "#F97316",
  "Walk": "#94A3B8",
  "Ferry": "#0EA5E9",
};

export function transportColor(t) {
  return TRANSPORT_COLORS[t] ?? "#6B7280";
}

// ============================================
// Currency
// ============================================

export const REGION_CURRENCY = {
  Japan:             { code: "JPY", symbol: "¥",   name: "Japanese yen" },
  "South Korea":     { code: "KRW", symbol: "₩",   name: "Korean won" },
  Singapore:         { code: "SGD", symbol: "S$",  name: "Singapore dollar" },
  Thailand:          { code: "THB", symbol: "฿",   name: "Thai baht" },
  Europe:            { code: "EUR", symbol: "€",   name: "Euro" },
  Australia:         { code: "AUD", symbol: "A$",  name: "Australian dollar" },
  Indonesia:         { code: "IDR", symbol: "Rp ", name: "Indonesian rupiah" },
  Malaysia:          { code: "MYR", symbol: "RM ", name: "Malaysian ringgit" },
  Vietnam:           { code: "VND", symbol: "₫",   name: "Vietnamese dong" },
  "United Kingdom":  { code: "GBP", symbol: "£",   name: "Pound sterling" },
  "United States":   { code: "USD", symbol: "$",   name: "US dollar" },

  // ✅ CHINA
  China:             { code: "CNY", symbol: "¥",   name: "Chinese yuan" },
};

export function getCurrency(regionId) {
  return REGION_CURRENCY[regionId] ?? { code: "LOCAL", symbol: "", name: "Local currency" };
}

export const DEFAULT_RATE = 110;

export function formatCurrency(n, currency) {
  const value = Number(n) || 0;
  return (currency?.symbol ?? "") + value.toLocaleString("en-US");
}

export function formatIDR(n) {
  const value = Number(n) || 0;
  return "Rp " + value.toLocaleString("id-ID");
}