"use client";

import { useMemo } from "react";
import { useT } from "@/context/TranslationContext";
import { formatCurrency, formatIDR, getCurrency, CATEGORY_OPTIONS, CATEGORY_STYLES } from "@/lib/utils";

/**
 * PrintLayout v1.0
 *
 * Renders the premium A4 document for both PreviewModal and PDF export.
 *
 * KEY CHANGES from broken version:
 *  - Map / Route / Flights / Booking chip links restored in every row
 *  - Links are real <a> tags that open in a new tab in preview
 *  - In print/PDF they appear as visible chips with URL text beneath them
 *  - pdfFooter translation used at bottom of every page
 */
export default function PrintLayout({
  tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR,
}) {
  const { t } = useT();
  const currency = getCurrency(region);

  // Group rows by day number
  const byDay = useMemo(() => {
    const groups = new Map();
    for (const row of rows) {
      const dayNum = row.date ? (dayMap[row.date.trim()] ?? 0) : 0;
      if (!groups.has(dayNum)) groups.set(dayNum, []);
      groups.get(dayNum).push(row);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [rows, dayMap]);

  const categoryTotals = useMemo(() => {
    const t = {};
    for (const row of rows) {
      if (row.category) t[row.category] = (t[row.category] ?? 0) + (Number(row.budgetLocal) || 0);
    }
    return t;
  }, [rows]);

  const totalDays = Object.keys(dayMap).length || 1;

  return (
    <div className="itinerary-pdf px-8 pb-16 pt-6 font-sans text-ink">

      {/* ── Trip info block ── */}
      <div className="mb-8 grid gap-3 rounded-2xl border border-paper-line bg-paper-dim/40 p-5 sm:grid-cols-2">
        <InfoRow label={t("preparedFor")} value={tripInfo?.clientName || "—"} />
        <InfoRow label={t("destinations")} value={tripInfo?.destinations || "—"} />
        <InfoRow label={t("duration")} value={tripInfo?.duration || "—"} />
        <InfoRow label={t("region")} value={region || "—"} />
        {tripInfo?.startDate && <InfoRow label={t("startDate")} value={tripInfo.startDate} />}
        {tripInfo?.endDate   && <InfoRow label={t("endDate")}   value={tripInfo.endDate} />}
      </div>

      {/* ── Day-by-day itinerary ── */}
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {t("itinerary")}
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-ink-muted py-8 text-center">{t("noItinerary")}</p>
      ) : (
        <div className="space-y-6">
          {byDay.map(([dayNum, dayRows]) => (
            <div key={dayNum} className="day-block rounded-2xl border border-paper-line overflow-hidden">
              {/* Day header */}
              <div className="flex items-center gap-3 border-b border-paper-line bg-navy-50/50 px-5 py-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-bold text-white">
                  {dayNum || "—"}
                </span>
                <span className="text-sm font-semibold text-navy-600">
                  {t("day")} {dayNum || "—"}
                  {dayRows[0]?.date ? ` · ${dayRows[0].date}` : ""}
                  {dayRows[0]?.city ? ` · ${dayRows[0].city}` : ""}
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-paper-line/60">
                {dayRows.map((row) => (
                  <PrintRow key={row.id} row={row} currency={currency} rate={rate} t={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Summary ── */}
      <div className="mt-10 rounded-2xl border border-paper-line bg-paper-dim/40 p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
          {t("tripSummary")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SumCard label={t("totalBudget")} value={formatIDR(totalIDR)} sub={formatCurrency(totalLocal, currency)} />
          <SumCard label={t("totalStops")}  value={rows.length} />
          <SumCard label={t("totalDays")}   value={totalDays} />
          <SumCard label={t("conversionRate")} value={`1 ${currency.code} = ${rate} IDR`} />
        </div>

        {/* Category totals */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("byCategory")}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryTotals).map(([cat, val]) => {
                const style = CATEGORY_STYLES[cat] ?? { bg: "bg-gray-100", text: "text-gray-700" };
                return (
                  <span key={cat} className={`rounded-full px-3 py-1 text-xs font-semibold ${style.bg ?? "bg-gray-100"} ${style.text ?? "text-gray-700"}`}>
                    {cat} · {formatCurrency(val, currency)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── PDF footer branding ── */}
      <p className="mt-8 text-center text-[10px] text-ink-muted/60 pdf-footer">
        {t("pdfFooter")}
      </p>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PrintRow({ row, currency, rate, t }) {
  const budget = Number(row.budgetLocal) || 0;
  const idr    = Number(row.budgetIDR)   || Math.round(budget * (Number(rate) || 0));

  // Build travel action links
  const locationQuery = encodeURIComponent(
    [row.destination, row.city, row.to].filter(Boolean).join(" ")
  );
  const mapUrl     = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
  const routeUrl   = row.from && row.to
    ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
    : null;
  const flightUrl  = row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from)}+to+${encodeURIComponent(row.to)}`
    : null;
  const bookingUrl = row.destination
    ? `https://www.booking.com/search.html?ss=${encodeURIComponent(row.destination)}`
    : null;

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-start gap-3">
        {/* Time */}
        {row.time && (
          <span className="flex-shrink-0 w-14 text-xs text-ink-muted font-mono mt-0.5">{row.time}</span>
        )}

        <div className="min-w-0 flex-1">
          {/* Destination */}
          <p className="text-sm font-semibold text-ink leading-snug">
            {row.destination || row.city || "—"}
          </p>

          {/* Route */}
          {(row.from || row.to) && (
            <p className="mt-0.5 text-xs text-ink-muted">
              {row.from && <span>{row.from}</span>}
              {row.from && row.to && <span className="mx-1.5 text-ink-muted/40">→</span>}
              {row.to && <span>{row.to}</span>}
              {row.transport && <span className="ml-2 text-ink-muted/60">· {row.transport}</span>}
            </p>
          )}

          {/* Notes */}
          {row.notes && (
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">{row.notes}</p>
          )}

          {/* Category tag */}
          {row.category && (
            <span className="mt-1.5 inline-block rounded-full bg-paper-dim px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
              {row.category}
            </span>
          )}

          {/* ✅ RESTORED: Travel action link chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {/* Map */}
            <TravelChip
              href={mapUrl}
              icon="📍"
              label={t("mapLink").replace("📍 ", "")}
            />
            {/* Route */}
            {routeUrl && (
              <TravelChip href={routeUrl} icon="🗺" label={t("routeLink").replace("🗺 ", "")} />
            )}
            {/* Flights */}
            {flightUrl && (
              <TravelChip href={flightUrl} icon="✈️" label="Flights" />
            )}
            {/* Booking */}
            {bookingUrl && (
              <TravelChip href={bookingUrl} icon="🎫" label="Booking" />
            )}
          </div>
        </div>

        {/* Budget */}
        {budget > 0 && (
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-semibold text-ink">{formatIDR(idr)}</p>
            <p className="text-[10px] text-ink-muted">{formatCurrency(budget, currency)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TravelChip — compact rounded-full link chip.
 * In preview: clickable link opening a new tab.
 * In PDF print: chip is visible, URL printed below via CSS.
 */
function TravelChip({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="travel-chip inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 print:border-paper-line print:bg-white"
      data-url={href}
    >
      <span className="text-[11px] leading-none">{icon}</span>
      {label}
    </a>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function SumCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-paper-line bg-white p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink leading-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-ink-muted">{sub}</p>}
    </div>
  );
}
