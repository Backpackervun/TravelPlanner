"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { differenceInDays, format } from "date-fns";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import RegionSelector from "./RegionSelector";

/**
 * SetupScreen v1.0
 *
 * - Fully translated (no hardcoded English)
 * - Language switcher visible top-right of the inner card
 * - All labels, placeholders, section headings use t()
 */
export default function SetupScreen({ tripInfo, region, onTripInfoChange, onRegionChange, onStart }) {
  const { t } = useT();
  const [startDate, setStartDate] = useState(
    tripInfo?.startDate ? new Date(tripInfo.startDate) : null
  );
  const [endDate, setEndDate] = useState(
    tripInfo?.endDate ? new Date(tripInfo.endDate) : null
  );

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "";
    const nights = differenceInDays(endDate, startDate);
    const days   = nights + 1;
    if (nights < 0) return "";
    if (nights === 0) return `1 Day`;
    return `${days} Day${days > 1 ? "s" : ""} ${nights} Night${nights > 1 ? "s" : ""}`;
  }, [startDate, endDate]);

  const handleDateChange = (type, date) => {
    if (type === "start") {
      setStartDate(date);
      onTripInfoChange?.({
        ...tripInfo,
        startDate: date ? format(date, "yyyy-MM-dd") : "",
        duration: computeDuration(date, endDate),
      });
    } else {
      setEndDate(date);
      onTripInfoChange?.({
        ...tripInfo,
        endDate: date ? format(date, "yyyy-MM-dd") : "",
        duration: computeDuration(startDate, date),
      });
    }
  };

  function computeDuration(s, e) {
    if (!s || !e) return "";
    const nights = differenceInDays(e, s);
    const days   = nights + 1;
    if (nights < 0) return "";
    if (nights === 0) return `1 Day`;
    return `${days} Days ${nights} Night${nights > 1 ? "s" : ""}`;
  }

  const canStart = !!region;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Page heading */}
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
        {/* Language switcher — top-right, not beside logo */}
        <div className="flex-shrink-0 pt-1">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Region selector ── */}
        <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft">
          <h2 className="text-sm font-semibold text-ink mb-1">{t("whereTrip")}</h2>
          <p className="text-xs text-ink-muted mb-4">{t("whereSubtitle")}</p>
          <RegionSelector variant="grid" value={region} onChange={onRegionChange} />
        </section>

        {/* ── Trip details ── */}
        <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-ink">{t("tripDetailsSection")}</h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t("tripDetailsSubtitle")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Client name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                {t("clientName")}
              </label>
              <input
                type="text"
                value={tripInfo?.clientName ?? ""}
                onChange={(e) => onTripInfoChange?.({ ...tripInfo, clientName: e.target.value })}
                placeholder={t("clientNamePlaceholder")}
                className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
              />
            </div>

            {/* Destinations */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                {t("destinations")}
              </label>
              <input
                type="text"
                value={tripInfo?.destinations ?? ""}
                onChange={(e) => onTripInfoChange?.({ ...tripInfo, destinations: e.target.value })}
                placeholder={t("destinationsPlaceholder")}
                className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
              />
            </div>

            {/* Start date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                {t("startDate")}
              </label>
              <div className="datepicker-wrap">
                <DatePicker
                  selected={startDate}
                  onChange={(d) => handleDateChange("start", d)}
                  placeholderText={t("pickStartDate")}
                  dateFormat="d MMM yyyy"
                  className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                {t("endDate")}
              </label>
              <div className="datepicker-wrap">
                <DatePicker
                  selected={endDate}
                  onChange={(d) => handleDateChange("end", d)}
                  placeholderText={t("pickEndDate")}
                  minDate={startDate}
                  dateFormat="d MMM yyyy"
                  className="w-full rounded-xl border border-paper-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>

            {/* Duration — auto */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                {t("duration")}{" "}
                <span className="font-normal normal-case text-ink-muted/60">{t("durationAuto")}</span>
              </label>
              <input
                type="text" readOnly
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
          className="w-full rounded-2xl bg-navy-500 py-4 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!canStart ? t("pickRegionFirst") : t("startPlanning")}
        </button>
      </div>
    </div>
  );
}
