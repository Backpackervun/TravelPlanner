"use client";

import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { useT } from "@/context/TranslationContext";

/**
 * TripInfoPanel — Patch PDF-v3
 *
 * Date format fix:
 * - computeTravel now returns "11 May 2026 – 15 May 2026" instead of "2026-05-11 – 2026-05-15"
 * - Duration display is unchanged
 * - travelDates stored in tripInfo is now the human-readable string
 */

/**
 * Format ISO date string to "11 May 2026"
 */
function formatDateDisplay(s) {
  if (!s) return "";
  try {
    const d = new Date(s + "T12:00:00");
    if (isNaN(d)) return s;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    // → "11 May 2026"
  } catch { return s; }
}

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

  const handleStartDate = (v) => {
    onChange?.({
      ...tripInfo,
      startDate: v,
      duration: computeDuration(v, tripInfo?.endDate) || tripInfo?.duration,
      // ✅ Store formatted travel dates
      travelDates: computeTravel(v, tripInfo?.endDate),
    });
  };

  const handleEndDate = (v) => {
    onChange?.({
      ...tripInfo,
      endDate: v,
      duration: computeDuration(tripInfo?.startDate, v) || tripInfo?.duration,
      // ✅ Store formatted travel dates
      travelDates: computeTravel(tripInfo?.startDate, v),
    });
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

  /**
   * ✅ Returns "11 May 2026 – 15 May 2026" (human-readable)
   */
  function computeTravel(s, e) {
    if (!s || !e) return "";
    return `${formatDateDisplay(s)} – ${formatDateDisplay(e)}`;
  }

  const displayDuration = autoDuration || tripInfo?.duration || "";

  // ✅ Always display dates in formatted form
  const displayTravelDates = useMemo(() => {
    if (tripInfo?.startDate && tripInfo?.endDate) {
      return `${formatDateDisplay(tripInfo.startDate)} – ${formatDateDisplay(tripInfo.endDate)}`;
    }
    // Fallback: try to format whatever is stored
    if (tripInfo?.travelDates) {
      const td = tripInfo.travelDates;
      // If already formatted (contains "May", "Jan", etc.) return as-is
      if (/[A-Za-z]{3}/.test(td)) return td;
      // If ISO range, format it
      const sep = td.includes("–") ? "–" : " - ";
      const parts = td.split(sep).map(x => x.trim());
      if (parts.length === 2) {
        return `${formatDateDisplay(parts[0])} – ${formatDateDisplay(parts[1])}`;
      }
      return formatDateDisplay(td) || td;
    }
    return "—";
  }, [tripInfo?.startDate, tripInfo?.endDate, tripInfo?.travelDates]);

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

        {/* ✅ Travel dates shown in readable format */}
        <TF label="Travel Dates">
          <p className="text-sm text-ink-soft" style={{ wordBreak: "break-word" }}>
            {displayTravelDates}
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
