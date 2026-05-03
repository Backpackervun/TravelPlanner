// ============================================
// Regions
// ============================================

export const CORE_REGIONS = [
  { id: "Japan",        flag: "🇯🇵", subtitle: "Tokyo · Osaka · Kyoto" },
  { id: "South Korea",  flag: "🇰🇷", subtitle: "Seoul · Busan · Jeju" },
  { id: "Thailand",     flag: "🇹🇭", subtitle: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore",    flag: "🇸🇬", subtitle: "City state" },
  { id: "Malaysia",     flag: "🇲🇾", subtitle: "KL · Penang · Borneo" },

  // ✅ TAMBAHAN CHINA (AMAN)
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
  Japan: ["JR", "Shinkansen"],
  "South Korea": ["KTX", "Subway"],
  Europe: ["Tram", "FlixBus"],

  // ✅ TAMBAHAN CHINA
  China: ["High-speed Rail", "Metro"],
};

export function getTransportOptions(regionId) {
  const extras = REGION_TRANSPORT[regionId] ?? [];
  const all = [...extras, ...GLOBAL_TRANSPORT];
  return Array.from(new Set(all));
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

  // ✅ TAMBAHAN CHINA
  China:             { code: "CNY", symbol: "¥",   name: "Chinese yuan" },
};

export function getCurrency(regionId) {
  return REGION_CURRENCY[regionId] ?? { code: "LOCAL", symbol: "", name: "Local currency" };
}

export const DEFAULT_RATE = 110;