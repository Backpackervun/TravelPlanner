"use client";

import { useState } from "react";
import {
  buildMapUrl,
  buildRouteUrl,
  CATEGORY_ICONS,
  CATEGORY_OPTIONS,
  CATEGORY_STYLES,
  checkRegionMismatch,
  formatCurrency,
  formatIDR,
  getBookingLink,
  getCurrency,
  getTransportOptions,
  transportIcon,
} from "@/lib/utils";
import SectionHeading from "./SectionHeading";

// ── Column definitions ────────────────────────────────────────────────────────

function buildColumns(currency) {
  const isIDR = currency.code === "IDR";
  const cols = [
    { key: "day",         label: "Day",                         width: 48,  align: "center" },
    { key: "date",        label: "Date",                        width: 130 },
    { key: "time",        label: "Time",                        width: 92 },
    { key: "city",        label: "City",                        width: 120 },
    { key: "destination", label: "Destination",                 width: 200 },
    { key: "from",        label: "From",                        width: 150 },
    { key: "to",          label: "To",                          width: 150 },
    { key: "transport",   label: "Transport",                   width: 200 },
    { key: "category",    label: "Category",                    width: 140 },
    { key: "notes",       label: "Notes",                       width: 200 },
    { key: "budgetLocal", label: `Budget · ${currency.code}`, width: 120, align: "right" },
  ];
  if (!isIDR) {
    cols.push({ key: "budgetIDR", label: "Budget · IDR", width: 130, align: "right" });
  }
  cols.push(
    { key: "links",   label: "Links", width: 240, align: "center", noPrint: true },
    { key: "actions", label: "",      width: 96,  align: "center", noPrint: true }
  );
  return cols;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ItineraryTable({
  rows,
  dayMap,
  region,
  onUpdate,
  onAdd,
  onDelete,
  onInsertAbove,
  onInsertBelow,
}) {
  const transportOptions = getTransportOptions(region);
  const currency         = getCurrency(region);
  const isIDR            = currency.code === "IDR";
  const COLUMNS          = buildColumns(currency);

  const sharedHandlers = {
    onUpdate,
    onDelete,
    onInsertAbove,
    onInsertBelow,
    region,
    transportOptions,
    currency,
    showIDR: !isIDR,
  };

  return (
    <section aria-label="Itinerary planner">
      <div className="no-print">
        <SectionHeading
          eyebrow="02 — Itinerary Planner"
          title="Day-by-day plan"
          aside={
            <span className="rounded-full bg-paper-dim px-2.5 py-1 text-[11px] font-medium text-ink-soft">
              {rows.length} {rows.length === 1 ? "stop" : "stops"}
            </span>
          }
        />
      </div>

      <div className="rounded-2xl border border-paper-line bg-white shadow-soft animate-fade-in">
        {/* Info strip */}
        <div className="no-print border-b border-paper-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            {isIDR ? (
              <>Budget is in IDR.</>
            ) : (
              <>
                Both <strong className="font-semibold text-ink">{currency.code}</strong> and{" "}
                <strong className="font-semibold text-ink">IDR</strong> are editable.
              </>
            )}
          </p>
        </div>

        {/* ── DESKTOP: horizontal table (hidden on mobile) ── */}
        <div className="hidden md:block">
          <div className="thin-scrollbar overflow-x-auto">
            <table className="sheet-table">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width }}
                      className={[
                        col.align === "right"  ? "text-right"  :
                        col.align === "center" ? "text-center" : "",
                        col.noPrint ? "no-print" : "",
                      ].join(" ")}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-6 py-14 text-center">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  renderRowsWithDayDividers(rows, dayMap, sharedHandlers, COLUMNS.length)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MOBILE: stacked cards (visible only on mobile) ── */}
        <div className="block md:hidden">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <EmptyState />
            </div>
          ) : (
            <MobileCardList
              rows={rows}
              dayMap={dayMap}
              handlers={sharedHandlers}
            />
          )}
        </div>

        {/* Add row button */}
        <button
          type="button"
          onClick={onAdd}
          className="no-print group flex w-full items-center justify-center gap-2 rounded-b-2xl border-t border-dashed border-paper-line py-3.5 text-xs font-medium text-ink-muted transition hover:bg-navy-50 hover:text-navy-500"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-paper-dim text-ink-soft transition group-hover:bg-navy-500 group-hover:text-white">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Add row
        </button>
      </div>
    </section>
  );
}

// ── Desktop table rendering ───────────────────────────────────────────────────

