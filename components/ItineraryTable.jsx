"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS, TRANSPORT_OPTIONS } from "@/lib/utils";

/**
 * ItineraryTable — live planner table
 *
 * Fixes in this version:
 *  1. Map / Route / Flights / Booking link chips shown per row
 *  2. Currency mode: disabled field shows muted styling + cursor-not-allowed
 *  3. Fully translated labels
 */
export default function ItineraryTable({
  rows, dayMap, region,
  onUpdate, onAdd, onDelete,
  onInsertAbove, onInsertBelow,
  currencyMode = "local",   // "local" | "idr"
}) {
  const { t } = useT();
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  const localDisabled = currencyMode === "idr";
  const idrDisabled   = currencyMode === "local";

  // Helper: build travel links for a row
  const links = (row) => {
    const destQ = encodeURIComponent(
      [row.destination, row.city, row.to].filter(Boolean).join(" ") || "Indonesia"
    );
    const mapUrl     = `https://www.google.com/maps/search/?api=1&query=${destQ}`;
    const routeUrl   = row.from && row.to
      ? `https://www.google.com/maps/dir/${encodeURIComponent(row.from)}/${encodeURIComponent(row.to)}`
      : null;
    const flightUrl  = row.transport?.toLowerCase().includes("flight") || (row.from && row.to)
      ? `https://www.google.com/flights?q=Flights+from+${encodeURIComponent(row.from || "")}+to+${encodeURIComponent(row.to || destQ)}`
      : null;
    const bookingUrl = row.destination || row.city
      ? `https://www.booking.com/search.html?ss=${encodeURIComponent(row.destination || row.city)}`
      : null;

    return { mapUrl, routeUrl, flightUrl, bookingUrl };
  };

  const dayNum = (row) => row.date ? (dayMap[(row.date || "").trim()] ?? null) : null;

  // Column hint
  const modeHint = isIDR
    ? null
    : currencyMode === "idr"
      ? t("editIDR")
      : t("editLocal", { code: currency.code });

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Section heading */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {t("itinerarySection")}
          </p>
          <h2 className="text-lg font-semibold text-ink mt-0.5">{t("dayByDay")}</h2>
        </div>
        <span className="rounded-full border border-paper-line bg-paper-dim px-2.5 py-1 text-xs text-ink-muted">
          {rows.length === 1 ? t("stopCount", { count: 1 }) : t("stopsCount", { count: rows.length })}
        </span>
      </div>

      {/* Mode hint */}
      {!isIDR && modeHint && (
        <div className="border-b border-paper-line bg-accent-50/40 px-5 py-2.5">
          <p className="text-xs text-navy-500 font-medium">
            {currencyMode === "idr"
              ? `✏️ ${t("editIDR")} mode — ${currency.code} is auto-calculated`
              : `✏️ ${t("editLocal", { code: currency.code })} mode — IDR is auto-calculated`}
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-paper-line bg-paper-dim/60">
            <tr>
              {["", t("date"), t("time"), t("destination"), t("transport"), t("category"), t("notes"),
                ...(isIDR ? ["IDR"] : [`${currency.code}`, "IDR"]),
                t("links"), ""
              ].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-line/60">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-5 py-12 text-center text-sm text-ink-muted">
                  {t("noStops")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const dn = dayNum(row);
                const { mapUrl, routeUrl, flightUrl, bookingUrl } = links(row);
                return (
                  <tr key={row.id} className="hover:bg-paper-dim/30 transition-colors">
                    {/* Day badge */}
                    <td className="px-3 py-2.5">
                      {dn !== null && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white">
                          {dn}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.date || ""} onChange={(e) => onUpdate(row.id, "date", e.target.value)}
                        placeholder="2025-04-05"
                        className="w-28 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-mono text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
                    </td>

                    {/* Time */}
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.time || ""} onChange={(e) => onUpdate(row.id, "time", e.target.value)}
                        placeholder="10:00"
                        className="w-20 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-mono text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
                    </td>

                    {/* Destination */}
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.destination || ""} onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
                        placeholder={t("destinationPlaceholder")}
                        className="w-36 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
                      {(row.from || row.to) && (
                        <p className="px-2 text-[10px] text-ink-muted whitespace-nowrap">
                          {row.from && <span>{row.from}</span>}
                          {row.from && row.to && <span className="mx-1 text-ink-muted/40">→</span>}
                          {row.to && <span>{row.to}</span>}
                        </p>
                      )}
                    </td>

                    {/* Transport */}
                    <td className="px-2 py-2.5">
                      <select value={row.transport || ""} onChange={(e) => onUpdate(row.id, "transport", e.target.value)}
                        className="w-28 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white">
                        <option value="">—</option>
                        {(TRANSPORT_OPTIONS ?? ["Flight","Train","Bus","Car","Ferry","Walk"]).map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </td>

                    {/* Category */}
                    <td className="px-2 py-2.5">
                      <select value={row.category || ""} onChange={(e) => onUpdate(row.id, "category", e.target.value)}
                        className="w-28 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white">
                        <option value="">—</option>
                        {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.notes || ""} onChange={(e) => onUpdate(row.id, "notes", e.target.value)}
                        placeholder="—"
                        className="w-32 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
                    </td>

                    {/* Budget local — disabled when currencyMode = "idr" */}
                    {!isIDR && (
                      <td className="px-2 py-2.5">
                        <input
                          type="number"
                          value={row.budgetLocal || 0}
                          onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
                          readOnly={localDisabled}
                          title={localDisabled ? t("budgetDisabledHint") : ""}
                          className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
                            localDisabled
                              ? "cursor-not-allowed select-none border-transparent bg-paper-dim/70 text-ink-muted opacity-50"
                              : "border-transparent bg-transparent text-ink hover:border-paper-line focus:border-accent-300 focus:bg-white"
                          }`}
                        />
                      </td>
                    )}

                    {/* Budget IDR — disabled when currencyMode = "local" */}
                    <td className="px-2 py-2.5">
                      <input
                        type="number"
                        value={row.budgetIDR || 0}
                        onChange={(e) => !idrDisabled && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
                        readOnly={idrDisabled}
                        title={idrDisabled ? t("budgetDisabledHint") : ""}
                        className={`w-24 rounded-lg border px-2 py-1 text-right text-xs font-mono outline-none transition ${
                          idrDisabled
                            ? "cursor-not-allowed select-none border-transparent bg-paper-dim/70 text-ink-muted opacity-50"
                            : "border-transparent bg-transparent text-navy-500 hover:border-paper-line focus:border-accent-300 focus:bg-white"
                        }`}
                      />
                    </td>

                    {/* ✅ LINKS — Map, Route, Flights, Booking chips */}
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1 flex-nowrap">
                        <LinkChip href={mapUrl} icon="📍" label="Map" />
                        {routeUrl  && <LinkChip href={routeUrl}  icon="🗺" label="Route" />}
                        {flightUrl && <LinkChip href={flightUrl} icon="✈️" label="Flights" />}
                        {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Hotel" />}
                      </div>
                    </td>

                    {/* Row actions */}
                    <td className="px-2 py-2.5">
                      <RowActions
                        onInsertAbove={() => onInsertAbove?.(row.id)}
                        onInsertBelow={() => onInsertBelow?.(row.id)}
                        onDelete={() => onDelete?.(row.id)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden divide-y divide-paper-line/60">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-muted">{t("noStops")}</p>
        ) : (
          rows.map((row) => {
            const dn = dayNum(row);
            const { mapUrl, routeUrl, flightUrl, bookingUrl } = links(row);
            return (
              <div key={row.id} className="px-4 py-4 space-y-3">
                {/* Day + Destination */}
                <div className="flex items-start gap-2.5">
                  {dn !== null && (
                    <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white mt-0.5">
                      {dn}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <input type="text" value={row.destination || ""} onChange={(e) => onUpdate(row.id, "destination", e.target.value)}
                      placeholder={t("destinationPlaceholder")}
                      className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={row.date || ""} onChange={(e) => onUpdate(row.id, "date", e.target.value)}
                        placeholder="Date" className="w-24 text-xs text-ink-muted bg-transparent border-none outline-none" />
                      <input type="text" value={row.time || ""} onChange={(e) => onUpdate(row.id, "time", e.target.value)}
                        placeholder="Time" className="w-16 text-xs text-ink-muted bg-transparent border-none outline-none" />
                    </div>
                  </div>
                  <RowActions
                    onInsertAbove={() => onInsertAbove?.(row.id)}
                    onInsertBelow={() => onInsertBelow?.(row.id)}
                    onDelete={() => onDelete?.(row.id)}
                  />
                </div>

                {/* Transport + Category + Notes */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("transport")}</p>
                    <select value={row.transport || ""} onChange={(e) => onUpdate(row.id, "transport", e.target.value)}
                      className="w-full rounded-lg border border-paper-line bg-white px-2 py-1.5 text-xs text-ink outline-none">
                      <option value="">—</option>
                      {(TRANSPORT_OPTIONS ?? ["Flight","Train","Bus","Car","Ferry","Walk"]).map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("category")}</p>
                    <select value={row.category || ""} onChange={(e) => onUpdate(row.id, "category", e.target.value)}
                      className="w-full rounded-lg border border-paper-line bg-white px-2 py-1.5 text-xs text-ink outline-none">
                      <option value="">—</option>
                      {(CATEGORY_OPTIONS ?? ["Hotel","Food","Attraction","Activity","Transport"]).map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">{t("notes")}</p>
                    <input type="text" value={row.notes || ""} onChange={(e) => onUpdate(row.id, "notes", e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-paper-line bg-white px-2 py-1.5 text-xs text-ink outline-none" />
                  </div>
                </div>

                {/* Budget — stacked, both editable based on mode */}
                <div className="grid grid-cols-2 gap-2">
                  {!isIDR && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">
                        {currency.code} {localDisabled && <span className="text-amber-500">auto</span>}
                      </p>
                      <input
                        type="number"
                        value={row.budgetLocal || 0}
                        onChange={(e) => !localDisabled && onUpdate(row.id, "budgetLocal", Number(e.target.value))}
                        readOnly={localDisabled}
                        className={`w-full rounded-lg border px-2.5 py-2 text-right text-sm font-mono outline-none ${
                          localDisabled ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : "border-paper-line bg-white text-ink"
                        }`}
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1">
                      IDR {idrDisabled && !isIDR && <span className="text-amber-500">auto</span>}
                    </p>
                    <input
                      type="number"
                      value={row.budgetIDR || 0}
                      onChange={(e) => !idrDisabled && onUpdate(row.id, "budgetIDR", Number(e.target.value))}
                      readOnly={idrDisabled}
                      className={`w-full rounded-lg border px-2.5 py-2 text-right text-sm font-mono outline-none ${
                        idrDisabled && !isIDR ? "border-paper-line bg-paper-dim/60 text-ink-muted opacity-60 cursor-not-allowed" : "border-paper-line bg-white text-navy-500 font-semibold"
                      }`}
                    />
                  </div>
                </div>

                {/* Mobile link chips */}
                <div className="flex flex-wrap gap-1.5">
                  <LinkChip href={mapUrl} icon="📍" label="Map" />
                  {routeUrl   && <LinkChip href={routeUrl}   icon="🗺"  label="Route" />}
                  {flightUrl  && <LinkChip href={flightUrl}  icon="✈️" label="Flights" />}
                  {bookingUrl && <LinkChip href={bookingUrl} icon="🎫" label="Hotel" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add row footer */}
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

// ── Link chip ─────────────────────────────────────────────────────────────────
function LinkChip({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 active:scale-95"
    >
      <span className="text-[11px] leading-none">{icon}</span>
      {label}
    </a>
  );
}

// ── Row action menu ───────────────────────────────────────────────────────────
function RowActions({ onInsertAbove, onInsertBelow, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-36 rounded-xl border border-paper-line bg-white py-1 shadow-card">
            <ActionItem label="↑ Insert above" onClick={() => { onInsertAbove(); setOpen(false); }} />
            <ActionItem label="↓ Insert below" onClick={() => { onInsertBelow(); setOpen(false); }} />
            <ActionItem label="🗑 Delete row" onClick={() => { onDelete(); setOpen(false); }} danger />
          </div>
        </>
      )}
    </div>
  );
}

function ActionItem({ label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center px-3 py-2 text-xs transition hover:bg-paper-dim ${danger ? "text-red-500" : "text-ink-soft"}`}>
      {label}
    </button>
  );
}
