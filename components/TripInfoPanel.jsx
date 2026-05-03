"use client";

import SectionHeading from "./SectionHeading";

/**
 * Trip Details panel — the headline of the dashboard.
 * - "Prepared for" line acts like a contract title.
 * - Three meta fields (duration / destinations / dates) sit below.
 *
 * On screen: editable inputs that reveal a navy focus ring.
 * On print: the same inputs render as flat text via .cell-input print rules,
 *           so the panel becomes a clean cover header for the itinerary PDF.
 */
export default function TripInfoPanel({ tripInfo, onChange }) {
  const update = (field) => (e) => onChange({ ...tripInfo, [field]: e.target.value });

  return (
    <section aria-label="Trip details" className="trip-info">
      <div className="no-print">
        <SectionHeading eyebrow="01 — Trip Details" title="Who and where" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-paper-line bg-white p-5 shadow-soft sm:p-7">
        {/* Decorative navy arc — quiet brand presence in the corner */}
        <div
          aria-hidden="true"
          className="no-print pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent-400/[0.06]"
        />
        <div
          aria-hidden="true"
          className="no-print pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-accent-100/60"
        />

        <div className="relative">
          {/* PREPARED FOR */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">
            Prepared for
          </p>
          <input
            type="text"
            value={tripInfo.clientName}
            onChange={update("clientName")}
            placeholder="Client name"
            aria-label="Client name"
            className="mt-1 w-full rounded-md border border-transparent bg-transparent px-2 py-1 -ml-2 text-3xl tracking-tight text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)] sm:text-4xl"
          />

          <div className="my-5 h-px w-full bg-paper-line" />

          {/* Three meta fields */}
          <dl className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Duration"
              value={tripInfo.duration}
              onChange={update("duration")}
              placeholder="e.g. 8 Days 7 Nights"
            />
            <Field
              label="Destinations"
              value={tripInfo.destinations}
              onChange={update("destinations")}
              placeholder="e.g. Osaka — Kyoto — Tokyo, or Seoul — Busan"
            />
            <Field
              label="Travel Dates"
              value={tripInfo.travelDates}
              onChange={update("travelDates")}
              placeholder="e.g. 5 Apr → 12 Apr 2025"
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </dt>
      <dd>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          className="mt-1 w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 -ml-2 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted/60 hover:border-paper-line focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
        />
      </dd>
    </div>
  );
}