function renderRowsWithDayDividers(rows, dayMap, handlers, colCount) {
  const out = [];
  let currentDate = null;

  rows.forEach((row, idx) => {
    const date = (row.date || "").trim();
    if (date && date !== currentDate) {
      out.push(
        <DayDividerRow
          key={`divider-${date}-${idx}`}
          date={date}
          city={row.city}
          day={dayMap?.[date] ?? null}
          colCount={colCount}
        />
      );
      currentDate = date;
    } else if (!date) {
      currentDate = null;
    }
    out.push(
      <TableRow
        key={row.id}
        row={row}
        dayNumber={dayMap?.[date] ?? null}
        region={handlers.region}
        transportOptions={handlers.transportOptions}
        currency={handlers.currency}
        showIDR={handlers.showIDR}
        onUpdate={(field, value) => handlers.onUpdate(row.id, field, value)}
        onDelete={() => handlers.onDelete(row.id)}
        onInsertAbove={() => handlers.onInsertAbove(row.id)}
        onInsertBelow={() => handlers.onInsertBelow(row.id)}
      />
    );
  });
  return out;
}

function DayDividerRow({ date, city, day, colCount }) {
  const niceDate = (() => {
    try {
      return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
    } catch { return date; }
  })();
  return (
    <tr className="day-divider-row">
      <td colSpan={colCount} className="day-divider">
        <span className="day-divider-primary">DAY {day ?? "—"}{city ? ` — ${city}` : ""}</span>
        <span className="day-divider-secondary">{niceDate}</span>
      </td>
    </tr>
  );
}

