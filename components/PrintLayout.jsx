"use client";

import { useMemo } from "react";
import { useT } from "@/context/TranslationContext";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * PrintLayout — Patch 14c
 *
 * ADDED: Full "Budget at a Glance" analytics section in preview/PDF,
 * matching the ChartsPanel data:
 *  - Total budget card
 *  - Budget per category (bar chart as bars)
 *  - Transport usage breakdown
 *  - Conversion rate summary
 *
 * ALL labels use t() — language follows user setting.
 */

const CATEGORY_BADGE = {
  Transport:  { icon: "🚌", bg: "#EFF6FF", text: "#1D4ED8" },
  Hotel:      { icon: "🏨", bg: "#F0FDF4", text: "#15803D" },
  Food:       { icon: "🍽️", bg: "#FFF7ED", text: "#C2410C" },
  Attraction: { icon: "🎡", bg: "#FDF4FF", text: "#7E22CE" },
  Activity:   { icon: "🏃", bg: "#ECFDF5", text: "#065F46" },
};

const CATEGORY_COLORS = {
  Transport: "#3B82F6", Hotel: "#22C55E", Food: "#F97316",
  Attraction: "#A855F7", Activity: "#10B981",
};

const TRANSPORT_ICONS = {
  Flight:"✈️", Shinkansen:"🚅", Train:"🚆", KTX:"🚄",
  "High-Speed Rail":"🚄", Bus:"🚌", FlixBus:"🚌", Car:"🚗",
  Ferry:"⛴️", Walk:"🚶", Taxi:"🚕", MRT:"🚇", LRT:"🚇",
  Subway:"🚇", Tram:"🚊", BTS:"🚊", Eurostar:"🚄",
  Ojek:"🛵", Motorbike:"🛵", "Tuk-Tuk":"🛺",
  Grab:"🚗", Uber:"🚗", Amtrak:"🚆",
};

const FLAGS = {
  Japan:"🇯🇵","South Korea":"🇰🇷",Thailand:"🇹🇭",Singapore:"🇸🇬",
  Malaysia:"🇲🇾",Europe:"🇪🇺",Australia:"🇦🇺",Indonesia:"🇮🇩",
  Vietnam:"🇻🇳",China:"🇨🇳",USA:"🇺🇸",
};

function parseDate(str) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str + "T12:00:00");
    return isNaN(d) ? null : d;
  }
  const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const d = new Date(`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}T12:00:00`);
    return isNaN(d) ? null : d;
  }
  return null;
}

