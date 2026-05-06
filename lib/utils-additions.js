// ============================================================
// ADDITIONS TO lib/utils.js
// Copy-paste each block into the correct location in your file.
// ============================================================


// ── 1. Add China to EXTRA_REGIONS array ─────────────────────────────────────
// Find:   export const EXTRA_REGIONS = [
// Add this entry at the TOP of the EXTRA_REGIONS array:

  { id: "China",         flag: "🇨🇳", subtitle: "Beijing · Shanghai · Guangzhou" },

// ── 2. Add CNY to REGION_CURRENCY object ─────────────────────────────────────
// Find:   export const REGION_CURRENCY = {
// Add this line anywhere inside the object:

  China: { code: "CNY", symbol: "¥", name: "Chinese yuan" },

// ── 3. Add China keywords to REGION_KEYWORDS ─────────────────────────────────
// Find:   const REGION_KEYWORDS = {
// Add this block inside the object:

  China: [
    "beijing", "shanghai", "guangzhou", "shenzhen", "chengdu", "hangzhou",
    "xian", "xi'an", "suzhou", "nanjing", "chongqing", "guilin", "zhangjiajie",
    "great wall", "forbidden city", "yellow mountain", "huangshan",
    "terracotta", "west lake", "bund", "pudong",
  ],

// ── 4. Verify REGION_TRANSPORT — no changes needed for China ─────────────────
// China uses the global baseline (Train, Metro/Subway, Bus, Flight, etc.)
// so nothing extra is required in REGION_TRANSPORT.


// ── FULL UPDATED EXTRA_REGIONS (paste this whole block to replace yours) ─────

export const EXTRA_REGIONS = [
  { id: "China",         flag: "🇨🇳", subtitle: "Beijing · Shanghai · Guangzhou" },
  { id: "Australia",     flag: "🇦🇺", subtitle: "Sydney · Melbourne · Cairns" },
  { id: "Indonesia",     flag: "🇮🇩", subtitle: "Bali · Jakarta · Yogyakarta" },
  { id: "Vietnam",       flag: "🇻🇳", subtitle: "Hanoi · HCMC · Hoi An" },
  { id: "United Kingdom",flag: "🇬🇧", subtitle: "London · Edinburgh · Manchester" },
  { id: "United States", flag: "🇺🇸", subtitle: "NYC · LA · Vegas" },
];

// ── FULL UPDATED REGION_CURRENCY (paste this whole block to replace yours) ────

export const REGION_CURRENCY = {
  Japan:            { code: "JPY", symbol: "¥",   name: "Japanese yen" },
  "South Korea":    { code: "KRW", symbol: "₩",   name: "Korean won" },
  Singapore:        { code: "SGD", symbol: "S$",  name: "Singapore dollar" },
  Thailand:         { code: "THB", symbol: "฿",   name: "Thai baht" },
  Europe:           { code: "EUR", symbol: "€",   name: "Euro" },
  Australia:        { code: "AUD", symbol: "A$",  name: "Australian dollar" },
  Indonesia:        { code: "IDR", symbol: "Rp ", name: "Indonesian rupiah" },
  Malaysia:         { code: "MYR", symbol: "RM ", name: "Malaysian ringgit" },
  Vietnam:          { code: "VND", symbol: "₫",   name: "Vietnamese dong" },
  China:            { code: "CNY", symbol: "¥",   name: "Chinese yuan" },
  "United Kingdom": { code: "GBP", symbol: "£",   name: "Pound sterling" },
  "United States":  { code: "USD", symbol: "$",   name: "US dollar" },
};
