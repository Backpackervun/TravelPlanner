"use client";

import { createPortal } from "react-dom";
import { useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS } from "@/lib/utils";
import { getTransportOptions, getBookingUrl, getKlookUrl } from "@/lib/regions";

/**
 * ItineraryTable — Patch 14b
 *
 * Fixes:
 * 1. Transport options update per region (Japan → Shinkansen, Korea → KTX, etc.)
 * 2. City column wider (min-w-[120px]) so long city names are visible
 * 3. Booking link per transport (Klook, FlixBus, JR Pass, etc.)
 * 4. Day separators between rows with different dates
 * 5. ↑ ↓ move buttons
 * 6. Hotel chip only when category = Hotel
 * 7. 3-dot menu via portal (no overflow clip)
 */
export default function ItineraryTable({
  rows, dayMap, region,
  onUpdate, onAdd, onDelete,
  onInsertAbove, onInsertBelow,
  onMoveUp, onMoveDown,
  currencyMode = "local",
}) {
  const { t } = useT();
  const currency      = getCurrency(region);
  const isIDR         = currency.code === "IDR";
  const localDisabled = currencyMode === "idr";
  const idrDisabled   = currencyMode === "local";

  // ✅ Transport options per region
  const transportOptions = getTransportOptions(region);

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Heading */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">{t("itinerarySection")}</p>
          <h2 className="text-lg font-semibold text-ink mt-0.5">{t("dayByDay")}</h2>
        </div>
        <span className="rounded-full border border-paper-line bg-paper-dim px-2.5 py-1 text-xs text-ink-muted">
          {rows.length === 1 ? t("stopCount", { count: 1 }) : t("stopsCount", { count: rows.length })}
        </span>
      </div>

      {/* Mode hint */}
      {!isIDR && (
        <div className="border-b border-paper-line bg-accent-50/40 px-5 py-2">
          <p className="text-xs text-navy-600 font-medium">
            ✏️ {currencyMode === "idr"
              ? `${t("editIDR")} — ${currency.code} auto-calculated`
              : `${t("editLocal", { code: currency.code })} — IDR auto-calculated`}
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: "1200px" }}>
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              {[
                "",
                t("date"), t("time"),
                t("city"),         // wider column
                t("destination"), `${t("from")} / ${t("to")}`,
                t("transport"), t("category"), t("notes"),
                ...(isIDR ? ["IDR"] : [`${currency.code}`, "IDR"]),
                t("links"),
                "↕",
                "",
              ].map((h, i) => (
                <th key={i} className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted whitespace-nowrap first:pl-4 last:pr-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={15} className="px-5 py-14 text-center text-sm text-ink-muted">{t("noStops")}</td></tr>
            ) : (
              rows.map((row, idx) => {
                const prevDate = idx > 0 ? (rows[idx-1].date||"").trim() : null;
                const thisDate = (row.date||"").trim();
                const showSep  = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
                const dayNum   = thisDate ? (dayMap[thisDate] ?? null) : null;

                return (
                  <tbody key={row.id}>
                    {showSep && (
                      <tr className="bg-paper-dim/30">
                        <td colSpan={15} className="py-1 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-navy-100" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">
                              — {t("day")} {dayMap[thisDate] ?? "?"} —
                            </span>
                            <div className="h-px flex-1 bg-navy-100" />
                          </div>
                        </td>
                      </tr>
                    )}
                    <DesktopRow
                      row={row} idx={idx} total={rows.length}
                      dayNum={dayNum}
                      currency={currency} isIDR={isIDR}
                      localDisabled={localDisabled} idrDisabled={idrDisabled}
                      transportOptions={transportOptions}
                      region={region}
                      onUpdate={onUpdate}
                      onMoveUp={() => onMoveUp?.(row.id)}
                      onMoveDown={() => onMoveDown?.(row.id)}
                      onInsertAbove={() => onInsertAbove?.(row.id)}
                      onInsertBelow={() => onInsertBelow?.(row.id)}
                      onDelete={() => onDelete?.(row.id)}
                      t={t}
                    />
                  </tbody>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y divide-paper-line/60">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">{t("noStops")}</p>
        ) : rows.map((row, idx) => {
          const prevDate = idx > 0 ? (rows[idx-1].date||"").trim() : null;
          const thisDate = (row.date||"").trim();
          const showSep  = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
          const dayNum   = thisDate ? (dayMap[thisDate] ?? null) : null;
          return (
            <div key={row.id}>
              {showSep && (
                <div className="bg-paper-dim/60 py-1.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-navy-100" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-400">
                      {t("day")} {dayMap[thisDate] ?? "?"}
                    </span>
                    <div className="h-px flex-1 bg-navy-100" />
                  </div>
                </div>
              )}
              <MobileCard
                row={row} idx={idx} total={rows.length}
                dayNum={dayNum}
                currency={currency} isIDR={isIDR}
                localDisabled={localDisabled} idrDisabled={idrDisabled}
                transportOptions={transportOptions}
                region={region}
                onUpdate={onUpdate}
                onMoveUp={() => onMoveUp?.(row.id)}
                onMoveDown={() => onMoveDown?.(row.id)}
                onInsertAbove={() => onInsertAbove?.(row.id)}
                onInsertBelow={() => onInsertBelow?.(row.id)}
                onDelete={() => onDelete?.(row.id)}
                t={t}
              />
            </div>
          );
        })}
      </div>

      {/* Add row */}
      <div className="border-t border-paper-line/60 px-5 py-3">
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-paper-line px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-500">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t("addRow")}
        </button>
      </div>
    </div>
  );
}

// ── Desktop row ───────────────────────────────────────────────────────────────

function DesktopRow({
  row, idx, total, dayNum,
  currency, isIDR, localDisabled, idrDisabled,
  transportOptions, region,
  onUpdate, onMoveUp, onMoveDown, onInsertAbove, onInsertBelow, onDelete, t,
}) {
  const showHotel = row.category === "Hotel";
  const { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl } = buildLinks(row, region);

  const ci = "w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";
  const si = "w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";

  return (
    <tr className="hover:bg-paper-dim/20 border-b border-paper-line/40 transition-colors">

      {/* Day badge */}
      <td className="pl-4 py-2.5 w-8">
        {dayNum !== null && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white">{dayNum}</span>
        )}
      </td>

      {/* Date */}
      <td className="px-2 py-2.5">
        <input type="date" value={row.date||""} onChange={(e) => onUpdate(row.id,"date",e.target.value)}
          className={`${ci} w-[120px]`} />
      </td>

      {/* Time */}
      <td className="px-2 py-2.5">
        <input type="time" value={row.time||""} onChange={(e) => onUpdate(row.id,"time",e.target.value)}
          className={`${ci} w-[90px]`} />
      </td>

      {/* ✅ City — wider min-width so long names are visible */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.city||""} placeholder={t("city")}
          onChange={(e) => onUpdate(row.id,"city",e.target.value)}
          className={`${ci}`} style={{ minWidth: "120px", width: "120px" }} />
      </td>

      {/* Destination */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.destination||""} placeholder={t("destinationPlaceholder")}
          onChange={(e) => onUpdate(row.id,"destination",e.target.value)}
          className={`${ci} w-32`} />
      </td>

      {/* From / To */}
      <td className="px-2 py-2.5">
        <div className="flex flex-col gap-1">
          <input type="text" value={row.from||""} placeholder={t("from")}
            onChange={(e) => onUpdate(row.id,"from",e.target.value)} className={`${ci} w-28`} />
          <input type="text" value={row.to||""} placeholder={t("to")}
            onChange={(e) => onUpdate(row.id,"to",e.target.value)} className={`${ci} w-28`} />
        </div>
      </td>

      {/* ✅ Transport — region-specific options */}
      <td className="px-2 py-2.5">
        <select value={row.transport||""} onChange={(e) => onUpdate(row.id,"transport",e.target.value)} className={`${si} w-28`}>
          <option value="">—</option>
          {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>

      {/* Category */}
      <td className="px-2 py-2.5">
        <select value={row.category||""} onChange={(e) => onUpdate(row.id,"category",e.target.value)} className={`${si} w-28`}>
          <option value="">—</option>
          {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </td>

      {/* Notes */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.notes||""} placeholder="—"
          onChange={(e) => onUpdate(row.id,"notes",e.target.value)} className={`${ci} w-28`} />
      </td>

      {/* Budget local */}
      {!isIDR && (
        <td className="px-2 py-2.5">
          <input type="number" value={row.budgetLocal||0} readOnly={localDisabled}
            onChange={(e) => !localDisabled && onUpdate(row.id,"budgetLocal",Number(e.target.value))}
            className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
              localDisabled ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
              : "border-transparent bg-transparent text-ink hover:border-paper-line focus:border-accent-300 focus:bg-white"
            }`} />
        </td>
      )}

      {/* Budget IDR */}
      <td className="px-2 py-2.5">
        <input type="number" value={row.budgetIDR||0} readOnly={idrDisabled && !isIDR}
          onChange={(e) => (isIDR||!idrDisabled) && onUpdate(row.id,"budgetIDR",Number(e.target.value))}
          className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
            idrDisabled && !isIDR ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
            : "border-transparent bg-transparent text-navy-500 font-semibold hover:border-paper-line focus:border-accent-300 focus:bg-white"
          }`} />
      </td>

      {/* ✅ Links — Map, Route, Flights, booking per transport, Hotel */}
      <td className="px-2 py-2.5">
        <div className="flex gap-1 flex-wrap" style={{ minWidth: "90px" }}>
          <LinkChip href={mapUrl}     icon="📍" label="Map" />
          {routeUrl   && <LinkChip href={routeUrl}   icon="🗺"  label="Route" />}
          {flightUrl  && <LinkChip href={flightUrl}  icon="✈️" label="Flights" />}
          {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Book" />}
          {showHotel && hotelUrl && <LinkChip href={hotelUrl} icon="🏨" label="Hotel" />}
        </div>
      </td>

      {/* Move up/down */}
      <td className="px-1 py-2.5">
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={idx===0}
            className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button onClick={onMoveDown} disabled={idx===total-1}
            className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </td>

      {/* 3-dot */}
      <td className="pr-3 py-2.5">
        <RowActions onInsertAbove={onInsertAbove} onInsertBelow={onInsertBelow} onDelete={onDelete} t={t} />
      </td>
    </tr>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function MobileCard({
  row, idx, total, dayNum,
  currency, isIDR, localDisabled, idrDisabled,
  transportOptions, region,
  onUpdate, onMoveUp, onMoveDown, onInsertAbove, onInsertBelow, onDelete, t,
}) {
  const showHotel = row.category === "Hotel";
  const { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl } = buildLinks(row, region);

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        {dayNum !== null && (
          <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white mt-0.5">{dayNum}</span>
        )}
        <div className="flex-1 min-w-0">
          <input type="text" value={row.destination||""} placeholder={t("destinationPlaceholder")}
            onChange={(e) => onUpdate(row.id,"destination",e.target.value)}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
          {/* ✅ City — full width input */}
          <input type="text" value={row.city||""} placeholder={t("city")}
            onChange={(e) => onUpdate(row.id,"city",e.target.value)}
            className="w-full mt-0.5 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink-muted outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={idx===0}
            className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button onClick={onMoveDown} disabled={idx===total-1}
            className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <RowActions onInsertAbove={onInsertAbove} onInsertBelow={onInsertBelow} onDelete={onDelete} t={t} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("date")}</p>
          <input type="date" value={row.date||""} onChange={(e) => onUpdate(row.id,"date",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none" /></div>
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("time")}</p>
          <input type="time" value={row.time||""} onChange={(e) => onUpdate(row.id,"time",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none" /></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("from")}</p>
          <input type="text" value={row.from||""} placeholder="—" onChange={(e) => onUpdate(row.id,"from",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none" /></div>
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("to")}</p>
          <input type="text" value={row.to||""} placeholder="—" onChange={(e) => onUpdate(row.id,"to",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none" /></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("transport")}</p>
          <select value={row.transport||""} onChange={(e) => onUpdate(row.id,"transport",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none">
            <option value="">—</option>
            {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select></div>
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("category")}</p>
          <select value={row.category||""} onChange={(e) => onUpdate(row.id,"category",e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none">
            <option value="">—</option>
            {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => <option key={o} value={o}>{o}</option>)}
          </select></div>
      </div>

      <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("notes")}</p>
        <input type="text" value={row.notes||""} placeholder="—" onChange={(e) => onUpdate(row.id,"notes",e.target.value)}
          className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none" /></div>

      <div className="grid grid-cols-2 gap-2">
        {!isIDR && (
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{currency.code}{localDisabled ? " (auto)":""}</p>
            <input type="number" value={row.budgetLocal||0} readOnly={localDisabled}
              onChange={(e) => !localDisabled && onUpdate(row.id,"budgetLocal",Number(e.target.value))}
              className={`w-full rounded-lg border px-2.5 py-2 text-right font-mono text-sm outline-none ${localDisabled ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : "border-paper-line bg-white text-ink"}`} /></div>
        )}
        <div><p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">IDR{idrDisabled && !isIDR ? " (auto)":""}</p>
          <input type="number" value={row.budgetIDR||0} readOnly={idrDisabled && !isIDR}
            onChange={(e) => (isIDR||!idrDisabled) && onUpdate(row.id,"budgetIDR",Number(e.target.value))}
            className={`w-full rounded-lg border px-2.5 py-2 text-right font-mono text-sm font-semibold outline-none ${idrDisabled && !isIDR ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : "border-paper-line bg-white text-navy-500"}`} /></div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <LinkChip href={mapUrl}    icon="📍" label="Map" />
        {routeUrl   && <LinkChip href={routeUrl}   icon="🗺"  label="Route" />}
        {flightUrl  && <LinkChip href={flightUrl}  icon="✈️" label="Flights" />}
        {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Book" />}
        {showHotel && hotelUrl && <LinkChip href={hotelUrl} icon="🏨" label="Hotel" />}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildLinks(row, region) {
  const destQ  = encodeURIComponent([row.destination, row.city, row.to].filter(Boolean).join(" ")||"");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destQ}`;

  const routeUrl = row.from && row.to
    ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
    : null;

  const isFlightTransport = (row.transport||"").toLowerCase().includes("flight");
  const flightUrl = isFlightTransport && row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from)}+to+${encodeURIComponent(row.to)}`
    : null;

  // ✅ Booking link per transport type
  const bookingUrl = row.transport
    ? getBookingUrl(row.transport, { from: row.from, to: row.to, destination: row.destination||row.city, region })
    : null;

  const hotelUrl = (row.destination||row.city)
    ? `https://www.booking.com/search.html?ss=${encodeURIComponent(row.destination||row.city)}`
    : null;

  return { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl };
}

function LinkChip({ href, icon, label }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 active:scale-95">
      <span className="text-[11px] leading-none">{icon}</span>{label}
    </a>
  );
}

function RowActions({ onInsertAbove, onInsertBelow, onDelete, t }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const btnRef = useRef(null);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setStyle({ position:"fixed", top: rect.bottom+4, right: window.innerWidth-rect.right, zIndex:9999, minWidth:"160px" });
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
      {open && typeof window !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex:9998 }} onClick={() => setOpen(false)} />
          <div className="rounded-xl border border-paper-line bg-white py-1 shadow-card" style={style}>
            <RA label={`↑ ${t("insertAbove")}`} onClick={() => { onInsertAbove(); setOpen(false); }} />
            <RA label={`↓ ${t("insertBelow")}`} onClick={() => { onInsertBelow(); setOpen(false); }} />
            <RA label={`🗑 ${t("deleteRow")}`}   onClick={() => { onDelete();       setOpen(false); }} danger />
          </div>
        </>,
        document.body
      )}
    </>
  );
}
function RA({ label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-paper-dim whitespace-nowrap ${danger ? "text-red-500" : "text-ink-soft"}`}>
      {label}
    </button>
  );
}
