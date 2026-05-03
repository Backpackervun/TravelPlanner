"use client";

import RegionSelector from "./RegionSelector";

/**
 * SetupScreen — the first-run "intake" view shown before the planner.
 *
 * It collects the four trip-info fields (Client Name, Duration,
 * Destination, Travel Dates) and asks the user to pick a region.
 * The Start Planning button is gated on at least having a region
 * selected — without that, the planner can't apply region context.
 *
 * Once the user clicks Start Planning, the parent flips a flag and
 * this screen disappears for good (until the user clicks Reset).
 */
export default function SetupScreen({
  tripInfo,
  region,
  onTripInfoChange,
  onRegionChange,
  onStart,
}) {
  const canStart = !!region;

  const update = (field, value) => {
    onTripInfoChange({ ...tripInfo, [field]: value });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
          Setup
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Plan a new trip
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Fill in the basics, choose your region, then start planning. You can edit anything later.
        </p>
      </div>

      {/* Trip-info card */}
      <section className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-base font-semibold text-ink">Trip details</h2>
        <p className="mt-1 text-xs text-ink-muted">
          These show up at the top of every printed itinerary.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field
            label="Client Name"
            placeholder="e.g. Aiko Tanaka & Family"
            value={tripInfo.clientName}
            onChange={(v) => update("clientName", v)}
          />
          <Field
            label="Duration"
            placeholder="e.g. 8 Days 7 Nights"
            value={tripInfo.duration}
            onChange={(v) => update("duration", v)}
          />
          <Field
            label="Destination"
            placeholder="e.g. Osaka — Kyoto — Tokyo"
            value={tripInfo.destinations}
            onChange={(v) => update("destinations", v)}
          />
          <Field
            label="Travel Dates"
            placeholder="e.g. 5 Apr → 12 Apr 2025"
            value={tripInfo.travelDates}
            onChange={(v) => update("travelDates", v)}
          />
        </div>
      </section>

      {/* Region picker */}
      <section className="mt-6 rounded-2xl border border-paper-line bg-white p-6 shadow-soft sm:p-8">
        <RegionSelector
          value={region}
          onChange={onRegionChange}
          variant="grid"
        />
      </section>

      {/* Start button */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
            canStart
              ? "bg-navy-500 text-white shadow-[0_2px_12px_rgba(11,60,93,0.32)] hover:bg-navy-600 hover:shadow-[0_4px_18px_rgba(11,60,93,0.4)]"
              : "cursor-not-allowed bg-paper-dim text-ink-muted"
          }`}
        >
          Start Planning
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </button>
        {!canStart && (
          <p className="text-xs text-ink-muted">Pick a region to continue.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </span>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
      />
    </label>
  );
}
