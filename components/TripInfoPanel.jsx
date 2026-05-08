"use client";

import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { useT } from "@/context/TranslationContext";

/**
 * TripInfoPanel — shows already-filled trip details in PLANNER view.
 *
 * This is NOT the setup form. It shows the data that was entered on the
 * setup screen, all fields are editable inline, but it's compact and
 * doesn't include the region selector (region is in the header).
 *
 * Fix: replaces the SetupScreen rendering in planner view.
 */
export default function TripInfoPanel({ tripInfo, onChange }) {
  const { t } = useT();

  const set = (field, value) => onChange?.({ ...tripInfo, [field]: value });

  // Auto-calculate duration when dates change
  const autoDuration = useMemo(() => {
    const { startDate, endDate } = tripInfo ?? {};
    if (!startDate || !endDate) return null;
    try {
      const nights = differenceInDays(new Date(endDate), new Date(startDate));
      if (nights < 0) return null;
      const days = nights + 1;
      return `${days} Day${days > 1 ? "s" : ""} ${nights} Night${nights > 1 ? "s" : ""}`;
    } catch { return null; }
  }, [tripInfo?.startDate, tripInfo?.endDate]);

  // Auto travel dates display
  const autoTravelDates = useMemo(() => {
    const { startDate, endDate } = tripInfo ?? {};
    if (!startDate || !endDate) return null;
    return `${startDate} – ${endDate}`;
  }, [tripInfo?.startDate, tripInfo?.endDate]);

  const handleStartDate = (v) => {
    const dur = computeDuration(v, tripInfo?.endDate);
    onChange?.({ ...tripInfo, startDate: v, duration: dur || tripInfo?.duration, travelDates: computeTravel(v, tripInfo?.endDate) });
  };

  const handleEndDate = (v) => {
    const dur = computeDuration(tripInfo?.startDate, v);
    onChange?.({ ...tripInfo, endDate: v, duration: dur || tripInfo?.duration, travelDates: computeTravel(tripInfo?.startDate, v) });
  };

  function computeDuration(s, e) {
    if (!s || !e) return "";
    try {
      const nights = differenceInDays(new Date(e), new Date(s));
      if (nights < 0) return "";
      const days = nights + 1;
      return `${days} Days ${nights} Night${nights > 1 ? "s" : ""}`;
    } catch { return ""; }
  }

  function computeTravel(s, e) {
    if (!s || !e) return "";
    return `${s} – ${e}`;
  }

  const displayDuration = autoDuration || tripInfo?.duration || "";
  const displayDates    = autoTravelDates || tripInfo?.travelDates || "";

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="border-b border-paper-line px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">01 — {t("tripDetailsSection")}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{t("tripDetailsSubtitle")}</p>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-paper-line/60">

        <TF label={t("clientName")}>
          <input
            type="text"
            value={tripInfo?.clientName ?? ""}
            onChange={(e) => set("clientName", e.target.value)}
            placeholder={t("clientNamePlaceholder")}
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-muted/50"
          />
        </TF>

        <TF label={t("destinations")}>
          <input
            type="text"
            value={tripInfo?.destinations ?? ""}
            onChange={(e) => set("destinations", e.target.value)}
            placeholder={t("destinationsPlaceholder")}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/50"
          />
        </TF>

        <TF label={t("startDate")}>
          <input
            type="date"
            value={tripInfo?.startDate ?? ""}
            onChange={(e) => handleStartDate(e.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
        </TF>

        <TF label={t("endDate")}>
          <input
            type="date"
            value={tripInfo?.endDate ?? ""}
            min={tripInfo?.startDate ?? ""}
            onChange={(e) => handleEndDate(e.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none"
          />
        </TF>

        <TF label={`${t("duration")} ${t("durationAuto")}`}>
          <p className="text-sm text-ink-soft truncate">
            {displayDuration || <span className="text-ink-muted/40">{t("durationPlaceholder")}</span>}
          </p>
        </TF>

        <TF label="Travel Dates">
          <p className="text-sm text-ink-soft truncate">
            {displayDates || <span className="text-ink-muted/40">—</span>}
          </p>
        </TF>

      </div>
    </div>
  );
}

function TF({ label, children }) {
  return (
    <div className="px-4 py-3 min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-ink-muted mb-1.5 truncate">{label}</p>
      {children}
    </div>
  );
}
