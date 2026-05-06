"use client";

import DatePicker from "react-datepicker";
import { format, differenceInDays } from "date-fns";
import RegionSelector from "./RegionSelector";

/**
 * SetupScreen — first-run intake.
 *
 * Changes from previous version:
 *  • Travel Dates uses react-datepicker (Start Date + End Date)
 *  • Duration is AUTO-CALCULATED and READ-ONLY
 *  • No more manual typing for dates or duration
 */

/* Inline datepicker CSS — avoids needing globals.css changes */
const PICKER_CSS = `
.react-datepicker-wrapper{width:100%}
.react-datepicker-popper{z-index:9999!important}
.react-datepicker{font-family:inherit;border:1px solid #E2E8F0;border-radius:12px;
  box-shadow:0 8px 24px rgba(11,60,93,0.12);overflow:hidden}
.react-datepicker__header{background:#EAF1F8;border-bottom:1px solid #E2E8F0;padding:12px 8px 6px}
.react-datepicker__current-month{font-weight:600;font-size:13px;color:#0B3C5D}
.react-datepicker__day-name{color:#6B7280;font-weight:500;font-size:11px;width:34px;line-height:34px}
.react-datepicker__day{width:34px;line-height:34px;border-radius:8px;font-size:13px;color:#111827;transition:all 120ms}
.react-datepicker__day:hover{background:#CFDDEB;color:#0B3C5D}
.react-datepicker__day--selected,.react-datepicker__day--range-start,.react-datepicker__day--range-end
  {background:#0B3C5D!important;color:#fff!important}
.react-datepicker__day--in-range{background:#EAF1F8;color:#0B3C5D}
.react-datepicker__day--in-selecting-range{background:#CFDDEB}
.react-datepicker__day--outside-month{color:#CBD5E1}
.react-datepicker__navigation-icon::before{border-color:#0B3C5D;border-width:2px 2px 0 0;height:8px;width:8px}
.react-datepicker__triangle{display:none}
`;

// ── Duration helpers ──────────────────────────────────────────────────────────

/** Calculate duration string from two ISO date strings. */
export function calcDuration(startISO, endISO) {
  if (!startISO || !endISO) return "";
  try {
    const s    = new Date(startISO + "T00:00:00");
    const e    = new Date(endISO   + "T00:00:00");
    const days = differenceInDays(e, s) + 1; // inclusive
    if (days <= 0)  return "";
    if (days === 1) return "1 Day";
    return `${days} Days ${days - 1} Nights`;
  } catch { return ""; }
}

/** Format two ISO dates as "5 Apr → 12 Apr 2025". */
function formatRange(startISO, endISO) {
  if (!startISO) return "";
  try {
    const s         = new Date(startISO + "T00:00:00");
    const sameYear  = endISO && new Date(endISO + "T00:00:00").getFullYear() === s.getFullYear();
    const startStr  = format(s, sameYear ? "d MMM" : "d MMM yyyy");
    const endStr    = endISO ? format(new Date(endISO + "T00:00:00"), "d MMM yyyy") : "";
    return endStr ? `${startStr} → ${endStr}` : `${startStr} →`;
  } catch { return startISO; }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SetupScreen({ tripInfo, region, onTripInfoChange, onRegionChange, onStart }) {
  const canStart = !!region;

  const update = (field, value) => onTripInfoChange({ ...tripInfo, [field]: value });

  const handleStartDate = (date) => {
    const iso      = date ? format(date, "yyyy-MM-dd") : "";
    const endIso   = tripInfo.endDate ?? "";
    onTripInfoChange({
      ...tripInfo,
      startDate:   iso,
      travelDates: formatRange(iso, endIso),
      duration:    calcDuration(iso, endIso),
    });
  };

  const handleEndDate = (date) => {
    const iso      = date ? format(date, "yyyy-MM-dd") : "";
    const startIso = tripInfo.startDate ?? "";
    onTripInfoChange({
      ...tripInfo,
      endDate:     iso,
      travelDates: formatRange(startIso, iso),
      duration:    calcDuration(startIso, iso),
    });
  };

  const startDate = tripInfo.startDate ? new Date(tripInfo.startDate + "T00:00:00") : null;
  const endDate   = tripInfo.endDate   ? new Date(tripInfo.endDate   + "T00:00:00") : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <style>{PICKER_CSS}</style>

      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">Setup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Plan a new trip</h1>
        <p className="mt-3 text-sm text-ink-muted">Fill in the basics, choose your region, then start planning.</p>
      </div>

      {/* Trip details card */}
      <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-base font-semibold text-ink">Trip details</h2>
        <p className="mt-1 text-xs text-ink-muted">These appear at the top of every printed itinerary.</p>

        <div className="mt-6 space-y-4">
          {/* Client name */}
          <SetupField
            label="Client Name"
            placeholder="e.g. Aiko Tanaka & Family"
            value={tripInfo.clientName ?? ""}
            onChange={(v) => update("clientName", v)}
          />

          {/* Destinations */}
          <SetupField
            label="Destinations"
            placeholder="e.g. Osaka — Kyoto — Tokyo"
            value={tripInfo.destinations ?? ""}
            onChange={(v) => update("destinations", v)}
          />

          {/* Date range — side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={handleStartDate}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Pick start date"
                dateFormat="d MMM yyyy"
                isClearable
                customInput={<DateInput />}
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={handleEndDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Pick end date"
                dateFormat="d MMM yyyy"
                isClearable
                customInput={<DateInput />}
              />
            </div>
          </div>

          {/* Auto-computed duration (read-only) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">
              Duration <span className="normal-case text-[10px] text-ink-muted/70">(auto-calculated)</span>
            </label>
            <div className="w-full rounded-md border border-paper-line/60 bg-paper-dim px-3 py-2 text-sm font-medium text-ink">
              {tripInfo.duration || (
                <span className="text-ink-muted/60 font-normal">Select start and end dates above</span>
              )}
            </div>
            {tripInfo.travelDates && (
              <p className="mt-1.5 text-xs text-ink-muted">📅 {tripInfo.travelDates}</p>
            )}
          </div>
        </div>
      </section>

      {/* Region picker */}
      <section className="mt-6 rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <RegionSelector value={region} onChange={onRegionChange} variant="grid" />
      </section>

      {/* Start button */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className={`inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold transition ${
            canStart
              ? "bg-navy-500 text-white shadow-[0_2px_12px_rgba(11,60,93,0.32)] hover:bg-navy-600 hover:shadow-[0_4px_18px_rgba(11,60,93,0.4)]"
              : "cursor-not-allowed bg-paper-dim text-ink-muted"
          }`}
        >
          Start Planning
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
        {!canStart && <p className="text-xs text-ink-muted">Pick a region to continue.</p>}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SetupField({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
      />
    </div>
  );
}

// eslint-disable-next-line react/display-name
const DateInput = ({ value, onClick, placeholder }) => (
  <div className="relative">
    <input
      readOnly
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      className="w-full cursor-pointer rounded-md border border-paper-line bg-white px-3 py-2 pr-8 text-sm font-medium text-ink outline-none transition hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
    />
    <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  </div>
);
