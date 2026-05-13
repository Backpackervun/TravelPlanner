"use client";

import { useMemo } from "react";
import { useT } from "@/context/TranslationContext";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * PrintLayout — fix-v5
 *
 * Changes:
 * 1. Budget at a Glance stats: responsive grid — stacks on mobile
 *    instead of 3-col which caused overflow (Rp number cut off, Total Days orphaned)
 * 2. Total Budget number uses text-xl (not 2xl) + break-words to prevent overflow
 */

const CATEGORY_BADGE = {
  Transport:  { icon:"🚌", bg:"#EFF6FF", text:"#1D4ED8" },
  Hotel:      { icon:"🏨", bg:"#F0FDF4", text:"#15803D" },
  Food:       { icon:"🍽️", bg:"#FFF7ED", text:"#C2410C" },
  Attraction: { icon:"🎡", bg:"#FDF4FF", text:"#7E22CE" },
  Activity:   { icon:"🏃", bg:"#ECFDF5", text:"#065F46" },
};

const CATEGORY_COLORS = {
  Transport:"#3B82F6", Hotel:"#22C55E", Food:"#F97316",
  Attraction:"#A855F7", Activity:"#10B981",
};

const TRANSPORT_ICONS = {
  Flight:"✈️",Shinkansen:"🚅",Train:"🚆",KTX:"🚄","High-Speed Rail":"🚄",
  Bus:"🚌",FlixBus:"🚌",Car:"🚗",Ferry:"⛴️",Walk:"🚶",Taxi:"🚕",
  MRT:"🚇",LRT:"🚇",Subway:"🚇",Tram:"🚊",BTS:"🚊",Eurostar:"🚄",
  Ojek:"🛵",Motorbike:"🛵","Tuk-Tuk":"🛺",Grab:"🚗",Uber:"🚗",Amtrak:"🚆",
};