function TableRow({
  row, dayNumber, region, transportOptions, currency, showIDR,
  onUpdate, onDelete, onInsertAbove, onInsertBelow,
}) {
  const mapUrl      = buildMapUrl(row.destination);
  const routeUrl    = buildRouteUrl(row.from, row.to);
  const catStyle    = CATEGORY_STYLES[row.category];
  const bookingLink = getBookingLink(row, region);
  const mismatch    = checkRegionMismatch(row, region);

  return (
    <tr>
      {/* Day */}
      <td className="text-center">
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md bg-navy-50 px-1.5 font-mono text-xs font-semibold tabular-nums text-navy-500">
          {dayNumber ?? "—"}
        </span>
      </td>
      {/* Date */}
      <td>
        <input type="date" value={row.date ?? ""} onChange={(e) => onUpdate("date", e.target.value)} className="cell-input tabular" aria-label="Date" />
      </td>
      {/* Time */}
      <td>
        <input type="time" value={row.time ?? ""} onChange={(e) => onUpdate("time", e.target.value)} className="cell-input tabular" aria-label="Time" />
      </td>
      {/* City */}
      <td>
        <input type="text" value={row.city ?? ""} onChange={(e) => onUpdate("city", e.target.value)} placeholder="—" className="cell-input" aria-label="City" />
      </td>
      {/* Destination + region warning */}
      <td>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={row.destination ?? ""}
            onChange={(e) => onUpdate("destination", e.target.value)}
            placeholder="Place name"
            className="cell-input font-medium"
            aria-label="Destination"
          />
          {mismatch.warn && (
            <span
              className="no-print flex-shrink-0 cursor-help text-amber-500"
              title={`⚠️ Location may not match region (${region}). Please verify on Google Maps.`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
          )}
        </div>
      </td>
      {/* From */}
      <td>
        <input type="text" value={row.from ?? ""} onChange={(e) => onUpdate("from", e.target.value)} placeholder="—" className="cell-input" aria-label="From" />
      </td>
      {/* To */}
      <td>
        <input type="text" value={row.to ?? ""} onChange={(e) => onUpdate("to", e.target.value)} placeholder="—" className="cell-input" aria-label="To" />
      </td>
      {/* Transport */}
      <td>
        <div className="flex items-center gap-1.5 px-1.5">
          <span className="flex-shrink-0 text-base leading-none">{transportIcon(row.transport)}</span>
          <select
            value={row.transport ?? ""}
            onChange={(e) => onUpdate("transport", e.target.value)}
            className="cell-input cursor-pointer appearance-none pr-6 font-medium"
            aria-label="Transport"
            style={{
              backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='none' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' d='M3 5l3 3 3-3'/></svg>\")",
              backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "10px",
            }}
          >
            <option value="">—</option>
            {transportOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </td>
      {/* Category */}
      <td>
        <select
          value={row.category ?? ""}
          onChange={(e) => onUpdate("category", e.target.value)}
          className="cell-input cursor-pointer appearance-none pr-6"
          aria-label="Category"
          style={{
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='none' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' d='M3 5l3 3 3-3'/></svg>\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "10px",
          }}
        >
          <option value="">—</option>
          {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{CATEGORY_ICONS[opt] ?? ""} {opt}</option>)}
        </select>
      </td>
      {/* Notes */}
      <td>
        <input type="text" value={row.notes ?? ""} onChange={(e) => onUpdate("notes", e.target.value)} placeholder="—" className="cell-input" aria-label="Notes" />
      </td>
      {/* Budget local */}
      <td className="text-right">
        <input type="number" min={0} value={row.budgetLocal ?? ""} onChange={(e) => onUpdate("budgetLocal", e.target.value === "" ? 0 : Number(e.target.value))} placeholder="0" className="cell-input tabular text-right" aria-label={`Budget in ${currency?.code}`} />
      </td>
      {/* Budget IDR */}
      {showIDR && (
        <td className="computed text-right">
          <input type="number" min={0} value={row.budgetIDR ?? ""} onChange={(e) => onUpdate("budgetIDR", e.target.value === "" ? 0 : Number(e.target.value))} placeholder="0" className="cell-input tabular text-right text-navy-500" aria-label="Budget in IDR" />
        </td>
      )}
      {/* Links */}
      <td className="no-print align-middle">
        <div className="flex flex-wrap items-center justify-center gap-1 px-1.5 py-1">
          <LinkPill href={mapUrl} label="📍 Map" title={mapUrl ? `Open in Maps` : "Add destination"} />
          <LinkPill href={routeUrl} label="🗺 Route" title={routeUrl ? `Open route` : "Add From and To"} />
          {bookingLink && <LinkPill variant="booking" href={bookingLink.href} label={bookingLink.label} title={bookingLink.label} />}
        </div>
      </td>
      {/* Actions */}
      <td className="no-print align-middle">
        <div className="flex items-center justify-center gap-0.5 px-1">
          <ActionBtn onClick={onInsertAbove} label="Insert above" icon={<svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>} />
          <ActionBtn onClick={onInsertBelow} label="Insert below" icon={<svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></svg>} />
          <ActionBtn onClick={onDelete} label="Delete row" icon={<svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>} />
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card list ──────────────────────────────────────────────────────────

function MobileCardList({ rows, dayMap, handlers }) {
  let currentDate = null;
  const items = [];

  rows.forEach((row, idx) => {
    const date = (row.date || "").trim();
    // Day header when date changes
    if (date && date !== currentDate) {
      const day = dayMap?.[date] ?? null;
      const city = row.city;
      const niceDate = (() => {
        try {
          return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", day: "numeric", month: "short",
          });
        } catch { return date; }
      })();
      items.push(
        <div key={`mb-divider-${date}-${idx}`} className="mx-4 mt-4 mb-2 flex items-center gap-3">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-bold text-white">
            {day ?? "—"}
          </span>
          <div>
            <p className="text-xs font-bold text-navy-500">{day ? `DAY ${day}` : "—"}{city ? ` — ${city}` : ""}</p>
            <p className="text-[10px] text-ink-muted">{niceDate}</p>
          </div>
        </div>
      );
      currentDate = date;
    } else if (!date) {
      currentDate = null;
    }

    items.push(
      <MobileCard
        key={row.id}
        row={row}
        dayNumber={dayMap?.[date] ?? null}
        handlers={handlers}
      />
    );
  });

  return <div className="divide-y divide-paper-line pb-2">{items}</div>;
}

function MobileCard({ row, dayNumber, handlers }) {
  const [expanded, setExpanded] = useState(false);
  const { region, transportOptions, currency, showIDR } = handlers;
  const onUpdate = (field, value) => handlers.onUpdate(row.id, field, value);

  const mapUrl      = buildMapUrl(row.destination);
  const routeUrl    = buildRouteUrl(row.from, row.to);
  const bookingLink = getBookingLink(row, region);
  const catStyle    = CATEGORY_STYLES[row.category];
  const catIcon     = CATEGORY_ICONS[row.category];

  return (
    <div className="px-4 py-3">
      {/* Card top — always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Category + Destination */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {row.category && catStyle && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: catStyle.bar + "18", color: catStyle.bar }}
              >
                {catIcon} {row.category}
              </span>
            )}
            {row.time && (
              <span className="font-mono text-[10px] text-ink-muted">{row.time}</span>
            )}
          </div>
          <input
            type="text"
            value={row.destination ?? ""}
            onChange={(e) => onUpdate("destination", e.target.value)}
            placeholder="Destination"
            className="w-full bg-transparent text-sm font-semibold text-ink placeholder:text-ink-muted/50 outline-none border-b border-transparent focus:border-paper-line pb-0.5"
          />
          {/* Transport + route */}
          {(row.transport || row.from || row.to) && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
              <span>{transportIcon(row.transport)}</span>
              {row.from && <span>{row.from}</span>}
              {row.from && row.to && <span>→</span>}
              {row.to && <span>{row.to}</span>}
            </p>
          )}
        </div>

        {/* Budget — right side */}
        <div className="text-right flex-shrink-0">
          <input
            type="number"
            min={0}
            value={row.budgetLocal ?? ""}
            onChange={(e) => onUpdate("budgetLocal", e.target.value === "" ? 0 : Number(e.target.value))}
            placeholder="0"
            className="w-24 bg-transparent text-right text-sm font-semibold text-ink tabular-nums outline-none border-b border-transparent focus:border-paper-line"
            aria-label="Budget"
          />
          <p className="text-[10px] text-ink-muted">{currency.code}</p>
          {showIDR && (row.budgetIDR ?? 0) > 0 && (
            <p className="text-[10px] tabular-nums text-navy-400">
              {formatIDR(row.budgetIDR)}
            </p>
          )}
        </div>
      </div>

      {/* Expand/collapse toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[10px] font-medium text-ink-muted hover:text-navy-500"
      >
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition ${expanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
        {expanded ? "Less" : "More details"}
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="mt-3 space-y-2.5 border-t border-paper-line/60 pt-3">
          {/* Editable fields */}
          <MobileField label="Date" type="date" value={row.date ?? ""} onChange={(v) => onUpdate("date", v)} />
          <MobileField label="Time" type="time" value={row.time ?? ""} onChange={(v) => onUpdate("time", v)} />
          <MobileField label="City" type="text" value={row.city ?? ""} onChange={(v) => onUpdate("city", v)} placeholder="City" />
          <MobileField label="From" type="text" value={row.from ?? ""} onChange={(v) => onUpdate("from", v)} placeholder="Departure point" />
          <MobileField label="To" type="text" value={row.to ?? ""} onChange={(v) => onUpdate("to", v)} placeholder="Arrival point" />

          {/* Transport dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Transport</label>
            <select
              value={row.transport ?? ""}
              onChange={(e) => onUpdate("transport", e.target.value)}
              className="mt-1 w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
            >
              <option value="">—</option>
              {transportOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Category dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Category</label>
            <select
              value={row.category ?? ""}
              onChange={(e) => onUpdate("category", e.target.value)}
              className="mt-1 w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
            >
              <option value="">—</option>
              {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{CATEGORY_ICONS[opt]} {opt}</option>)}
            </select>
          </div>

          {/* Notes */}
          <MobileField label="Notes" type="text" value={row.notes ?? ""} onChange={(v) => onUpdate("notes", v)} placeholder="Add a note…" />

          {/* IDR budget */}
          {showIDR && (
            <MobileField label="Budget · IDR" type="number" value={row.budgetIDR ?? ""} onChange={(v) => onUpdate("budgetIDR", v === "" ? 0 : Number(v))} placeholder="0" />
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-2 pt-1">
            <LinkPill href={mapUrl} label="📍 Map" title="Open in Google Maps" />
            <LinkPill href={routeUrl} label="🗺 Route" title="Open route" />
            {bookingLink && <LinkPill variant="booking" href={bookingLink.href} label={bookingLink.label} title={bookingLink.label} />}
          </div>

          {/* Row actions */}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={() => handlers.onInsertAbove(row.id)} className="flex items-center gap-1.5 rounded-lg border border-paper-line px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200 hover:text-navy-500">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
              Above
            </button>
            <button onClick={() => handlers.onInsertBelow(row.id)} className="flex items-center gap-1.5 rounded-lg border border-paper-line px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200 hover:text-navy-500">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></svg>
              Below
            </button>
            <button onClick={() => handlers.onDelete(row.id)} className="ml-auto flex items-center gap-1.5 rounded-lg border border-paper-line px-3 py-2 text-xs font-medium text-ink-muted hover:border-paper-dim hover:text-ink-soft">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileField({ label, type, value, onChange, placeholder, min }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
      />
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm text-ink-soft">
        No stops yet. Click <span className="font-semibold text-navy-500">+ Add row</span> below to start.
      </p>
      <p className="mt-2 text-xs text-ink-muted">
        Use the ↑ ↓ buttons on any row to insert above or below.
      </p>
    </div>
  );
}

function LinkPill({ href, label, title, variant = "default" }) {
  const base    = "rounded-md px-1.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap transition";
  const enabled = variant === "booking"
    ? "bg-navy-50 text-navy-500 hover:bg-navy-100"
    : "bg-paper-dim text-ink-soft hover:bg-navy-50 hover:text-navy-500";
  const disabled = "cursor-not-allowed bg-paper-dim/40 text-ink-muted/50";

  if (!href) return <span className={`${base} ${disabled}`} title={title}>{label}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={`${base} ${enabled}`}>
      {label}
    </a>
  );
}

function ActionBtn({ onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-6 w-6 place-items-center rounded text-ink-muted transition hover:bg-navy-50 hover:text-navy-500"
    >
      {icon}
    </button>
  );
}
