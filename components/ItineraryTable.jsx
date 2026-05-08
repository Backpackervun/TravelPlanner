"use client";

import { Fragment, createPortal, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS } from "@/lib/utils";
import { getTransportOptions, getBookingUrl } from "@/lib/regions";

/**
 * ItineraryTable — Patch 14c
 *
 * CRITICAL FIX: Previous version wrapped each row in <tbody> inside <tbody>.
 * This is invalid HTML and breaks column alignment completely.
 * Now uses React.Fragment so day-separator <tr> and row <tr> share the
 * same <tbody>, keeping every column perfectly aligned.
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
  const transportOpts = getTransportOptions(region);

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Section heading */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">{t("itinerarySection")}</p>
          <h2 className="text-lg font-semibold text-ink mt-0.5">{t("dayByDay")}</h2>
        </div>
        <span className="rounded-full border border-paper-line bg-paper-dim px-2.5 py-1 text-xs text-ink-muted">
          {rows.length === 1 ? t("stopCount", { count: 1 }) : t("stopsCount", { count: rows.length })}
        </span>
      </div>

      {/* Currency mode hint */}
      {!isIDR && (
        <div className="border-b border-paper-line bg-accent-50/40 px-5 py-2">
          <p className="text-xs text-navy-600 font-medium">
            ✏️ {currencyMode === "idr"
              ? `${t("editIDR")} — ${currency.code} auto-calculated`
              : `${t("editLocal", { code: currency.code })} — IDR auto-calculated`}
          </p>
        </div>
      )}

      {/* ── Desktop table ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: "1200px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "36px" }} />   {/* day badge */}
            <col style={{ width: "130px" }} />  {/* date */}
            <col style={{ width: "100px" }} />  {/* time */}
            <col style={{ width: "120px" }} />  {/* city */}
            <col style={{ width: "130px" }} />  {/* destination */}
            <col style={{ width: "130px" }} />  {/* from/to */}
            <col style={{ width: "120px" }} />  {/* transport */}
            <col style={{ width: "120px" }} />  {/* category */}
            <col style={{ width: "110px" }} />  {/* notes */}
            {!isIDR && <col style={{ width: "90px" }} />}  {/* local budget */}
            <col style={{ width: "90px" }} />   {/* IDR budget */}
            <col style={{ width: "140px" }} />  {/* links */}
            <col style={{ width: "36px" }} />   {/* move */}
            <col style={{ width: "36px" }} />   {/* 3-dot */}
          </colgroup>

          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted" />
              {[
                t("date"), t("time"), t("city"),
                t("destination"), `${t("from")} / ${t("to")}`,
                t("transport"), t("category"), t("notes"),
                ...(isIDR ? ["IDR"] : [`${currency.code}`, "IDR"]),
                t("links"), "↕", "",
              ].map((h, i) => (
                <th key={i} className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted whitespace-nowrap overflow-hidden">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* ✅ SINGLE tbody — day separators are <tr> inside same <tbody> */}
          <tbody className="divide-y divide-paper-line/40">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={isIDR ? 13 : 14} className="px-5 py-14 text-center text-sm text-ink-muted">
                  {t("noStops")}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const prevDate  = idx > 0 ? (rows[idx - 1].date || "").trim() : null;
                const thisDate  = (row.date || "").trim();
                const showSep   = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
                const dayNum    = thisDate ? (dayMap[thisDate] ?? null) : null;
                const { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl } = buildLinks(row, region);
                const showHotel = row.category === "Hotel";

                return (
                  // ✅ Fragment — not <tbody>. This keeps all <tr> inside one <tbody>.
                  <Fragment key={row.id}>

                    {/* Day separator row */}
                    {showSep && (
                      <tr className="bg-paper-dim/30">
                        <td colSpan={isIDR ? 13 : 14} className="py-1 px-4">
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

                    {/* Data row */}
                    <tr className="hover:bg-paper-dim/20 transition-colors">

                      {/* Day badge */}
                      <td className="pl-3 py-2.5">
                        {dayNum !== null && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white">
                            {dayNum}
                          </span>
                        )}
                      </td>

                      {/* Date — native calendar */}
                      <td className="px-2 py-2.5">
                        <input
                          type="date"
                          value={row.date || ""}
                          onChange={(e) => onUpdate(row.id, "date", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        />
                      </td>

                      {/* Time — native time picker */}
                      <td className="px-2 py-2.5">
                        <input
                          type="time"
                          value={row.time || ""}
                          onChange={(e) => onUpdate(row.id, "time", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        />
                      </td>

                      {/* City */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={row.city || ""}
                          placeholder={t("city")}
                          onChange={(e) => onUpdate(row.id, "city", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        />
                      </td>

                      {/* Destination */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={row.destination || ""}
                          placeholder={t("destinationPlaceholder")}
                          onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        />
                      </td>

                      {/* From / To */}
                      <td className="px-2 py-2.5">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={row.from || ""}
                            placeholder={t("from")}
                            onChange={(e) => onUpdate(row.id, "from", e.target.value)}
                            className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                          />
                          <input
                            type="text"
                            value={row.to || ""}
                            placeholder={t("to")}
                            onChange={(e) => onUpdate(row.id, "to", e.target.value)}
                            className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                          />
                        </div>
                      </td>

                      {/* Transport — region-specific options */}
                      <td className="px-2 py-2.5">
                        <select
                          value={row.transport || ""}
                          onChange={(e) => onUpdate(row.id, "transport", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        >
                          <option value="">—</option>
                          {transportOpts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>

                      {/* Category */}
                      <td className="px-2 py-2.5">
                        <select
                          value={row.category || ""}
                          onChange={(e) => onUpdate(row.id, "category", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        >
                          <option value="">—</option>
                          {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={row.notes || ""}
                          placeholder="—"
                          onChange={(e) => onUpdate(row.id, "notes", e.target.value)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition"
                        />
                      </td>

                      {/* Budget local */}
                      {!isIDR && (
                        <td className="px-2 py-2.5">
                          <input
                            type="number"
                            value={row.budgetLocal || 0}
                            readOnly={localDisabled}
                            onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
                            className={`w-full rounded-lg border px-1.5 py-1 text-right text-xs font-mono outline-none transition ${
                              localDisabled
                                ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
                                : "border-transparent bg-transparent text-ink hover:border-paper-line focus:border-accent-300 focus:bg-white"
                            }`}
                          />
                        </td>
                      )}

                      {/* Budget IDR */}
                      <td className="px-2 py-2.5">
                        <input
                          type="number"
                          value={row.budgetIDR || 0}
                          readOnly={idrDisabled && !isIDR}
                          onChange={(e) => (isIDR || !idrDisabled) && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
                          className={`w-full rounded-lg border px-1.5 py-1 text-right text-xs font-mono outline-none transition ${
                            idrDisabled && !isIDR
                              ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
                              : "border-transparent bg-transparent text-navy-500 font-semibold hover:border-paper-line focus:border-accent-300 focus:bg-white"
                          }`}
                        />
                      </td>

                      {/* Links */}
                      <td className="px-2 py-2.5">
                        <div className="flex flex-wrap gap-1">
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
                          <button onClick={() => onMoveUp?.(row.id)} disabled={idx === 0}
                            className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                          </button>
                          <button onClick={() => onMoveDown?.(row.id)} disabled={idx === rows.length - 1}
                            className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                          </button>
                        </div>
                      </td>

                      {/* 3-dot menu */}
                      <td className="pr-3 py-2.5">
                        <RowActions
                          onInsertAbove={() => onInsertAbove?.(row.id)}
                          onInsertBelow={() => onInsertBelow?.(row.id)}
                          onDelete={() => onDelete?.(row.id)}
                          t={t}
                        />
                      </td>
                    </tr>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="lg:hidden divide-y divide-paper-line/60">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">{t("noStops")}</p>
        ) : (
          rows.map((row, idx) => {
            const prevDate = idx > 0 ? (rows[idx - 1].date || "").trim() : null;
            const thisDate = (row.date || "").trim();
            const showSep  = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
            const dayNum   = thisDate ? (dayMap[thisDate] ?? null) : null;
            const { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl } = buildLinks(row, region);
            const showHotel = row.category === "Hotel";

            return (
              <Fragment key={row.id}>
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
                  transportOpts={transportOpts}
                  mapUrl={mapUrl} routeUrl={routeUrl} flightUrl={flightUrl}
                  bookingUrl={bookingUrl} hotelUrl={hotelUrl} showHotel={showHotel}
                  onUpdate={onUpdate}
                  onMoveUp={() => onMoveUp?.(row.id)}
                  onMoveDown={() => onMoveDown?.(row.id)}
                  onInsertAbove={() => onInsertAbove?.(row.id)}
                  onInsertBelow={() => onInsertBelow?.(row.id)}
                  onDelete={() => onDelete?.(row.id)}
                  t={t}
                />
              </Fragment>
            );
          })
        )}
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

// ── Mobile card ───────────────────────────────────────────────────────────────

function MobileCard({
  row, idx, total, dayNum,
  currency, isIDR, localDisabled, idrDisabled,
  transportOpts, mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl, showHotel,
  onUpdate, onMoveUp, onMoveDown, onInsertAbove, onInsertBelow, onDelete, t,
}) {
  const inp = "w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-accent-300";

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-start gap-2.5">
        {dayNum !== null && (
          <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white mt-0.5">{dayNum}</span>
        )}
        <div className="flex-1 min-w-0">
          <input type="text" value={row.destination || ""} placeholder={t("destinationPlaceholder")}
            onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
          <input type="text" value={row.city || ""} placeholder={t("city")}
            onChange={(e) => onUpdate(row.id, "city", e.target.value)}
            className="w-full mt-0.5 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink-muted outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={idx === 0}
            className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button onClick={onMoveDown} disabled={idx === total - 1}
            className="grid h-6 w-6 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <RowActions onInsertAbove={onInsertAbove} onInsertBelow={onInsertBelow} onDelete={onDelete} t={t} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="mlab">{t("date")}</p><input type="date" value={row.date || ""} onChange={(e) => onUpdate(row.id, "date", e.target.value)} className={inp} /></div>
        <div><p className="mlab">{t("time")}</p><input type="time" value={row.time || ""} onChange={(e) => onUpdate(row.id, "time", e.target.value)} className={inp} /></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="mlab">{t("from")}</p><input type="text" value={row.from || ""} placeholder="—" onChange={(e) => onUpdate(row.id, "from", e.target.value)} className={inp} /></div>
        <div><p className="mlab">{t("to")}</p><input type="text" value={row.to || ""} placeholder="—" onChange={(e) => onUpdate(row.id, "to", e.target.value)} className={inp} /></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div><p className="mlab">{t("transport")}</p>
          <select value={row.transport || ""} onChange={(e) => onUpdate(row.id, "transport", e.target.value)} className={inp}>
            <option value="">—</option>
            {transportOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><p className="mlab">{t("category")}</p>
          <select value={row.category || ""} onChange={(e) => onUpdate(row.id, "category", e.target.value)} className={inp}>
            <option value="">—</option>
            {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div><p className="mlab">{t("notes")}</p>
        <input type="text" value={row.notes || ""} placeholder="—" onChange={(e) => onUpdate(row.id, "notes", e.target.value)} className={inp} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!isIDR && (
          <div><p className="mlab">{currency.code}{localDisabled ? " (auto)" : ""}</p>
            <input type="number" value={row.budgetLocal || 0} readOnly={localDisabled}
              onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
              className={`${inp} text-right font-mono ${localDisabled ? "bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : ""}`} />
          </div>
        )}
        <div><p className="mlab">IDR{idrDisabled && !isIDR ? " (auto)" : ""}</p>
          <input type="number" value={row.budgetIDR || 0} readOnly={idrDisabled && !isIDR}
            onChange={(e) => (isIDR || !idrDisabled) && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
            className={`${inp} text-right font-mono font-semibold text-navy-500 ${idrDisabled && !isIDR ? "bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : ""}`} />
        </div>
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
  const destQ  = encodeURIComponent([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destQ}`;

  const routeUrl = row.from && row.to
    ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
    : null;

  const isFlightTransport = (row.transport || "").toLowerCase().includes("flight");
  const flightUrl = isFlightTransport && row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from)}+to+${encodeURIComponent(row.to)}`
    : null;

  const bookingUrl = row.transport
    ? getBookingUrl(row.transport, { from: row.from, to: row.to, destination: row.destination || row.city, region })
    : null;

  const hotelUrl = (row.destination || row.city)
    ? `https://www.booking.com/search.html?ss=${encodeURIComponent(row.destination || row.city)}`
    : null;

  return { mapUrl, routeUrl, flightUrl, bookingUrl, hotelUrl };
}

function LinkChip({ href, icon, label }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 active:scale-95 whitespace-nowrap">
      <span className="text-[11px] leading-none">{icon}</span>{label}
    </a>
  );
}

function RowActions({
  onInsertAbove,
  onInsertBelow,
  onDelete,
  t,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="
          grid h-8 w-8 place-items-center
          rounded-xl
          border border-paper-line
          bg-white
          text-ink-muted
          hover:bg-paper-dim
          transition
        "
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-10 z-50
            w-44 overflow-hidden
            rounded-2xl
            border border-paper-line
            bg-white
            shadow-2xl
          "
        >
          <div className="py-1">

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onInsertAbove?.();
              }}
              className="
                w-full text-left px-4 py-2.5 text-sm
                text-slate-700 hover:bg-slate-100
                transition
              "
            >
              ↑ {t("insertAbove")}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onInsertBelow?.();
              }}
              className="
                w-full text-left px-4 py-2.5 text-sm
                text-slate-700 hover:bg-slate-100
                transition
              "
            >
              ↓ {t("insertBelow")}
            </button>

            <div className="my-1 border-t border-paper-line" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);

                const ok = window.confirm(
                  "Delete this row?"
                );

                if (ok) {
                  onDelete?.();
                }
              }}
              className="
                w-full text-left px-4 py-2.5 text-sm
                text-red-600 hover:bg-red-50
                transition
              "
            >
              🗑 {t("deleteRow")}
            </button>

          </div>
        </div>
      )}
    </div>
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
