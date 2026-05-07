"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from "date-fns";
import { useT } from "@/context/TranslationContext";
import RegionSelector from "./RegionSelector";

// ── Duration helper ───────────────────────────────────────────────────────────
export function calcDuration(startISO, endISO) {
  if (!startISO || !endISO) return "";
  try {
    const days = differenceInDays(new Date(endISO + "T00:00:00"), new Date(startISO + "T00:00:00")) + 1;
    if (days <= 0) return "";
    if (days === 1) return "1 Day";
    return `${days} Days ${days - 1} Nights`;
  } catch { return ""; }
}

function formatRange(startISO, endISO) {
  if (!startISO) return "";
  try {
    const s = new Date(startISO + "T00:00:00");
    const e = endISO ? new Date(endISO + "T00:00:00") : null;
    const sy = e && e.getFullYear() === s.getFullYear();
    const ss = format(s, sy ? "d MMM" : "d MMM yyyy");
    const es = e ? format(e, "d MMM yyyy") : "";
    return es ? `${ss} → ${es}` : `${ss} →`;
  } catch { return startISO; }
}

function DateBtn({ value, onClick, placeholder }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm text-left transition hover:border-navy-200 focus:border-accent-300 focus:outline-none focus:shadow-[0_0_0_3px_rgba(74,144,226,0.15)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span className={value ? "font-medium text-ink" : "text-ink-muted/60"}>{value || placeholder}</span>
    </button>
  );
}

export default function SetupScreen({ tripInfo, region, onTripInfoChange, onRegionChange, onStart }) {
  const { t } = useT();
  const canStart = !!region;

  const upd = (f, v) => onTripInfoChange({ ...tripInfo, [f]: v });

  const handleStart = (date) => {
    const iso = date ? format(date, "yyyy-MM-dd") : "";
    const end = tripInfo.endDate ?? "";
    onTripInfoChange({ ...tripInfo, startDate: iso, travelDates: formatRange(iso, end), duration: calcDuration(iso, end) });
  };
  const handleEnd = (date) => {
    const iso = date ? format(date, "yyyy-MM-dd") : "";
    const start = tripInfo.startDate ?? "";
    onTripInfoChange({ ...tripInfo, endDate: iso, travelDates: formatRange(start, iso), duration: calcDuration(start, iso) });
  };

  const sd = tripInfo.startDate ? new Date(tripInfo.startDate + "T00:00:00") : null;
  const ed = tripInfo.endDate   ? new Date(tripInfo.endDate   + "T00:00:00") : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">Setup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t("setupTitle")}</h1>
        <p className="mt-3 text-sm text-ink-muted">{t("setupSubtitle")}</p>
      </div>

      {/* Trip details card — overflow:visible so datepicker popper isn't clipped */}
      <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8" style={{ overflow: "visible" }}>
        <h2 className="text-base font-semibold text-ink">{t("tripDetails")}</h2>
        <p className="mt-1 text-xs text-ink-muted">{t("tripDetailsSub")}</p>

        <div className="mt-6 space-y-4">
          <Field label={t("clientName")} placeholder={t("clientNamePlaceholder")} value={tripInfo.clientName ?? ""} onChange={v => upd("clientName", v)} />
          <Field label={t("destinations")} placeholder={t("destinationsPlaceholder")} value={tripInfo.destinations ?? ""} onChange={v => upd("destinations", v)} />

          <div className="grid gap-4 sm:grid-cols-2" style={{ overflow: "visible" }}>
            <div style={{ overflow: "visible" }}>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">{t("startDate")}</label>
              <DatePicker selected={sd} onChange={handleStart} selectsStart startDate={sd} endDate={ed}
                placeholderText={t("pickStartDate")} dateFormat="d MMM yyyy" isClearable
                popperPlacement="bottom-start"
                customInput={<DateBtn placeholder={t("pickStartDate")} />}
              />
            </div>
            <div style={{ overflow: "visible" }}>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">{t("endDate")}</label>
              <DatePicker selected={ed} onChange={handleEnd} selectsEnd startDate={sd} endDate={ed} minDate={sd}
                placeholderText={t("pickEndDate")} dateFormat="d MMM yyyy" isClearable
                popperPlacement="bottom-start"
                customInput={<DateBtn placeholder={t("pickEndDate")} />}
              />
            </div>
          </div>

          {/* Duration — auto-calculated read-only */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">
              {t("duration")} <span className="normal-case font-medium text-ink-muted/60">{t("durationAuto")}</span>
            </label>
            <div className="rounded-lg border border-paper-line/50 bg-paper-dim px-3 py-2.5 text-sm font-medium min-h-[42px] flex items-center">
              {tripInfo.duration
                ? <span className="text-ink">{tripInfo.duration}</span>
                : <span className="text-ink-muted/50">{t("durationPlaceholder")}</span>
              }
            </div>
            {tripInfo.travelDates && (
              <p className="mt-1.5 text-xs text-ink-muted">📅 {tripInfo.travelDates}</p>
            )}
          </div>
        </div>
      </section>

      {/* Region picker */}
      <section className="mt-6 rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8" style={{ overflow: "visible" }}>
        <RegionSelector value={region} onChange={onRegionChange} variant="grid" />
      </section>

      {/* Start button */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className={`inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition ${
            canStart
              ? "bg-navy-500 text-white shadow-[0_2px_12px_rgba(11,60,93,0.32)] hover:bg-navy-600 hover:shadow-[0_4px_18px_rgba(11,60,93,0.4)]"
              : "cursor-not-allowed bg-paper-dim text-ink-muted"
          }`}
        >
          {t("startPlanning")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
          </svg>
        </button>
        {!canStart && <p className="text-xs text-ink-muted">{t("pickRegionFirst")}</p>}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted mb-1.5">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
    </div>
  );
}
