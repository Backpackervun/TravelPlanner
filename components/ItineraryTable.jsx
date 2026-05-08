"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS, TRANSPORT_OPTIONS } from "@/lib/utils";

/*
 * ItineraryTable — FULL RESTORATION
 *
 * Columns (desktop):
 *   Day | Date | Time | City | Destination | From→To | Transport | Category | Notes | Local | IDR | Links | ⋮
 *
 * Mobile: card view with all fields
 *
 * Link chips per row: 📍 Map | 🗺 Route | ✈️ Flights | 🎫 Hotel
 *   - Map: always shown
 *   - Route: shown when from + to are filled
 *   - Flights: shown when transport = Flight
 *   - Hotel: always shown (Booking.com search)
 */
export default function ItineraryTable({
  rows, dayMap, region,
  onUpdate, onAdd, onDelete,
  onInsertAbove, onInsertBelow,
  currencyMode = "local",
}) {
  const { t } = useT();
  const currency    = getCurrency(region);
  const isIDR       = currency.code === "IDR";
  const localDisabled = currencyMode === "idr";
  const idrDisabled   = currencyMode === "local";

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Section heading */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">
            {t("itinerarySection")}
          </p>
          <h2 className="text-lg font-semibold text-ink mt-0.5">{t("dayByDay")}</h2>
        </div>
        <span className="rounded-full border border-paper-line bg-paper-dim px-2.5 py-1 text-xs text-ink-muted">
          {rows.length === 1 ? t("stopCount", { count: 1 }) : t("stopsCount", { count: rows.length })}
        </span>
      </div>

      {/* Currency mode hint */}
      {!isIDR && (
        <div className="border-b border-paper-line bg-accent-50/50 px-5 py-2 flex items-center gap-2">
          <span className="text-xs">✏️</span>
          <p className="text-xs text-navy-600 font-medium">
            {currencyMode === "idr"
              ? `${t("editIDR")} — ${currency.code} auto-calculated`
              : `${t("editLocal", { code: currency.code })} — IDR auto-calculated`}
          </p>
        </div>
      )}

      {/* ── Desktop table ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              {[
                "", // day badge
                t("date"), t("time"), t("city"),
                t("destination"), "From / To",
                t("transport"), t("category"), t("notes"),
                ...(isIDR ? ["IDR"] : [`${currency.code}`, "IDR"]),
                t("links"), "",
              ].map((h, i) => (
                <th key={i} className="px-2.5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted whitespace-nowrap first:pl-4 last:pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-5 py-14 text-center text-sm text-ink-muted">
                  {t("noStops")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <DesktopRow
                  key={row.id}
                  row={row}
                  dayMap={dayMap}
                  currency={currency}
                  isIDR={isIDR}
                  localDisabled={localDisabled}
                  idrDisabled={idrDisabled}
                  onUpdate={onUpdate}
                  onInsertAbove={onInsertAbove}
                  onInsertBelow={onInsertBelow}
                  onDelete={onDelete}
                  t={t}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile/Tablet cards ── */}
      <div className="lg:hidden divide-y divide-paper-line/60">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">{t("noStops")}</p>
        ) : (
          rows.map((row) => (
            <MobileCard
              key={row.id}
              row={row}
              dayMap={dayMap}
              currency={currency}
              isIDR={isIDR}
              localDisabled={localDisabled}
              idrDisabled={idrDisabled}
              onUpdate={onUpdate}
              onInsertAbove={onInsertAbove}
              onInsertBelow={onInsertBelow}
              onDelete={onDelete}
              t={t}
            />
          ))
        )}
      </div>

      {/* Add row */}
      <div className="border-t border-paper-line/60 px-5 py-3">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-paper-line px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-500"
        >
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
  row, dayMap, currency, isIDR, localDisabled, idrDisabled,
  onUpdate, onInsertAbove, onInsertBelow, onDelete, t,
}) {
  const dayNum = row.date ? (dayMap[(row.date || "").trim()] ?? null) : null;
  const { mapUrl, routeUrl, flightUrl, bookingUrl } = buildLinks(row);

  const cellInput = "w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";
  const selectCls = "w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";

  return (
    <tr className="hover:bg-paper-dim/20 transition-colors">
      {/* Day badge */}
      <td className="pl-4 py-2.5 w-8">
        {dayNum !== null && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white flex-shrink-0">
            {dayNum}
          </span>
        )}
      </td>

      {/* Date */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.date || ""} placeholder="YYYY-MM-DD"
          onChange={(e) => onUpdate(row.id, "date", e.target.value)}
          className={`${cellInput} w-28 font-mono`} />
      </td>

      {/* Time */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.time || ""} placeholder="HH:MM"
          onChange={(e) => onUpdate(row.id, "time", e.target.value)}
          className={`${cellInput} w-16 font-mono`} />
      </td>

      {/* City */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.city || ""} placeholder={t("city")}
          onChange={(e) => onUpdate(row.id, "city", e.target.value)}
          className={`${cellInput} w-24`} />
      </td>

      {/* Destination */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.destination || ""} placeholder={t("destinationPlaceholder")}
          onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
          className={`${cellInput} w-32`} />
      </td>

      {/* From → To */}
      <td className="px-2 py-2.5">
        <div className="flex flex-col gap-1">
          <input type="text" value={row.from || ""} placeholder={t("from")}
            onChange={(e) => onUpdate(row.id, "from", e.target.value)}
            className={`${cellInput} w-28`} />
          <input type="text" value={row.to || ""} placeholder={t("to")}
            onChange={(e) => onUpdate(row.id, "to", e.target.value)}
            className={`${cellInput} w-28`} />
        </div>
      </td>

      {/* Transport */}
      <td className="px-2 py-2.5">
        <select value={row.transport || ""} onChange={(e) => onUpdate(row.id, "transport", e.target.value)}
          className={`${selectCls} w-24`}>
          <option value="">—</option>
          {(TRANSPORT_OPTIONS ?? ["Flight","Train","Bus","Car","Ferry","Walk","Taxi","MRT"]).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </td>

      {/* Category */}
      <td className="px-2 py-2.5">
        <select value={row.category || ""} onChange={(e) => onUpdate(row.id, "category", e.target.value)}
          className={`${selectCls} w-24`}>
          <option value="">—</option>
          {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </td>

      {/* Notes */}
      <td className="px-2 py-2.5">
        <input type="text" value={row.notes || ""} placeholder="—"
          onChange={(e) => onUpdate(row.id, "notes", e.target.value)}
          className={`${cellInput} w-32`} />
      </td>

      {/* Budget local — disabled when mode=idr */}
      {!isIDR && (
        <td className="px-2 py-2.5">
          <input type="number"
            value={row.budgetLocal || 0}
            readOnly={localDisabled}
            onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
            title={localDisabled ? t("budgetDisabledHint") : ""}
            className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
              localDisabled
                ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
                : "border-transparent bg-transparent text-ink hover:border-paper-line focus:border-accent-300 focus:bg-white"
            }`}
          />
        </td>
      )}

      {/* Budget IDR — disabled when mode=local */}
      <td className="px-2 py-2.5">
        <input type="number"
          value={row.budgetIDR || 0}
          readOnly={idrDisabled && !isIDR}
          onChange={(e) => (isIDR || !idrDisabled) && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
          title={idrDisabled && !isIDR ? t("budgetDisabledHint") : ""}
          className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
            idrDisabled && !isIDR
              ? "cursor-not-allowed border-transparent bg-paper-dim/60 text-ink-muted opacity-50"
              : "border-transparent bg-transparent text-navy-500 font-semibold hover:border-paper-line focus:border-accent-300 focus:bg-white"
          }`}
        />
      </td>

      {/* Links */}
      <td className="px-2 py-2.5">
        <div className="flex gap-1 flex-wrap min-w-[120px]">
          <LinkChip href={mapUrl}    icon="📍" label="Map" />
          {routeUrl  && <LinkChip href={routeUrl}  icon="🗺"  label="Route" />}
          {flightUrl && <LinkChip href={flightUrl} icon="✈️" label="Flights" />}
          {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Hotel" />}
        </div>
      </td>

      {/* Row actions */}
      <td className="pr-4 py-2.5">
        <RowActions
          onInsertAbove={() => onInsertAbove?.(row.id)}
          onInsertBelow={() => onInsertBelow?.(row.id)}
          onDelete={() => onDelete?.(row.id)}
          t={t}
        />
      </td>
    </tr>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function MobileCard({
  row, dayMap, currency, isIDR, localDisabled, idrDisabled,
  onUpdate, onInsertAbove, onInsertBelow, onDelete, t,
}) {
  const dayNum = row.date ? (dayMap[(row.date || "").trim()] ?? null) : null;
  const { mapUrl, routeUrl, flightUrl, bookingUrl } = buildLinks(row);

  return (
    <div className="px-4 py-4 space-y-3">

      {/* Header row: day badge + destination + actions */}
      <div className="flex items-start gap-2.5">
        {dayNum !== null && (
          <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white mt-0.5">
            {dayNum}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <input type="text" value={row.destination || ""} placeholder={t("destinationPlaceholder")}
            onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
          <input type="text" value={row.city || ""} placeholder={t("city")}
            onChange={(e) => onUpdate(row.id, "city", e.target.value)}
            className="w-full mt-0.5 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink-muted outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
        </div>
        <RowActions
          onInsertAbove={() => onInsertAbove?.(row.id)}
          onInsertBelow={() => onInsertBelow?.(row.id)}
          onDelete={() => onDelete?.(row.id)}
          t={t}
        />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-2">
        <MField label={t("date")}>
          <input type="text" value={row.date || ""} placeholder="YYYY-MM-DD"
            onChange={(e) => onUpdate(row.id, "date", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 font-mono text-xs text-ink outline-none focus:border-accent-300" />
        </MField>
        <MField label={t("time")}>
          <input type="text" value={row.time || ""} placeholder="HH:MM"
            onChange={(e) => onUpdate(row.id, "time", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 font-mono text-xs text-ink outline-none focus:border-accent-300" />
        </MField>
      </div>

      {/* From → To */}
      <div className="grid grid-cols-2 gap-2">
        <MField label={t("from")}>
          <input type="text" value={row.from || ""} placeholder="—"
            onChange={(e) => onUpdate(row.id, "from", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-accent-300" />
        </MField>
        <MField label={t("to")}>
          <input type="text" value={row.to || ""} placeholder="—"
            onChange={(e) => onUpdate(row.id, "to", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-accent-300" />
        </MField>
      </div>

      {/* Transport + Category */}
      <div className="grid grid-cols-2 gap-2">
        <MField label={t("transport")}>
          <select value={row.transport || ""} onChange={(e) => onUpdate(row.id, "transport", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none">
            <option value="">—</option>
            {(TRANSPORT_OPTIONS ?? ["Flight","Train","Bus","Car","Ferry","Walk","Taxi","MRT"]).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </MField>
        <MField label={t("category")}>
          <select value={row.category || ""} onChange={(e) => onUpdate(row.id, "category", e.target.value)}
            className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none">
            <option value="">—</option>
            {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </MField>
      </div>

      {/* Notes */}
      <MField label={t("notes")}>
        <input type="text" value={row.notes || ""} placeholder="—"
          onChange={(e) => onUpdate(row.id, "notes", e.target.value)}
          className="w-full rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-accent-300" />
      </MField>

      {/* Budget */}
      <div className="grid grid-cols-2 gap-2">
        {!isIDR && (
          <MField label={`${currency.code}${localDisabled ? " (auto)" : ""}`}>
            <input type="number"
              value={row.budgetLocal || 0}
              readOnly={localDisabled}
              onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
              className={`w-full rounded-lg border px-2.5 py-2 text-right font-mono text-sm outline-none ${
                localDisabled
                  ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed"
                  : "border-paper-line bg-white text-ink focus:border-accent-300"
              }`}
            />
          </MField>
        )}
        <MField label={`IDR${idrDisabled && !isIDR ? " (auto)" : ""}`}>
          <input type="number"
            value={row.budgetIDR || 0}
            readOnly={idrDisabled && !isIDR}
            onChange={(e) => (isIDR || !idrDisabled) && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
            className={`w-full rounded-lg border px-2.5 py-2 text-right font-mono text-sm font-semibold outline-none ${
              idrDisabled && !isIDR
                ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed"
                : "border-paper-line bg-white text-navy-500 focus:border-accent-300"
            }`}
          />
        </MField>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-1.5">
        <LinkChip href={mapUrl}    icon="📍" label="Map" />
        {routeUrl   && <LinkChip href={routeUrl}   icon="🗺"  label="Route" />}
        {flightUrl  && <LinkChip href={flightUrl}  icon="✈️"  label="Flights" />}
        {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Hotel" />}
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

/** Build travel action URLs for a row */
function buildLinks(row) {
  const destQ  = encodeURIComponent([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${destQ}`;

  const routeUrl = row.from && row.to
    ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
    : null;

  const isFlightTransport = (row.transport || "").toLowerCase().includes("flight");
  const flightUrl = isFlightTransport && row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from)}+to+${encodeURIComponent(row.to)}`
    : null;

  const bookingUrl = (row.destination || row.city)
    ? `https://www.booking.com/search.html?ss=${encodeURIComponent(row.destination || row.city)}`
    : null;

  return { mapUrl, routeUrl, flightUrl, bookingUrl };
}

function LinkChip({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 active:scale-95"
    >
      <span className="text-[11px] leading-none">{icon}</span>
      {label}
    </a>
  );
}

function MField({ label, children }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{label}</p>
      {children}
    </div>
  );
}

function RowActions({ onInsertAbove, onInsertBelow, onDelete, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-shrink-0">
      <button onClick={() => setOpen(v => !v)}
        className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-36 rounded-xl border border-paper-line bg-white py-1 shadow-card">
            <AI label={`↑ ${t("insertAbove")}`} onClick={() => { onInsertAbove(); setOpen(false); }} />
            <AI label={`↓ ${t("insertBelow")}`} onClick={() => { onInsertBelow(); setOpen(false); }} />
            <AI label={`🗑 ${t("deleteRow")}`}   onClick={() => { onDelete();       setOpen(false); }} danger />
          </div>
        </>
      )}
    </div>
  );
}

function AI({ label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center px-3 py-2 text-xs transition hover:bg-paper-dim ${danger ? "text-red-500" : "text-ink-soft"}`}>
      {label}
    </button>
  );
}