const FLAGS = {
  Japan:"🇯🇵","South Korea":"🇰🇷",Thailand:"🇹🇭",Singapore:"🇸🇬",
  Malaysia:"🇲🇾",Europe:"🇪🇺",Australia:"🇦🇺",Indonesia:"🇮🇩",
  Vietnam:"🇻🇳",China:"🇨🇳",USA:"🇺🇸",
};

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${ap}`;
}

function fmtDateReadable(s) {
  if (!s) return "";
  try {
    const d = /^\d{4}-\d{2}-\d{2}/.test(s) ? new Date(s + "T12:00:00") : new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
  } catch { return s; }
}

function fmtTravelDates(td, startDate, endDate) {
  if (startDate && endDate) return `${fmtDateReadable(startDate)} – ${fmtDateReadable(endDate)}`;
  if (!td) return "—";
  const sep = td.includes("–") ? "–" : td.includes(" - ") ? " - " : null;
  if (sep) { const [s, e] = td.split(sep).map(x => x.trim()); return `${fmtDateReadable(s)} – ${fmtDateReadable(e)}`; }
  return fmtDateReadable(td) || td;
}

export default function PrintLayout({ tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR }) {
  const { t }    = useT();
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  const meaningfulRows = rows.filter(r =>
    r.destination || r.city || r.notes || r.from || r.to ||
    Number(r.budgetLocal) > 0 || Number(r.budgetIDR) > 0
  );

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

  const totalDays = Object.keys(dayMap).length || 1;
  const travelDatesFormatted = fmtTravelDates(tripInfo?.travelDates, tripInfo?.startDate, tripInfo?.endDate);

  return (
    <div className="itinerary-pdf bg-white" style={{ fontFamily: "'Montserrat','Inter',-apple-system,sans-serif" }}>

      {/* ── Trip info ── */}
      <div className="px-6 pt-5 pb-4 sm:px-8 sm:pt-6">
        <div className="rounded-xl border border-[#E8EDF3] bg-[#F8FAFC] p-4 sm:p-5">
          {tripInfo?.clientName && (
            <div className="mb-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
                {t("preparedForClient")}
              </p>
              <p className="text-xl font-bold text-[#1E293B] mt-0.5 sm:text-2xl">
                {tripInfo.clientName}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { label: t("duration"),     value: tripInfo?.duration || "—" },
              { label: t("destinations"), value: tripInfo?.destinations || "—" },
              { label: "Travel Dates",   value: travelDatesFormatted },
              { label: t("region"),      value: region ? `${FLAGS[region]||"🌍"} ${region}` : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-[#1E293B]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Itinerary ── */}
      <div className="px-6 pb-4 sm:px-8">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-[#1E293B] mb-3 sm:text-xl sm:mb-4">
          <span className="block h-0.5 w-5 bg-[#0B3C5D] flex-shrink-0" />
          {t("itinerary")}
        </h2>

        {meaningfulRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#94A3B8]">{t("noItinerary")}</p>
        ) : (
          <div className="space-y-4">
            {byDay.map(([dateKey, dayRows]) => {
              const dayNum = dateKey !== "__nodate__" ? (dayMap[dateKey] ?? null) : null;
              const city   = dayRows[0]?.city || "";
              const dateStr = dateKey !== "__nodate__" ? fmtDateReadable(dateKey) : "";
              return (
                <div key={dateKey} className="day-block rounded-xl overflow-hidden border border-[#E8EDF3]">
                  <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#0B3C5D" }}>
                    {dayNum !== null && (
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold" style={{ color: "#0B3C5D" }}>
                        {dayNum}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white leading-snug">
                        {t("day")} {dayNum ?? "—"}{city ? ` — ${city}` : ""}
                      </p>
                      {dateStr && <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{dateStr}</p>}
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

      {/* ── Budget at a Glance ── */}
      <div className="px-6 pb-4 sm:px-8">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-[#1E293B] mb-3 sm:text-xl sm:mb-4">
          <span className="block h-0.5 w-5 bg-[#0B3C5D] flex-shrink-0" />
          {t("budgetAtAGlance")}
        </h2>

        {/* ── Stats cards ──
          MOBILE FIX: single column stacked layout, no overflow
          DESKTOP:    3-column grid as before
        */}
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4 mb-4">

          {/* Total Budget — takes full width on mobile */}
          <div className="rounded-xl border border-[#E8EDF3] bg-[#F8FAFC] p-4 sm:col-span-2 sm:row-span-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] mb-1">
              {t("totalBudget")}
            </p>
            {/* Use break-all so Rp number never clips */}
            <p className="text-xl font-bold break-all" style={{ color: "#0B3C5D", lineHeight: 1.2 }}>
              {formatIDR(totalIDR)}
            </p>
            {!isIDR && (
              <p className="mt-1 text-xs text-[#64748B]">
                ≈ {formatCurrency(totalLocal, currency)} · 1 {currency.code} = {rate} IDR
              </p>
            )}
          </div>

          {/* Total Stops + Total Days side by side on mobile, stacked on desktop */}
          <div className="grid grid-cols-2 gap-3 sm:col-span-1 sm:row-span-1 sm:flex sm:flex-col">
            <div className="rounded-xl border border-[#E8EDF3] bg-white p-4 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] mb-1">
                {t("totalStops")}
              </p>
              <p className="text-2xl font-bold text-[#1E293B]">{meaningfulRows.length}</p>
            </div>
            <div className="rounded-xl border border-[#E8EDF3] bg-white p-4 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8] mb-1">
                {t("totalDays")}
              </p>
              <p className="text-2xl font-bold text-[#1E293B]">{totalDays}</p>
            </div>
          </div>
        </div>

        {/* Category bars */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mb-4 rounded-xl border border-[#E8EDF3] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E8EDF3]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                {t("budgetPerCategory")}
              </p>
            </div>
            <div className="divide-y divide-[#EEF2F7]">
              {Object.entries(categoryTotals).map(([cat, val]) => {
                const pct   = totalLocal > 0 ? Math.round((val / totalLocal) * 100) : 0;
                const badge = CATEGORY_BADGE[cat] ?? { icon:"📌" };
                const color = CATEGORY_COLORS[cat] ?? "#6B7280";
                return (
                  <div key={cat} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                      <span className="text-sm leading-none">{badge.icon}</span>
                      <span className="text-xs font-medium text-[#475569] truncate">{cat}</span>
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[#E8EDF3] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background:color }} />
                    </div>
                    <span className="w-8 text-right text-[10px] font-semibold text-[#94A3B8]">{pct}%</span>
                    <span className="text-xs font-semibold text-[#1E293B] w-20 text-right tabular-nums">{formatCurrency(val, currency)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transport usage */}
        {Object.keys(transportCounts).length > 0 && (
          <div className="rounded-xl border border-[#E8EDF3] overflow-hidden">
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E8EDF3]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                {t("transportUsage")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 px-4 py-3">
              {Object.entries(transportCounts).map(([transport, count]) => {
                const icon  = TRANSPORT_ICONS[transport] ?? "🚌";
                const total = Object.values(transportCounts).reduce((a,b)=>a+b,0);
                const pct   = Math.round((count/total)*100);
                return (
                  <div key={transport} className="flex items-center gap-2 rounded-xl border border-[#E8EDF3] px-3 py-2.5 bg-white">
                    <span className="text-xl leading-none">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#1E293B]">{transport}</p>
                      <p className="text-[10px] text-[#94A3B8]">{count} {count===1?t("leg"):t("legs")} · {pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Trip Summary ── */}
      <div className="px-6 pb-6 sm:px-8">
        <h2 className="text-lg font-semibold text-[#1E293B] mb-3 sm:text-xl">{t("tripSummary")}</h2>
        <div className="rounded-xl border border-[#E8EDF3] overflow-hidden">
          {[
            { label: t("totalStops"),     value: meaningfulRows.length, bold:false, accent:false },
            { label: t("totalDays"),      value: totalDays,             bold:false, accent:false },
            { label: t("conversionRate"), value: isIDR ? "1:1" : `1 ${currency.code} = ${rate} IDR`, bold:false, accent:false },
            ...(!isIDR ? [{ label:`TOTAL · ${currency.code}`, value: formatCurrency(totalLocal, currency), bold:true, accent:false }] : []),
            { label:"TOTAL · IDR", value: formatIDR(totalIDR), bold:true, accent:true },
          ].map(({ label, value, bold, accent }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-[#EEF2F7] last:border-0 bg-white">
              <span className={`text-sm ${bold ? "font-semibold text-[#1E293B]" : "text-[#94A3B8]"}`}>{label}</span>
              <span className={`text-sm ${bold ? "font-semibold" : ""} ${accent ? "text-[#0B3C5D]" : "text-[#1E293B]"}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 pb-5 sm:px-8">
        <div className="border-t border-[#E8EDF3] pt-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">
            {t("preparedWith")}
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Print row ──────────────────────────────────────────────────────────────

