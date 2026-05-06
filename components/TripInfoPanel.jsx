"use client";

import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { calcDuration } from "./SetupScreen";
import SectionHeading from "./SectionHeading";

/* Datepicker CSS — same as SetupScreen, inline to avoid globals.css dependency */
const PICKER_CSS = `
.react-datepicker-wrapper{width:100%}
.react-datepicker-popper{z-index:9999!important}
.react-datepicker{font-family:inherit;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 8px 24px rgba(11,60,93,0.12);overflow:hidden}
.react-datepicker__header{background:#EAF1F8;border-bottom:1px solid #E2E8F0;padding:12px 8px 6px}
.react-datepicker__current-month{font-weight:600;font-size:13px;color:#0B3C5D}
.react-datepicker__day-name{color:#6B7280;font-weight:500;font-size:11px;width:34px;line-height:34px}
.react-datepicker__day{width:34px;line-height:34px;border-radius:8px;font-size:13px;color:#111827;transition:all 120ms}
.react-datepicker__day:hover{background:#CFDDEB;color:#0B3C5D}
.react-datepicker__day--selected,.react-datepicker__day--range-start,.react-datepicker__day--range-end{background:#0B3C5D!important;color:#fff!important}
.react-datepicker__day--in-range{background:#EAF1F8;color:#0B3C5D}
.react-datepicker__day--in-selecting-range{background:#CFDDEB}
.react-datepicker__day--outside-month{color:#CBD5E1}
.react-datepicker__navigation-icon::before{border-color:#0B3C5D;border-width:2px 2px 0 0;height:8px;width:8px}
.react-datepicker__triangle{display:none}
`;

function formatRange(startISO, endISO) {
  if (!startISO) return "";
  try {
    const s        = new Date(startISO + "T00:00:00");
    const sameYear = endISO && new Date(endISO + "T00:00:00").getFullYear() === s.getFullYear();
    const ss       = format(s, sameYear ? "d MMM" : "d MMM yyyy");
    const es       = endISO ? format(new Date(endISO + "T00:00:00"), "d MMM yyyy") : "";
    return es ? `${ss} → ${es}` : `${ss} →`;
  } catch { return startISO; }
}

export default function TripInfoPanel({ tripInfo, onChange }) {
  const update = (field) => (e) => onChange({ ...tripInfo, [field]: e.target.value });

  const handleStartDate = (date) => {
    const iso    = date ? format(date, "yyyy-MM-dd") : "";
    const endIso = tripInfo.endDate ?? "";
    onChange({ ...tripInfo, startDate: iso, travelDates: formatRange(iso, endIso), duration: calcDuration(iso, endIso) });
  };

  const handleEndDate = (date) => {
    const iso      = date ? format(date, "yyyy-MM-dd") : "";
    const startIso = tripInfo.startDate ?? "";
    onChange({ ...tripInfo, endDate: iso, travelDates: formatRange(startIso, iso), duration: calcDuration(startIso, iso) });
  };

  const startDate = tripInfo.startDate ? new Date(tripInfo.startDate + "T00:00:00") : null;
  const endDate   = tripInfo.endDate   ? new Date(tripInfo.endDate   + "T00:00:00") : null;
  const hasDates  = !!(tripInfo.startDate || tripInfo.endDate);

  return (
    <section aria-label="Trip details" className="trip-info">
      <style>{PICKER_CSS}</style>

      <div className="no-print">
        <SectionHeading eyebrow="01 — Trip Details" title="Who and where" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-paper-line bg-white p-5 shadow-soft sm:p-7">
        <div aria-hidden="true" className="no-print pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent-400/[0.06]" />
        <div aria-hidden="true" className="no-print pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-accent-100/60" />

        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">Prepared for</p>
          <input
            type="text"
            value={tripInfo.clientName ?? ""}
            onChange={update("clientName")}
            placeholder="Client name"
            className="mt-1 w-full -ml-2 rounded-md border border-transparent bg-transparent px-2 py-1 text-3xl tracking-tight text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)] sm:text-4xl"
          />

          <div className="my-5 h-px w-full bg-paper-line" />

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Destinations */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Destinations</dt>
              <dd>
                <input type="text" value={tripInfo.destinations ?? ""} onChange={update("destinations")} placeholder="Osaka — Tokyo"
                  className="mt-1 -ml-2 w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
              </dd>
            </div>

            {/* Duration — read-only when dates are set */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Duration
                {hasDates && <span className="ml-1 text-[9px] text-ink-muted/60">(auto)</span>}
              </dt>
              <dd className="mt-1">
                {hasDates ? (
                  <div className="-ml-2 rounded-md border border-paper-line/40 bg-paper-dim px-2 py-1.5 text-base font-medium text-ink">
                    {tripInfo.duration || "—"}
                  </div>
                ) : (
                  <input type="text" value={tripInfo.duration ?? ""} onChange={update("duration")} placeholder="e.g. 8 Days 7 Nights"
                    className="mt-0 -ml-2 w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
                )}
              </dd>
            </div>

            {/* Start date */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Start Date</dt>
              <dd className="mt-1.5">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDate}
                  selectsStart startDate={startDate} endDate={endDate}
                  placeholderText="Pick start date"
                  dateFormat="d MMM yyyy"
                  isClearable
                  customInput={<DateInput />}
                />
              </dd>
            </div>

            {/* End date */}
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">End Date</dt>
              <dd className="mt-1.5">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDate}
                  selectsEnd startDate={startDate} endDate={endDate} minDate={startDate}
                  placeholderText="Pick end date"
                  dateFormat="d MMM yyyy"
                  isClearable
                  customInput={<DateInput />}
                />
              </dd>
            </div>
          </dl>

          {tripInfo.travelDates && (
            <p className="mt-3 text-xs text-ink-muted">📅 {tripInfo.travelDates}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line react/display-name
const DateInput = ({ value, onClick, placeholder }) => (
  <div className="relative">
    <input readOnly value={value} onClick={onClick} placeholder={placeholder}
      className="w-full cursor-pointer rounded-lg border border-paper-line bg-white px-3 py-2.5 pr-8 text-sm font-medium text-ink outline-none transition hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
    <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  </div>
);
