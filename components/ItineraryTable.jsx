"use client";

import {
  buildMapUrl,
  buildRouteUrl,
  CATEGORY_ICONS,
  CATEGORY_OPTIONS,
  CATEGORY_STYLES,
  checkRegionMismatch,
  getBookingLink,
  getCurrency,
  getTransportOptions,
  transportIcon,
} from "@/lib/utils";
import SectionHeading from "./SectionHeading";

// ============================================
// Column definitions
// ============================================
//
// Columns vary based on the selected region's local currency:
//   - The "Budget" column header reads "Budget · JPY" (or KRW / SGD / …)
//   - The "Budget · IDR" column is hidden when local currency IS IDR
//     (Indonesia trips don't need a redundant second column).
//
// Column widths are tuned for readability at ~1400-1600px. The table also
// lives inside a horizontal scroller for narrow viewports.
function buildColumns(currency) {
  const isIDR = currency.code === "IDR";
  const cols = [
    { key: "day",         label: "Day",         width: 48,  align: "center" },
    { key: "date",        label: "Date",        width: 130 },
    { key: "time",        label: "Time",        width: 92 },
    { key: "city",        label: "City",        width: 120 },
    { key: "destination", label: "Destination", width: 200 },
    { key: "from",        label: "From",        width: 150 },
    { key: "to",          label: "To",          width: 150 },
    { key: "transport",   label: "Transport",   width: 200 },
    { key: "category",    label: "Category",    width: 140 },
    { key: "notes",       label: "Notes",       width: 200 },
    {
      key: "budgetLocal",
      label: `Budget · ${currency.code}`,
      width: 120,
      align: "right",
    },
  ];
  if (!isIDR) {
    cols.push({
      key: "budgetIDR",
      label: "Budget · IDR",
      width: 130,
      align: "right",
    });
  }
  cols.push(
    { key: "links",   label: "Links", width: 240, align: "center", noPrint: true },
    { key: "actions", label: "",      width: 96,  align: "center", noPrint: true }
  );
  return cols;
}

// ============================================
// Component
// ============================================
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
  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";
  const COLUMNS = buildColumns(currency);

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
        <div className="no-print border-b border-paper-line px-5 py-3">
          <p className="text-xs text-ink-muted">
            Click any cell to edit.
            {isIDR ? (
              <> Budget is in IDR. </>
            ) : (
              <>
                {" "}Both <strong className="font-semibold text-ink">{currency.code}</strong> and{" "}
                <strong className="font-semibold text-ink">IDR</strong> are editable — change one and
                the other recalculates from the rate.
              </>
            )}
          </p>
        </div>

        {/* Scroll wrapper */}
        <div className="thin-scrollbar overflow-x-auto">
          <table className="sheet-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width, minWidth: col.width }}
                    className={[
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "",
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
                    <div className="mx-auto max-w-md">
                      <p className="text-sm text-ink-soft">
                        No stops yet. Click{" "}
                        <span className="font-semibold text-navy-500">+ Add row</span>{" "}
                        below to start planning.
                      </p>
                      <p className="mt-2 text-xs text-ink-muted">
                        You can insert rows anywhere afterwards using the small ↑ / ↓ buttons on each row.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                renderRowsWithDayDividers(rows, dayMap, {
                  onUpdate,
                  onDelete,
                  onInsertAbove,
                  onInsertBelow,
                  region,
                  transportOptions,
                  currency,
                  showIDR: !isIDR,
                }, COLUMNS.length)
              )}
            </tbody>
          </table>
        </div>

        {/* Add row button */}
        <button
          type="button"
          onClick={onAdd}
          className="no-print group flex w-full items-center justify-center gap-2 rounded-b-2xl border-t border-dashed border-paper-line py-3 text-xs font-medium text-ink-muted transition hover:bg-navy-50 hover:text-navy-500"
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