function formatDateStr(str) {
  const d = parseDate(str);
  if (!d) return str || "";
  return d.toLocaleDateString("en-US", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
}

function formatTime(str) {
  if (!str) return "";
  const [h, m] = str.split(":").map(Number);
  if (isNaN(h)) return str;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
}

export default function PrintLayout({ tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR }) {
  const { t }    = useT();
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  // Filter empty rows
  const meaningfulRows = rows.filter(r =>
    r.destination || r.city || r.notes || r.from || r.to ||
    Number(r.budgetLocal) > 0 || Number(r.budgetIDR) > 0
  );

  // Group by day
  const byDay = useMemo(() => {
    const groups = new Map();
    for (const row of meaningfulRows) {
      const key = (row.date || "").trim() || "__nodate__";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    return [...groups.entries()].sort(([a], [b]) => {
      const da = a === "__nodate__" ? 999 : (dayMap[a] ?? 999);
      const db = b === "__nodate__" ? 999 : (dayMap[b] ?? 999);
      return da - db;
    });
  }, [meaningfulRows, dayMap]);

  // Analytics data
  const categoryTotals = useMemo(() => {
    const m = {};
    for (const r of rows) {
      if (r.category) m[r.category] = (m[r.category] ?? 0) + (Number(r.budgetLocal) || 0);
    }
    return m;
  }, [rows]);

  const transportCounts = useMemo(() => {
    const m = {};
    for (const r of rows) {
      if (r.transport) m[r.transport] = (m[r.transport] ?? 0) + 1;
    }
    return m;
  }, [rows]);

  const totalDays  = Object.keys(dayMap).length || 1;
  const totalStops = meaningfulRows.length;

  return (
    <div className="itinerary-pdf font-sans text-ink bg-white">

      {/* ── Trip info ── */}
      <div className="px-8 pt-6 pb-4">
        <div className="rounded-xl border border-[#E8EDF3] bg-[#F8FAFC] p-5">
          {tripInfo?.clientName && (
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted">{t("preparedForClient").toUpperCase()}</p>
              <p className="text-2xl font-bold text-ink mt-0.5">{tripInfo.clientName}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            {[
              { label: t("duration"),    value: tripInfo?.duration || "—" },
              { label: t("destinations"),value: tripInfo?.destinations || "—" },
              { label: "Travel Dates",   value: tripInfo?.travelDates || (tripInfo?.startDate && tripInfo?.endDate ? `${tripInfo.startDate} – ${tripInfo.endDate}` : "—") },
              { label: t("region"),      value: region ? `${FLAGS[region] || "🌍"} ${region}` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Itinerary ── */}
      <div className="px-8 pb-4">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-ink mb-4">
          <span className="block h-0.5 w-6 bg-navy-500" />
          {t("itinerary")}
        </h2>

        {meaningfulRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">{t("noItinerary")}</p>
        ) : (
          <div className="space-y-5">
            {byDay.map(([dateKey, dayRows]) => {
              const dayNum  = dateKey !== "__nodate__" ? (dayMap[dateKey] ?? null) : null;
              const city    = dayRows[0]?.city || "";
              const dateStr = dateKey !== "__nodate__" ? formatDateStr(dateKey) : "";

              return (
                <div key={dateKey} className="day-block rounded-xl overflow-hidden border border-[#E8EDF3]">
                  <div className="flex items-center gap-3.5 bg-navy-500 px-5 py-3">
                    {dayNum !== null && (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-navy-500 flex-shrink-0">
                        {dayNum}
                      </span>
                    )}
                    <div>
                      <p className="text-base font-bold text-white leading-snug">
                        {t("day")} {dayNum ?? "—"}{city ? ` — ${city}` : ""}
                      </p>
                      {dateStr && <p className="text-xs text-navy-200">{dateStr}</p>}
                    </div>
                  </div>
                  <div className="divide-y divide-[#EEF2F7] bg-white">
                    {dayRows.map(row => (
                      <PrintRow key={row.id} row={row} currency={currency} isIDR={isIDR} t={t} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ANALYTICS — Budget at a Glance ── */}
      <div className="px-8 pb-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-ink mb-4">
          <span className="block h-0.5 w-6 bg-navy-500" />
          {t("budgetAtAGlance")}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
          {/* Total Budget card */}
          <div className="rounded-xl border border-[#E8EDF3] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-1">{t("totalBudget")}</p>
            <p className="text-2xl font-bold text-navy-500">{formatIDR(totalIDR)}</p>
            {!isIDR && (
              <p className="mt-0.5 text-sm text-ink-muted">≈ {formatCurrency(totalLocal, currency)}</p>
            )}
            <p className="mt-1 text-[10px] text-ink-muted">1 {currency.code} = {rate} IDR</p>
          </div>

          {/* Stops + Days */}
          <div className="rounded-xl border border-[#E8EDF3] bg-white p-4 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-1">{t("totalStops")}</p>
            <p className="text-3xl font-bold text-ink">{totalStops}</p>
          </div>
          <div className="rounded-xl border border-[#E8EDF3] bg-white p-4 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-1">{t("totalDays")}</p>
            <p className="text-3xl font-bold text-ink">{totalDays}</p>
          </div>
        </div>

        {/* Budget per category */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mb-4 rounded-xl border border-[#E8EDF3] overflow-hidden">
            <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF3]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("budgetPerCategory")}</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {Object.entries(categoryTotals).map(([cat, val]) => {
                const pct   = totalLocal > 0 ? Math.round((val / totalLocal) * 100) : 0;
                const badge = CATEGORY_BADGE[cat] ?? { icon: "📌" };
                const color = CATEGORY_COLORS[cat] ?? "#6B7280";
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                      <span className="text-sm leading-none">{badge.icon}</span>
                      <span className="text-xs font-medium text-ink-soft truncate">{cat}</span>
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[#E8EDF3] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="w-9 text-right text-[10px] font-semibold text-ink-muted">{pct}%</span>
                    <span className="text-xs font-semibold text-ink w-24 text-right">{formatCurrency(val, currency)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transport usage */}
        {Object.keys(transportCounts).length > 0 && (
          <div className="rounded-xl border border-[#E8EDF3] overflow-hidden">
            <div className="px-5 py-3 bg-[#F8FAFC] border-b border-[#E8EDF3]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{t("transportUsage")}</p>
            </div>
            <div className="flex flex-wrap gap-3 px-5 py-4">
              {Object.entries(transportCounts).map(([transport, count]) => {
                const icon = TRANSPORT_ICONS[transport] ?? "🚌";
                const total = Object.values(transportCounts).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={transport} className="flex items-center gap-2 rounded-xl border border-[#E8EDF3] px-3 py-2">
                    <span className="text-base leading-none">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-ink">{transport}</p>
                      <p className="text-[10px] text-ink-muted">{count} {count === 1 ? t("leg") : t("legs")} · {pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Trip Summary ── */}
      <div className="px-8 pb-8">
        <h2 className="text-xl font-semibold text-ink mb-4">{t("tripSummary")}</h2>
        <div className="rounded-xl border border-[#E8EDF3] overflow-hidden">
          {[
            { label: t("totalStops"),     value: totalStops,                             bold: false },
            { label: t("totalDays"),      value: totalDays,                              bold: false },
            { label: t("conversionRate"), value: isIDR ? "1:1" : `1 ${currency.code} = ${rate} IDR`, bold: false },
            { label: `${t("totalBudget")} · ${currency.code}`, value: formatCurrency(totalLocal, currency), bold: true },
            { label: `${t("totalBudget")} · IDR`, value: formatIDR(totalIDR), bold: true, accent: true },
          ].map(({ label, value, bold, accent }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-[#EEF2F7] last:border-0">
              <span className={`text-sm ${bold ? "font-semibold text-ink" : "text-ink-muted"}`}>{label}</span>
              <span className={`text-sm ${bold ? "font-semibold" : ""} ${accent ? "text-navy-500" : "text-ink"}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pdf-footer border-t border-paper-line px-8 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          {t("preparedWith")}
        </p>
      </div>
    </div>
  );
}

// ── PrintRow ──────────────────────────────────────────────────────────────────

function PrintRow({ row, currency, isIDR, t }) {
  const budget    = Number(row.budgetLocal) || 0;
  const budgetIDR = Number(row.budgetIDR)   || 0;
  const hasBudget = budget > 0 || budgetIDR > 0;

  const destQ    = encodeURIComponent([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${destQ}`;
  const routeUrl = row.from && row.to
    ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}` : null;
  const isFlightRow  = (row.transport || "").toLowerCase().includes("flight");
  const flightUrl = isFlightRow && row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from)}+to+${encodeURIComponent(row.to)}` : null;

  const badge = row.category ? (CATEGORY_BADGE[row.category] ?? null) : null;
  const transportIcon = TRANSPORT_ICONS[row.transport] ?? "🚌";

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 text-right">
          {row.time ? (
            <p className="text-xs font-semibold text-ink-muted font-mono">{formatTime(row.time)}</p>
          ) : (
            <p className="text-xs text-ink-muted/30">—</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {badge && (
            <div className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 mb-1.5" style={{ background: badge.bg }}>
              <span className="text-[10px] leading-none">{badge.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: badge.text }}>{row.category}</span>
            </div>
          )}

          <p className="text-sm font-bold text-ink leading-snug">{row.destination || row.city || "—"}</p>

          {(row.transport || row.from || row.to) && (
            <p className="mt-0.5 text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
              {row.transport && (
                <span className="flex items-center gap-1 font-medium text-ink-soft">
                  <span className="text-xs leading-none">{transportIcon}</span>
                  {row.transport}
                </span>
              )}
              {row.transport && (row.from || row.to) && <span className="text-ink-muted/30">·</span>}
              {row.from && <span>{row.from}</span>}
              {row.from && row.to && <span className="text-ink-muted/40">→</span>}
              {row.to && <span>{row.to}</span>}
            </p>
          )}

          {row.notes && <p className="mt-1 text-xs text-ink-muted italic">{row.notes}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <PrintLink href={mapUrl}   icon="📍" label={t("viewMap")} />
            {routeUrl  && <PrintLink href={routeUrl}  icon="🗺"  label={t("openRoute")} />}
            {flightUrl && <PrintLink href={flightUrl} icon="✈️" label={t("viewFlights")} />}
          </div>
        </div>

        <div className="flex-shrink-0 text-right" style={{ minWidth: "80px" }}>
          {hasBudget ? (
            <>
              {!isIDR && budget > 0 && <p className="text-sm font-semibold text-ink">{formatCurrency(budget, currency)}</p>}
              {budgetIDR > 0 && <p className={`text-xs ${isIDR ? "text-sm font-semibold text-ink" : "text-ink-muted"}`}>{formatIDR(budgetIDR)}</p>}
            </>
          ) : (
            <p className="text-sm text-ink-muted/40">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintLink({ href, icon, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] font-medium text-navy-500 hover:underline underline-offset-2">
      <span className="text-xs leading-none">{icon}</span>{label}
    </a>
  );
}
