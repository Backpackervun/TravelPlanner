"use client";

import { useMemo, useState } from "react";
import { differenceInDays } from "date-fns";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import RegionSelector from "./RegionSelector";

/**
 * SetupScreen v2 — fixes:
 * 1. Uses native <input type="date"> — no react-datepicker dependency on setup page
 *    This fixes the mobile scroll-list bug (iOS native date picker shows correctly)
 * 2. Fully translated — NO hardcoded English text
 * 3. Language switcher top-right
 * 4. "STEP 1" label translated/removed
 * 5. Trip details section after region selector
 */
export default function SetupScreen({
  tripInfo, region,
  onTripInfoChange, onRegionChange, onStart,
}) {
  const { t } = useT();

  // Compute auto duration when both dates present
  const duration = useMemo(() => {
    const { startDate, endDate } = tripInfo ?? {};
    if (!startDate || !endDate) return "";
    const nights = differenceInDays(new Date(endDate), new Date(startDate));
    if (nights < 0) return "";
    const days = nights + 1;
    if (nights === 0) return `1 Day`;
    return `${days} Days ${nights} Night${nights > 1 ? "s" : ""}`;
  }, [tripInfo?.startDate, tripInfo?.endDate]);

  const update = (field, value) => {
    onTripInfoChange?.({ ...(tripInfo ?? {}), [field]: value });
  };

  const handleStartDate = (v) => {
    const dur = computeDuration(v, tripInfo?.endDate);
    onTripInfoChange?.({ ...(tripInfo ?? {}), startDate: v, duration: dur });
  };

  const handleEndDate = (v) => {
    const dur = computeDuration(tripInfo?.startDate, v);
    onTripInfoChange?.({ ...(tripInfo ?? {}), endDate: v, duration: dur });
  };

  function computeDuration(start, end) {
    if (!start || !end) return "";
    const nights = differenceInDays(new Date(end), new Date(start));
    if (nights < 0) return "";
    const days = nights + 1;
    return `${days} Days ${nights} Night${nights > 1 ? "s" : ""}`;
  }

  const canStart = !!region;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* ── Page heading + language switcher ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            {t("setupStep")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
            {t("setupTitle")}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">{t("setupSubtitle")}</p>
        </div>
        {/* Language switcher — top-right only, NOT beside logo */}
        <div className="flex-shrink-0 pt-1">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Section 1: Region selector ── */}
        <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink">{t("whereTrip")}</h2>
          <p className="mt-0.5 text-xs text-ink-muted mb-5">{t("whereSubtitle")}</p>
          <RegionSelector variant="grid" value={region} onChange={onRegionChange} />
        </section>

        {/* ── Section 2: Trip details ── */}
        <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink">{t("tripDetailsSection")}</h2>
          <p className="mt-0.5 text-xs text-ink-muted mb-5">{t("tripDetailsSubtitle")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Client name */}
            <div className="sm:col-span-2">
              <Label>{t("clientName")}</Label>
              <Input
                value={tripInfo?.clientName ?? ""}
                onChange={(v) => update("clientName", v)}
                placeholder={t("clientNamePlaceholder")}
              />
            </div>

            {/* Destinations */}
            <div className="sm:col-span-2">
              <Label>{t("destinations")}</Label>
              <Input
                value={tripInfo?.destinations ?? ""}
                onChange={(v) => update("destinations", v)}
                placeholder={t("destinationsPlaceholder")}
              />
            </div>

            {/* Start date — native HTML5 date input (works on all platforms) */}
            <div>
              <Label>{t("startDate")}</Label>
              <input
                type="date"
                value={tripInfo?.startDate ?? ""}
                onChange={(e) => handleStartDate(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
              />
            </div>

            {/* End date — native HTML5 date input */}
            <div>
              <Label>{t("endDate")}</Label>
              <input
                type="date"
                value={tripInfo?.endDate ?? ""}
                min={tripInfo?.startDate ?? ""}
                onChange={(e) => handleEndDate(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
              />
            </div>

            {/* Duration — auto-calculated, read-only */}
            <div className="sm:col-span-2">
              <Label>
                {t("duration")}{" "}
                <span className="font-normal normal-case text-ink-muted/60">
                  {t("durationAuto")}
                </span>
              </Label>
              <input
                type="text"
                readOnly
                value={duration || tripInfo?.duration || ""}
                placeholder={t("durationPlaceholder")}
                className="w-full cursor-default rounded-xl border border-paper-line bg-paper-dim px-3.5 py-2.5 text-sm font-medium text-ink-soft outline-none placeholder:font-normal placeholder:text-ink-muted/40"
              />
            </div>
          </div>
        </section>

        {/* ── Start button ── */}
        <button
          onClick={onStart}
          disabled={!canStart}
          className="w-full rounded-2xl bg-navy-500 py-4 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-navy-300"
        >
          {!canStart ? t("pickRegionFirst") : t("startPlanning")}
        </button>

      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
    />
  );
}