// ============================================
// Day grouping with day-divider rows
// ============================================
//
// We walk through rows in document order. Whenever we hit a row whose
// date is different from the previous one, we emit a special "day-divider"
// <tr> ahead of it. This keeps the spreadsheet flowing while giving a
// strong visual cue between days.
//
// Day numbering is read from `dayMap` (date → day #) which is computed
// at the page level from the chronological order of unique dates. This
// makes the Day column fully derived — the user never edits it.
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
      <Row
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

// ============================================
// Day divider row — full-width banner inside the table
// ============================================
function DayDividerRow({ date, city, day, colCount }) {
  const dateObj = (() => {
    try {
      return new Date(date + "T00:00:00");
    } catch {
      return null;
    }
  })();
  const niceDate = dateObj
    ? dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : date;

  return (
    <tr className="day-divider-row">
      <td colSpan={colCount} className="day-divider">
        <span className="day-divider-primary">
          DAY {day ?? "—"}
          {city ? ` — ${city}` : ""}
        </span>
        <span className="day-divider-secondary">{niceDate}</span>
      </td>
    </tr>
  );
}

// ============================================
// Single row
// ============================================
function Row({
  row,
  dayNumber,
  region,
  transportOptions,
  currency,
  showIDR,
  onUpdate,
  onDelete,
  onInsertAbove,
  onInsertBelow,
}) {
  const mapUrl = buildMapUrl(row.destination);
  const routeUrl = buildRouteUrl(row.from, row.to);
  const catStyle = CATEGORY_STYLES[row.category];
  const bookingLink = getBookingLink(row, region);
  const mismatch = checkRegionMismatch(row, region);

  return (
    <tr>
      {/* Day — derived, read-only badge */}
      <td className="text-center">
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md bg-navy-50 px-1.5 font-mono text-xs font-semibold tabular-nums text-navy-500">
          {dayNumber ?? "—"}
        </span>
      </td>

      {/* Date */}
      <td>
        <input
          type="date"
          value={row.date ?? ""}
          onChange={(e) => onUpdate("date", e.target.value)}
          className="cell-input tabular"
          aria-label="Date"
        />
      </td>

      {/* Time */}
      <td>
        <input
          type="time"
          value={row.time ?? ""}
          onChange={(e) => onUpdate("time", e.target.value)}
          className="cell-input tabular"
          aria-label="Time"
        />
      </td>

      {/* City */}
      <td>
        <input
          type="text"
          value={row.city ?? ""}
          onChange={(e) => onUpdate("city", e.target.value)}
          placeholder="—"
          className="cell-input"
          aria-label="City"
        />
      </td>

      {/* Destination */}
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
              title={`⚠️ Location may not match selected region (${region}). This text looks like ${mismatch.suggested}. Please verify using Google Maps.`}
              aria-label={`Warning: location may not match ${region}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
          )}
        </div>
      </td>

      {/* From */}
      <td>
        <input
          type="text"
          value={row.from ?? ""}
          onChange={(e) => onUpdate("from", e.target.value)}
          placeholder="—"
          className="cell-input"
          aria-label="From"
        />
      </td>

      {/* To */}
      <td>
        <input
          type="text"
          value={row.to ?? ""}
          onChange={(e) => onUpdate("to", e.target.value)}
          placeholder="—"
          className="cell-input"
          aria-label="To"
        />
      </td>

      {/* Transport — icon + dropdown, no estimates */}
      <td>
        <div className="flex items-center gap-1.5 px-1.5">
          <span className="flex-shrink-0 text-base leading-none" aria-hidden="true">
            {transportIcon(row.transport)}
          </span>
          <select
            value={row.transport ?? ""}
            onChange={(e) => onUpdate("transport", e.target.value)}
            className="cell-input cursor-pointer appearance-none pr-6 font-medium"
            aria-label="Transport"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='none' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' d='M3 5l3 3 3-3'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
              backgroundSize: "10px",
            }}
          >
            <option value="">—</option>
            {transportOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Category — with emoji icon prefix */}
      <td>
        <select
          value={row.category ?? ""}
          onChange={(e) => onUpdate("category", e.target.value)}
          className="cell-input cursor-pointer appearance-none pr-6"
          aria-label="Category"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='none' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' d='M3 5l3 3 3-3'/></svg>\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 6px center",
            backgroundSize: "10px",
            color: catStyle ? "#1f2937" : undefined,
          }}
        >
          <option value="">—</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {CATEGORY_ICONS[opt] ?? ""} {opt}
            </option>
          ))}
        </select>
      </td>

      {/* Notes */}
      <td>
        <input
          type="text"
          value={row.notes ?? ""}
          onChange={(e) => onUpdate("notes", e.target.value)}
          placeholder="—"
          className="cell-input"
          aria-label="Notes"
        />
      </td>

      {/* Budget · local currency */}
      <td className="text-right">
        <input
          type="number"
          min={0}
          value={row.budgetLocal ?? ""}
          onChange={(e) =>
            onUpdate("budgetLocal", e.target.value === "" ? 0 : Number(e.target.value))
          }
          placeholder="0"
          className="cell-input tabular text-right"
          aria-label={`Budget in ${currency?.code ?? "local currency"}`}
        />
      </td>

      {/* Budget · IDR (hidden when local IS IDR) */}
      {showIDR && (
        <td className="computed text-right">
          <input
            type="number"
            min={0}
            value={row.budgetIDR ?? ""}
            onChange={(e) =>
              onUpdate("budgetIDR", e.target.value === "" ? 0 : Number(e.target.value))
            }
            placeholder="0"
            className="cell-input tabular text-right text-navy-500"
            aria-label="Budget in IDR"
          />
        </td>
      )}

      {/* Links: Map / Route / Booking (region-aware) */}
      <td className="no-print align-middle">
        <div className="flex flex-wrap items-center justify-center gap-1 px-1.5 py-1">
          <LinkPill
            href={mapUrl}
            label="📍 Map"
            title={mapUrl ? `Open ${row.destination} in Google Maps` : "Add a destination first"}
          />
          <LinkPill
            href={routeUrl}
            label="🗺 Route"
            title={routeUrl ? `Route ${row.from} → ${row.to}` : "Add From and To first"}
          />
          {bookingLink && (
            <LinkPill
              variant="booking"
              href={bookingLink.href}
              label={bookingLink.label}
              title={`${bookingLink.label} · ${row.from} → ${row.to}`}
            />
          )}
        </div>
      </td>

      {/* Row actions */}
      <td className="no-print align-middle">
        <div className="flex items-center justify-center gap-0.5 px-1">
          <button
            type="button"
            onClick={onInsertAbove}
            aria-label="Insert row above"
            title="Insert row above"
            className="grid h-6 w-6 place-items-center rounded text-ink-muted transition hover:bg-navy-50 hover:text-navy-500"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onInsertBelow}
            aria-label="Insert row below"
            title="Insert row below"
            className="grid h-6 w-6 place-items-center rounded text-ink-muted transition hover:bg-navy-50 hover:text-navy-500"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12l7 7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete row"
            title="Delete row"
            className="grid h-6 w-6 place-items-center rounded text-ink-muted transition hover:bg-paper-dim hover:text-navy-500"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================
// LinkPill — small action pill used for Map / Route / booking links
// ============================================
function LinkPill({ href, label, title, variant = "default" }) {
  const base =
    "rounded-md px-1.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap transition";
  const enabled =
    variant === "booking"
      ? "bg-navy-50 text-navy-500 hover:bg-navy-100"
      : "bg-paper-dim text-ink-soft hover:bg-navy-50 hover:text-navy-500";
  const disabled = "cursor-not-allowed bg-paper-dim/40 text-ink-muted/50";

  if (!href) {
    return (
      <span className={`${base} ${disabled}`} title={title} aria-disabled="true">
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      className={`${base} ${enabled}`}
    >
      {label}
    </a>
  );
}
