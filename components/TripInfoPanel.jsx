"use client";

import SectionHeading from "./SectionHeading";

/**
 * Trip Details panel — the headline of the dashboard.
 *
 * Changes from previous version:
 *   • "Travel Dates" text input is replaced with two native <input type="date">
 *     pickers (Start Date + End Date). These format automatically into a
 *     human-readable "5 Apr → 12 Apr 2025" string stored in tripInfo.travelDates,
 *     keeping the print layout identical.
 *   • tripInfo gains two optional fields: startDate and endDate (ISO yyyy-mm-dd)
 *     that power the pickers. If a trip was saved without these (old format),
 *     the travelDates text is preserved and shown as a fallback.
 */
export default function TripInfoPanel({ tripInfo, onChange }) {
  const update = (field) => (e) => onChange({ ...tripInfo, [field]: e.target.value });

  // When either date picker changes, also recompute the formatted travelDates string.
  const handleDateChange = (field, value) => {
    const next = { ...tripInfo, [field]: value };
    const start = field === "startDate" ? value : (tripInfo.startDate ?? "");
    const end   = field === "endDate"   ? value : (tripInfo.endDate   ?? "");
    if (start && end) {
      next.travelDates = formatDateRange(start, end);
    } else if (start) {
      next.travelDates = formatSingleDate(start) + " →";
    } else if (end) {
      next.travelDates = "→ " + formatSingleDate(end);
    }
    onChange(next);
  };

  // Whether we have the new date picker data
  const hasDatePickers = !!(tripInfo.startDate || tripInfo.endDate);

  return (
    <section aria-label="Trip details" className="trip-info">
      <div className="no-print">
        <SectionHeading eyebrow="01 — Trip Details" title="Who and where" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-paper-line bg-white p-5 shadow-soft sm:p-7">
        {/* Decorative arc */}
        <div
          aria-hidden="true"
          className="no-print pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent-400/[0.06]"
        />
        <div
          aria-hidden="true"
          className="no-print pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-accent-100/60"
        />

        <div className="relative">
          {/* Client name — big headline input */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Prepared for
          </p>
          <input
            type="text"
            value={tripInfo.clientName ?? ""}
            onChange={update("clientName")}
            placeholder="Client name"
            aria-label="Client name"
            className="mt-1 w-full rounded-md border border-transparent bg-transparent px-2 py-1 -ml-2 text-3xl tracking-tight text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)] sm:text-4xl"
          />

          <div className="my-5 h-px w-full bg-paper-line" />

          {/* Meta fields */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Duration */}
            <Field
              label="Duration"
              value={tripInfo.duration ?? ""}
              onChange={update("duration")}
              placeholder="e.g. 8 Days 7 Nights"
            />

            {/* Destinations */}
            <Field
              label="Destinations"
              value={tripInfo.destinations ?? ""}
              onChange={update("destinations")}
              placeholder="e.g. Osaka — Kyoto — Tokyo"
            />

            {/* Start Date */}
            <DateField
              label="Start Date"
              value={tripInfo.startDate ?? ""}
              onChange={(v) => handleDateChange("startDate", v)}
              fallbackText={!hasDatePickers ? (tripInfo.travelDates ?? "") : ""}
            />

            {/* End Date — only show when start date is set */}
            <DateField
              label="End Date"
              value={tripInfo.endDate ?? ""}
              onChange={(v) => handleDateChange("endDate", v)}
              min={tripInfo.startDate ?? ""}
            />
          </div>

          {/* Formatted dates preview — only visible if dates are picked */}
          {hasDatePickers && tripInfo.travelDates && (
            <p className="mt-3 text-xs text-ink-muted">
              📅 {tripInfo.travelDates}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </dt>
      <dd>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          className="mt-1 w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 -ml-2 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
        />
      </dd>
    </div>
  );
}

/**
 * DateField — wraps a native <input type="date">.
 *
 * On iOS/Android, type="date" triggers the OS native calendar picker,
 * which is much more mobile-friendly than any JS library.
 * On desktop, it shows Chrome's/Firefox's built-in date selector.
 *
 * If `fallbackText` is provided (old trip format), show a read-only
 * preview of the original text so no data is lost.
 */
function DateField({ label, value, onChange, min, fallbackText }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1">
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full rounded-md border border-paper-line bg-white px-2.5 py-2 text-sm font-medium text-ink outline-none transition hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
        />
        {/* Backward compat: show old text value when no dates are set yet */}
        {!value && fallbackText && (
          <p className="mt-1 truncate text-xs text-ink-muted" title={fallbackText}>
            {fallbackText}
          </p>
        )}
      </dd>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format an ISO date (yyyy-mm-dd) as "5 Apr 2025" */
function formatSingleDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format a date range as "5 Apr → 12 Apr 2025" */
function formatDateRange(startISO, endISO) {
  if (!startISO || !endISO) return formatSingleDate(startISO || endISO);
  const start = new Date(startISO + "T00:00:00");
  const end   = new Date(endISO   + "T00:00:00");

  // If same year, omit year from start
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endStr = end.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} → ${endStr}`;
}