function PrintRow({ row, currency, isIDR, t }) {
  const budget    = Number(row.budgetLocal) || 0;
  const budgetIDR = Number(row.budgetIDR) || 0;
  const hasBudget = budget > 0 || budgetIDR > 0;
  const badge     = row.category ? (CATEGORY_BADGE[row.category] ?? null) : null;
  const tIcon     = TRANSPORT_ICONS[row.transport] ?? "";
  const enc       = encodeURIComponent;

  const destQ    = enc([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${destQ}`;
  const routeUrl = row.from && row.to ? `https://www.google.com/maps/dir/${enc(row.from)}/${enc(row.to)}` : null;
  const isFlt    = (row.transport || "").toLowerCase().includes("flight");
  const fltUrl   = isFlt && row.from && row.to ? `https://www.google.com/flights?q=Flights+from+${enc(row.from)}+to+${enc(row.to)}` : null;

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        {/* Time */}
        <div className="flex-shrink-0 w-14 text-right">
          <p className="text-xs font-semibold text-[#94A3B8] font-mono tabular-nums">{fmtTime(row.time) || "—"}</p>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {badge && (
            <div className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 mb-1.5" style={{ background: badge.bg }}>
              <span className="text-[10px] leading-none">{badge.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: badge.text }}>
                {row.category}
              </span>
            </div>
          )}
          <p className="text-sm font-bold text-[#1E293B] leading-snug">{row.destination || row.city || "—"}</p>
          {(row.transport || row.from || row.to) && (
            <p className="mt-0.5 text-xs text-[#94A3B8] flex items-center gap-1 flex-wrap">
              {row.transport && (
                <span className="flex items-center gap-1 font-medium text-[#475569]">
                  <span>{tIcon}</span>{row.transport}
                </span>
              )}
              {row.transport && (row.from || row.to) && <span className="opacity-30">·</span>}
              {row.from && <span>{row.from}</span>}
              {row.from && row.to && <span className="opacity-40">→</span>}
              {row.to && <span>{row.to}</span>}
            </p>
          )}
          {row.notes && <p className="mt-0.5 text-xs text-[#94A3B8] italic">{row.notes}</p>}
          <div className="mt-2 flex flex-col gap-1">
            <a href={mapUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium no-underline" style={{ color: "#0B3C5D" }}>
              📍 {t("viewMap")}
            </a>
            {routeUrl && (
              <a href={routeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium no-underline" style={{ color: "#0B3C5D" }}>
                🗺 {t("openRoute")}
              </a>
            )}
            {fltUrl && (
              <a href={fltUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium no-underline" style={{ color: "#0B3C5D" }}>
                ✈️ {t("viewFlights")}
              </a>
            )}
          </div>
        </div>
        {/* Budget */}
        <div className="flex-shrink-0 text-right" style={{ minWidth: "60px" }}>
          {hasBudget ? (
            <>
              {!isIDR && budget > 0 && (
                <p className="text-sm font-semibold text-[#1E293B] tabular-nums">{formatCurrency(budget, currency)}</p>
              )}
              {budgetIDR > 0 && (
                <p className={`text-xs tabular-nums ${isIDR ? "text-sm font-semibold text-[#1E293B]" : "text-[#94A3B8]"}`}>
                  {formatIDR(budgetIDR)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#CBD5E1]">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
