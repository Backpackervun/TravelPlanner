/**
 * lib/regions.js — Central region config
 *
 * Defines per-region:
 * - currency (code, symbol, locale)
 * - transport options (region-specific)
 * - booking links per transport mode
 */

// ── CURRENCIES ────────────────────────────────────────────────────────────────

export const REGION_CURRENCIES = {
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
  "USA":          { code: "USD",  symbol: "$",   locale: "en-US" },
};

// ── TRANSPORT OPTIONS per region ──────────────────────────────────────────────

export const REGION_TRANSPORT = {
  "Japan": [
    "Flight", "Shinkansen", "Train", "Bus", "Subway", "Car", "Ferry", "Walk", "Taxi",
  ],
  "South Korea": [
    "Flight", "KTX", "Train", "Bus", "Subway", "Car", "Ferry", "Walk", "Taxi",
  ],
  "Thailand": [
    "Flight", "Bus", "BTS", "MRT", "Train", "Tuk-Tuk", "Songthaew", "Car", "Ferry", "Walk", "Taxi",
  ],
  "Singapore": [
    "Flight", "MRT", "LRT", "Bus", "Car", "Walk", "Taxi", "Grab",
  ],
  "Malaysia": [
    "Flight", "Train", "Bus", "Car", "MRT", "LRT", "Ferry", "Walk", "Taxi", "Grab",
  ],
  "Europe": [
    "Flight", "Eurostar", "FlixBus", "Train", "Bus", "Car", "Ferry", "Metro", "Walk", "Taxi",
  ],
  "Australia": [
    "Flight", "Train", "Bus", "Car", "Ferry", "Tram", "Walk", "Taxi", "Uber",
  ],
  "Indonesia": [
    "Flight", "Train", "Bus", "Car", "Ferry", "Speedboat", "Walk", "Taxi", "Ojek",
  ],
  "Vietnam": [
    "Flight", "Train", "Bus", "Car", "Motorbike", "Ferry", "Walk", "Taxi", "Grab",
  ],
  "China": [
    "Flight", "High-Speed Rail", "Train", "Bus", "Subway", "Car", "Walk", "Taxi", "DiDi",
  ],
  "USA": [
    "Flight", "Amtrak", "Bus", "Car", "Subway", "Walk", "Taxi", "Uber",
  ],
  // fallback
  default: [
    "Flight", "Train", "Bus", "Car", "Ferry", "Walk", "Taxi",
  ],
};

/** Returns transport options for a given region */
export function getTransportOptions(region) {
  return REGION_TRANSPORT[region] ?? REGION_TRANSPORT.default;
}

// ── BOOKING LINKS per transport mode ─────────────────────────────────────────

const BOOKING_LINKS = {
  // ── Global ──
  "Flight":          (from, to) => from && to
    ? `https://www.google.com/flights?q=Flights+from+${enc(from)}+to+${enc(to)}`
    : `https://www.google.com/flights`,
  "Ferry":           (dest) => `https://www.klook.com/search/?keyword=${enc(dest||"ferry")}`,
  "Bus":             (dest) => `https://www.klook.com/search/?keyword=${enc(dest||"bus")}`,
  // ── Japan ──
  "Shinkansen":      () => "https://www.jrpass.com",
  "Train":           (dest, region) => region === "Japan"
    ? "https://www.jrpass.com"
    : region === "South Korea" ? "https://www.letskorail.com"
    : `https://www.klook.com/search/?keyword=${enc(dest||"train")}`,
  // ── South Korea ──
  "KTX":             () => "https://www.letskorail.com",
  "Subway":          (dest, region) => region === "Japan"
    ? "https://www.tokyometro.jp/en/"
    : region === "South Korea" ? "https://www.seoulmetro.co.kr/en/"
    : `https://www.klook.com/search/?keyword=${enc(dest||"subway")}`,
  // ── Thailand ──
  "BTS":             () => "https://www.bts.co.th/eng/",
  "MRT":             (dest, region) => region === "Thailand"
    ? "https://www.mrta.co.th/en/"
    : region === "Singapore" ? "https://www.transitlink.com.sg"
    : `https://www.klook.com/search/?keyword=mrt`,
  "Tuk-Tuk":         (dest) => `https://www.klook.com/search/?keyword=tuk-tuk+${enc(dest||"")}`,
  "Songthaew":       (dest) => `https://www.klook.com/search/?keyword=songthaew+${enc(dest||"")}`,
  // ── Europe ──
  "Eurostar":        () => "https://www.eurostar.com",
  "FlixBus":         (from, to) => from && to
    ? `https://www.flixbus.com/bus/${enc(from)}-${enc(to)}`
    : "https://www.flixbus.com",
  "Metro":           (dest) => `https://www.klook.com/search/?keyword=metro+${enc(dest||"")}`,
  // ── Australia ──
  "Tram":            (dest) => `https://www.klook.com/search/?keyword=tram+${enc(dest||"")}`,
  "Uber":            (dest) => "https://www.uber.com",
  // ── USA ──
  "Amtrak":          () => "https://www.amtrak.com",
  // ── Indonesia ──
  "Ojek":            (dest) => "https://www.grab.com",
  "Speedboat":       (dest) => `https://www.klook.com/search/?keyword=speedboat+${enc(dest||"")}`,
  // ── Vietnam ──
  "Motorbike":       (dest) => `https://www.klook.com/search/?keyword=motorbike+${enc(dest||"")}`,
  // ── China ──
  "High-Speed Rail": () => "https://www.trip.com/trains/",
  "DiDi":            () => "https://www.didiglobal.com",
  // ── Generic ──
  "Walk":            (dest) => dest ? `https://www.google.com/maps/search/?api=1&query=${enc(dest)}` : null,
  "Car":             (from, to) => from && to
    ? `https://www.google.com/maps/dir/${enc(from)}/${enc(to)}`
    : null,
  "Taxi":            () => null,
  "Grab":            () => "https://www.grab.com",
  "LRT":             (dest) => `https://www.klook.com/search/?keyword=lrt`,
};

function enc(s) { return encodeURIComponent(s || ""); }

/**
 * Get booking URL for a transport type.
 * Returns null if no direct booking link.
 */
export function getBookingUrl(transport, { from, to, destination, region } = {}) {
  const fn = BOOKING_LINKS[transport];
  if (!fn) return null;
  // Most functions accept (from_or_dest, to_or_region)
  try {
    const result = fn(from || destination, to || region, region);
    return result || null;
  } catch { return null; }
}

// ── KLOOK fallback ─────────────────────────────────────────────────────────────

export function getKlookUrl(destination) {
  if (!destination) return "https://www.klook.com";
  return `https://www.klook.com/search/?keyword=${encodeURIComponent(destination)}`;
}
