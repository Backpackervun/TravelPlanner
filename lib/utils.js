// ============================================
// Regions
// ============================================

/**
 * Regions a user can plan a trip in. The "core" set always shows in the
 * region picker; the "extra" set appears under an expandable "More" group.
 *
 * Each region has:
 *   - id: stable key used in storage and lookups (e.g. "Japan")
 *   - flag: emoji shown on the region card and pill
 *   - subtitle: optional short marketing line under the title
 */
export const CORE_REGIONS = [
  { id: "Japan",        flag: "🇯🇵", subtitle: "Tokyo · Osaka · Kyoto" },
  { id: "South Korea",  flag: "🇰🇷", subtitle: "Seoul · Busan · Jeju" },
  { id: "Thailand",     flag: "🇹🇭", subtitle: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore",    flag: "🇸🇬", subtitle: "City state" },
  { id: "Malaysia",     flag: "🇲🇾", subtitle: "KL · Penang · Borneo" },
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

/** Find a region card definition by id; null if unknown / not selected. */
export function getRegion(regionId) {
  return ALL_REGIONS.find((r) => r.id === regionId) ?? null;
}

// ============================================
// Transport options
// ============================================

/**
 * Global transport baseline — every region offers these. They use neutral
 * names so they read sensibly anywhere ("Train" beats "JR" in Korea).
 */
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

/**
 * Region-specific transport additions. These get *prepended* to the global
 * list so users in (e.g.) Japan see JR / Shinkansen at the top of the
 * dropdown but still have access to generic "Train" if they want it.
 */
export const REGION_TRANSPORT = {
  Japan:           ["JR", "Shinkansen"],
  "South Korea":   ["KTX", "Subway"],
  Europe:          ["Tram", "FlixBus"],
};

/**
 * Build the transport dropdown for a given region.
 * If region is null/unknown, falls back to the global baseline.
 */
export function getTransportOptions(regionId) {
  const extras = REGION_TRANSPORT[regionId] ?? [];
  // Dedupe — "Subway" exists in Korea extras AND global "Metro / Subway"
  // is conceptually the same; we keep the more specific label first.
  const all = [...extras, ...GLOBAL_TRANSPORT];
  return Array.from(new Set(all));
}

// ============================================
// Categories
// ============================================

/**
 * Five categories per v2.1 spec. Order matters for the dropdown.
 *
 * "Transport" is the system category for travel legs (airport runs,
 * inter-city train rides, etc.). It's auto-suggested when both From
 * and To are filled but the user can override.
 */
export const CATEGORY_OPTIONS = ["Hotel", "Food", "Attraction", "Activity", "Transport"];

/**
 * Emoji prefix shown in dropdowns and category chips.
 */
export const CATEGORY_ICONS = {
  Hotel:      "🏨",
  Food:       "🍜",
  Attraction: "🎯",
  Activity:   "🎡",
  Transport:  "🚆",
};

// Tailwind class fragments for category color tags.
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
// Transport icons (no estimates — just visual cues)
// ============================================

/**
 * Map a transport string to an emoji icon. Falls back to a neutral pin.
 */
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

// Color palette for transport pie chart — keyed by transport label.
export const TRANSPORT_COLORS = {
  "Flight":              "#8B5CF6",
  "Shinkansen":          "#0EA5E9",
  "KTX":                 "#0EA5E9",
  "Train":               "#0B3C5D",
  "JR":                  "#0B3C5D",
  "Tram":                "#1D5C8C",
  "Metro / Subway":      "#1E40AF",
  "Subway":              "#1E40AF",
  "Bus":                 "#10B981",
  "FlixBus":             "#10B981",
  "Car":                 "#F59E0B",
  "Taxi / Ride-hailing": "#F97316",
  "Walk":                "#94A3B8",
  "Ferry":               "#0EA5E9",
};

/** Pick a chart color for a given transport label, with a fallback. */
export function transportColor(t) {
  return TRANSPORT_COLORS[t] ?? "#6B7280";
}

// ============================================
// Currency
// ============================================

/**
 * Map a region id to its local currency. Used to label the Budget column
 * with the right currency code/symbol per region. The exchange rate is
 * still user-controlled — we never fetch live rates.
 *
 * The "fallback" entry (no region selected) keeps the column working
 * with a neutral "LOCAL" label until the user picks a region.
 */
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
};

/**
 * Resolve a region id to its currency. Always returns a usable shape;
 * unknown / null regions yield a neutral "LOCAL" placeholder.
 */
export function getCurrency(regionId) {
  return REGION_CURRENCY[regionId] ?? { code: "LOCAL", symbol: "", name: "Local currency" };
}

/**
 * Default LOCAL → IDR rate (used for Japan-defaults; totally arbitrary
 * everywhere else). The user is expected to edit it for their trip.
 */
export const DEFAULT_RATE = 110;

/**
 * Format a number with a currency symbol. For symbols that are letters
 * ("S$", "Rp", "RM") we add a space; for sigil symbols ("¥", "₩", "€")
 * we don't. The rule: if the symbol's last character is alphanumeric, space.
 */
export function formatCurrency(n, currency) {
  const value = Number(n) || 0;
  const sym = currency?.symbol ?? "";
  const trimmed = sym.trimEnd();
  // Space rule — letter-symbols ("Rp", "RM", "S$", "A$") get a trailing space
  // even if the symbol object provides one explicitly. We rely on the
  // symbol coming pre-spaced from REGION_CURRENCY where appropriate.
  return sym + value.toLocaleString("en-US");
}

/**
 * Render a currency code suffix-style ("12,500 JPY"). Used in compact
 * places where the symbol could be ambiguous (Singapore dollar vs USD).
 */
export function formatWithCode(n, currency) {
  const value = Number(n) || 0;
  if (!currency?.code || currency.code === "LOCAL") {
    return value.toLocaleString("en-US");
  }
  return `${value.toLocaleString("en-US")} ${currency.code}`;
}

/**
 * Generic, currency-agnostic number formatter. Kept for backward compat
 * with components that haven't been threaded with a currency object.
 */
export function formatLocal(n) {
  const value = Number(n) || 0;
  return value.toLocaleString("en-US");
}

export function formatIDR(n) {
  const value = Number(n) || 0;
  return "Rp " + value.toLocaleString("id-ID");
}

// Kept for backwards compatibility with any leftover yen formatting.
export function formatJPY(n) {
  return "¥" + (Number(n) || 0).toLocaleString("en-US");
}

// ============================================
// Google Maps URL builders
// ============================================

export function buildMapUrl(destination) {
  if (!destination || !destination.trim()) return null;
  const q = encodeURIComponent(destination.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function buildRouteUrl(from, to) {
  if (!from || !to || !from.trim() || !to.trim()) return null;
  const origin = encodeURIComponent(from.trim());
  const destination = encodeURIComponent(to.trim());
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
}

// ============================================
// Booking links — region- AND transport-aware
// ============================================

/**
 * Region-aware booking link resolver.
 *
 * Rules (per spec):
 *   - Flight (any region) → Google Flights "FROM to TO"
 *   - Shinkansen + Japan  → Klook search
 *   - KTX or Train + Korea → Google search "KTX FROM TO"
 *   - FlixBus + Europe    → flixbus.com search
 *
 * Hotels and attractions intentionally do NOT get a booking button —
 * the Map link is the canonical action for those.
 *
 * Returns { label, href } or null.
 */
export function getBookingLink(row, regionId) {
  const t = row.transport;
  if (!t) return null;

  // Flight is global — works regardless of region
  if (t === "Flight") {
    if (!row.from?.trim() || !row.to?.trim()) return null;
    const q = encodeURIComponent(`${row.from.trim()} to ${row.to.trim()}`);
    return {
      label: "✈️ View Flights",
      href: `https://www.google.com/travel/flights?q=${q}`,
    };
  }

  // Japan — Shinkansen
  if (regionId === "Japan" && t === "Shinkansen") {
    if (!row.from?.trim() || !row.to?.trim()) return null;
    const q = encodeURIComponent(`shinkansen ${row.from.trim()} ${row.to.trim()}`);
    return {
      label: "🚄 View Tickets",
      href: `https://www.klook.com/search/?query=${q}`,
    };
  }

  // South Korea — KTX (also fires for generic "Train" since Korean rail is mostly KTX)
  if (regionId === "South Korea" && (t === "KTX" || t === "Train")) {
    if (!row.from?.trim() || !row.to?.trim()) return null;
    const q = encodeURIComponent(`KTX ${row.from.trim()} ${row.to.trim()}`);
    return {
      label: "🔎 View KTX Options",
      href: `https://www.google.com/search?q=${q}`,
    };
  }

  // Europe — FlixBus
  if (regionId === "Europe" && t === "FlixBus") {
    if (!row.from?.trim() || !row.to?.trim()) return null;
    const from = encodeURIComponent(row.from.trim());
    const to = encodeURIComponent(row.to.trim());
    return {
      label: "🚌 Book Bus",
      href: `https://www.flixbus.com/search?from=${from}&to=${to}`,
    };
  }

  return null;
}

// ============================================
// IDs
// ============================================

let _idCounter = 0;
export function generateId() {
  _idCounter += 1;
  return "row_" + Date.now().toString(36) + "_" + _idCounter.toString(36);
}

// ============================================
// Region-context warning ("did you mean...")
// ============================================
//
// Per v2.2 spec: the selected region is a *soft* data context boundary.
// If the user types a destination that strongly suggests a different
// region (e.g. "Tokyo" while the trip region is Korea), we surface a
// non-blocking warning. We do NOT auto-correct, do NOT block input.
//
// Detection is a simple keyword match — known cities / well-known
// landmarks per region. If no keyword fires, no warning. This avoids
// false positives for obscure or generic place names.
const REGION_KEYWORDS = {
  Japan: [
    "tokyo", "osaka", "kyoto", "nara", "hiroshima", "kobe", "nagoya", "fukuoka",
    "sapporo", "yokohama", "okinawa", "hakone", "nikko", "kanazawa", "shibuya",
    "shinjuku", "ginza", "akihabara", "asakusa", "dotonbori", "namba",
    "shinkansen", "haneda", "narita", "kix", "itm",
  ],
  "South Korea": [
    "seoul", "busan", "jeju", "incheon", "daegu", "gwangju", "daejeon",
    "gangnam", "myeongdong", "hongdae", "itaewon", "ktx",
  ],
  Thailand: [
    "bangkok", "chiang mai", "chiang rai", "phuket", "krabi", "pattaya",
    "ayutthaya", "koh samui", "koh phangan", "koh phi phi", "khao yai",
    "huahin", "hua hin", "sukhothai",
  ],
  Singapore: [
    "singapore", "marina bay", "sentosa", "orchard", "changi", "clarke quay",
    "chinatown sg", "little india", "jurong",
  ],
  Malaysia: [
    "kuala lumpur", "klcc", "petaling", "penang", "george town", "langkawi",
    "malacca", "melaka", "ipoh", "johor", "kota kinabalu", "kuching", "borneo",
    "klia",
  ],
  Europe: [
    "paris", "london", "rome", "amsterdam", "berlin", "barcelona", "madrid",
    "vienna", "prague", "lisbon", "porto", "athens", "dublin", "edinburgh",
    "munich", "milan", "florence", "venice", "santorini", "zurich", "geneva",
    "brussels", "copenhagen", "stockholm", "oslo", "warsaw", "budapest",
    "krakow", "interlaken", "nice", "marseille",
  ],
  Australia: [
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "cairns",
    "gold coast", "byron bay", "uluru", "tasmania", "great barrier reef",
  ],
  Indonesia: [
    "bali", "jakarta", "yogyakarta", "jogja", "ubud", "seminyak", "canggu",
    "kuta", "nusa", "lombok", "bandung", "surabaya", "medan", "labuan bajo",
    "raja ampat", "borobudur", "prambanan",
  ],
  Vietnam: [
    "hanoi", "ho chi minh", "saigon", "hcmc", "da nang", "danang", "hoi an",
    "hue", "halong", "ha long", "sapa", "nha trang", "phu quoc", "mekong",
  ],
  "United Kingdom": [
    "london", "edinburgh", "manchester", "liverpool", "glasgow", "cambridge",
    "oxford", "bath", "york", "bristol", "cardiff", "belfast", "stonehenge",
    "lake district", "cotswolds", "heathrow",
  ],
  "United States": [
    "new york", "nyc", "manhattan", "brooklyn", "los angeles", "la ",
    "san francisco", "sf ", "chicago", "boston", "miami", "vegas",
    "las vegas", "seattle", "portland", "austin", "dallas", "houston",
    "denver", "philadelphia", "washington dc", "honolulu", "hawaii",
    "yellowstone", "yosemite", "grand canyon",
  ],
};

// Some keywords appear in multiple region lists (e.g. "London" → both
// United Kingdom and Europe). For those overlap cases we accept either
// match without warning — they're not really wrong.
const REGION_OVERLAPS = {
  "United Kingdom": ["Europe"],
  Europe: ["United Kingdom"],
};

/**
 * Try to detect which region a free-text destination/city refers to.
 * Returns the region id, or null if no keyword matched.
 */
export function detectRegionFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [regionId, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const kw of keywords) {
      // Word-boundary-ish match: surround the keyword with non-letter
      // chars (or string boundaries) so "uluru" doesn't match inside
      // some other word.
      const pattern = new RegExp(`(^|[^a-z])${escapeRegex(kw)}([^a-z]|$)`, "i");
      if (pattern.test(lower)) {
        return regionId;
      }
    }
  }
  return null;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Decide whether to show a "may not match selected region" warning for
 * a row's destination/city/from/to fields, given the selected region.
 *
 * Returns { warn: bool, suggested: regionId | null, fields: [..] }.
 */
export function checkRegionMismatch(row, selectedRegion) {
  if (!selectedRegion) return { warn: false, suggested: null, fields: [] };
  const candidates = [
    { field: "destination", text: row.destination },
    { field: "city",        text: row.city },
    { field: "from",        text: row.from },
    { field: "to",          text: row.to },
  ];
  for (const { field, text } of candidates) {
    const detected = detectRegionFromText(text);
    if (!detected) continue;
    if (detected === selectedRegion) continue;
    // Acceptable overlap (UK ↔ Europe)
    const overlaps = REGION_OVERLAPS[selectedRegion] ?? [];
    if (overlaps.includes(detected)) continue;
    return { warn: true, suggested: detected, fields: [field] };
  }
  return { warn: false, suggested: null, fields: [] };
}
