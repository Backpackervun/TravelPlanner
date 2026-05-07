"use client";

import RegionSelector from "./RegionSelector";

/* =========================================================
   Duration helper
========================================================= */
export const calcDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end - start;

    if (diffTime < 0) return "";

    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(days - 1, 0);

    return `${days} Days ${nights} Nights`;
  } catch {
    return "";
  }
};

/* =========================================================
   Setup Screen
========================================================= */
export default function SetupScreen({
  tripInfo,
  region,
  onTripInfoChange,
  onRegionChange,
  onStart,
}) {
  const canStart = !!region;

  const update = (field, value) => {
    onTripInfoChange({
      ...tripInfo,
      [field]: value,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
          Setup
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Plan a new trip
        </h1>

        <p className="mt-3 text-sm text-ink-muted">
          Fill in the basics, choose your region, then start planning.
        </p>
      </div>

      {/* Trip Details */}
      <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-base font-semibold text-ink">
          Trip details
        </h2>

        <p className="mt-1 text-xs text-ink-muted">
          These show up at the top of every printed itinerary.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="Client Name"
            placeholder="e.g. Aiko Tanaka & Family"
            value={tripInfo.clientName || ""}
            onChange={(v) => update("clientName", v)}
          />

          <Field
            label="Duration"
            placeholder="e.g. 8 Days 7 Nights"
            value={tripInfo.duration || ""}
            onChange={(v) => update("duration", v)}
          />

          <Field
            label="Destination"
            placeholder="e.g. Osaka — Kyoto — Tokyo"
            value={tripInfo.destinations || ""}
            onChange={(v) => update("destinations", v)}
          />

          <Field
            label="Travel Dates"
            placeholder="e.g. 5 Apr → 12 Apr 2025"
            value={tripInfo.travelDates || ""}
            onChange={(v) => update("travelDates", v)}
          />
        </div>
      </section>

      {/* Region */}
      <section className="mt-6 rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <RegionSelector
          value={region}
          onChange={onRegionChange}
          variant="grid"
        />
      </section>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
            canStart
              ? "bg-navy-500 text-white hover:bg-navy-600"
              : "cursor-not-allowed bg-paper text-ink-muted"
          }`}
        >
          Start Planning →
        </button>

        {!canStart && (
          <p className="text-xs text-ink-muted">
            Pick a region to continue.
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Reusable Field
========================================================= */
function Field({
  label,
  placeholder,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent-300 focus:ring-4 focus:ring-accent-100"
      />
    </label>
  );
}