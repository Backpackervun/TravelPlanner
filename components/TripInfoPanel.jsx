"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { calcDuration } from "./SetupScreen";
import SectionHeading from "./SectionHeading";

function formatRange(startISO, endISO) {
  if (!startISO) return "";
  try {
    const s        = new Date(startISO + "T00:00:00");
    const e        = endISO ? new Date(endISO + "T00:00:00") : null;
    const sameYear = e && e.getFullYear() === s.getFullYear();
    const ss       = format(s, sameYear ? "d MMM" : "d MMM yyyy");
    const es       = e ? format(e, "d MMM yyyy") : "";
    return es ? `${ss} → ${es}` : `${ss} →`;
  } catch { return startISO; }
}

function DateInput({ value, onClick, placeholder }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg border border-paper-line bg-white px-2.5 py-2 text-sm text-left transition hover:border-navy-200 focus:border-accent-300 focus:outline-none"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span className={value ? "font-medium text-ink" : "text-ink-muted/60"}>
        {value || placeholder}
      </span>
    </button>
  );
}

export default function TripInfoPanel({ tripInfo, onChange }) {
  const update = (field) => (e) => onChange({ ...tripInfo, [field]: e.target.value });

  const handleStartDate = (date) => {
    const iso    = date ? format(date, "yyyy-MM-dd") : "";
    const endIso = tripInfo.endDate ?? "";
    onChange({
      ...tripInfo,
      startDate:   iso,
      travelDates: formatRange(iso, endIso),
      duration:    calcDuration(iso, endIso),
    });
  };

  const handleEndDate = (date) => {
    const iso      = date ? format(date, "yyyy-MM-dd") : "";
    const startIso = tripInfo.startDate ?? "";
    onChange({
      ...tripInfo,
      endDate:     iso,
      travelDates: formatRange(startIso, iso),
      duration:    calcDuration(startIso, iso),
    });
  };

  const startDate = tripInfo.startDate ? new Date(tripInfo.startDate + "T00:00:00") : null;
  const endDate   = tripInfo.endDate   ? new Date(tripInfo.endDate   + "T00:00:00") : null;
  const hasDates  = !!(tripInfo.startDate || tripInfo.endDate);

  return (
    <section aria-label="Trip details" className="trip-info">
      <div className="no-print">
        <SectionHeading eyebrow="01 — Trip Details" title="Who and where" />
      </div>

      {/* overflow-visible is critical — prevents calendar popup from being clipped */}
      <div
        className="relative rounded-2xl border border-paper-line bg-white p-5 shadow-soft sm:p-7"
        style={{ overflow: "visible" }}
      >
        <div aria-hidden="true" className="no-print pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent-400/[0.06]" />
        <div aria-hidden="true" className="no-print pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-accent-100/60" />

        <div className="relative" style={{ overflow: "visible" }}>
          {/* Client name */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">Prepared for</p>
          <input
            type="text"
            value={tripInfo.clientName ?? ""}
            onChange={update("clientName")}
            placeholder="Client name"
            className="mt-1 w-full -ml-2 rounded-md border border-transparent bg-transparent px-2 py-1 text-3xl tracking-tight text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)] sm:text-4xl"
          />

          <div className="my-5 h-px w-full bg-paper-line" />

          {/* Meta fields — overflow-visible for datepicker poppers */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ overflow: "visible" }}>

            {/* Destinations */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Destinations</dt>
              <dd>
                <input
                  type="text"
                  value={tripInfo.destinations ?? ""}
                  onChange={update("destinations")}
                  placeholder="Osaka — Tokyo"
                  className="mt-1 w-full -ml-2 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                />
              </dd>
            </div>

            {/* Duration — auto if dates set, manual otherwise */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Duration{hasDates && <span className="ml-1 text-[9px] text-ink-muted/60">(auto)</span>}
              </dt>
              <dd className="mt-1">
                {hasDates ? (
                  <div className="w-full rounded-md border border-paper-line/50 bg-paper-dim px-2 py-1.5 text-base font-medium text-ink min-h-[40px] flex items-center">
                    {tripInfo.duration || "—"}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={tripInfo.duration ?? ""}
                    onChange={update("duration")}
                    placeholder="e.g. 8 Days 7 Nights"
                    className="w-full -ml-2 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                  />
                )}
              </dd>
            </div>

            {/* Start Date */}
            <div style={{ overflow: "visible" }}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Start Date</dt>
              <dd className="mt-1.5" style={{ overflow: "visible" }}>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Pick date"
                  dateFormat="d MMM yyyy"
                  isClearable
                  popperPlacement="bottom-start"
                  customInput={<DateInput placeholder="Pick date" />}
                />
              </dd>
            </div>

            {/* End Date */}
            <div style={{ overflow: "visible" }}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">End Date</dt>
              <dd className="mt-1.5" style={{ overflow: "visible" }}>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="Pick date"
                  dateFormat="d MMM yyyy"
                  isClearable
                  popperPlacement="bottom-start"
                  customInput={<DateInput placeholder="Pick date" />}
                />
              </dd>
            </div>
          </div>

          {tripInfo.travelDates && (
            <p className="mt-3 text-xs text-ink-muted">📅 {tripInfo.travelDates}</p>
          )}
        </div>
      </div>
    </section>
  );
}
