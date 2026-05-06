"use client";

import { useState } from "react";
import { CORE_REGIONS, EXTRA_REGIONS, getRegion } from "@/lib/utils";

export default function RegionSelector({ value, onChange, variant = "grid" }) {
  if (variant === "pill") {
    return <PillSelector value={value} onChange={onChange} />;
  }
  return <GridSelector value={value} onChange={onChange} />;
}

// ── Pill selector ────────────────────────────────────────────────────────────

function PillSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const region = getRegion(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="no-print inline-flex items-center gap-2 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-semibold text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{region?.flag ?? "🌏"}</span>
        <span className="hidden text-[11px] uppercase tracking-[0.16em] text-ink-muted sm:inline">
          Region
        </span>
        <span className="text-ink">{region?.id ?? "Choose"}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 flex-shrink-0 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Full-screen backdrop — closes the popover */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/*
            Popover — MOBILE FIX:
            • `fixed` on mobile so it can't overflow its positioned ancestor
            • Full-width minus 16px gutter on mobile (left-4 right-4)
            • Reverts to absolute right-aligned on sm+
            • max-h + overflow-y-auto so long lists scroll instead of overflow
          */}
          <div
            className="
              fixed left-4 right-4 z-50 mt-2 
              sm:absolute sm:left-auto sm:right-0 sm:w-[min(560px,90vw)]
              top-auto
              max-h-[70vh] overflow-y-auto
              rounded-xl border border-paper-line bg-white p-4 shadow-card
              animate-fade-in
            "
            style={{ top: "var(--popover-top, auto)" }}
          >
            <GridSelector
              value={value}
              onChange={(id) => {
                onChange(id);
                setOpen(false);
              }}
              compact
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Grid selector ────────────────────────────────────────────────────────────

function GridSelector({ value, onChange, compact = false }) {
  const [showExtras, setShowExtras] = useState(false);

  return (
    <div>
      {!compact && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            Step 1
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">
            Where are you planning a trip?
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Pick a region — it tweaks the transport options and currency.
          </p>
        </div>
      )}

      <div
        className={`grid gap-2 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"
        }`}
      >
        {CORE_REGIONS.map((r) => (
          <RegionCard
            key={r.id}
            region={r}
            active={value === r.id}
            onClick={() => onChange(r.id)}
          />
        ))}
      </div>

      {/* Expandable extras */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowExtras((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition hover:text-navy-500"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3 w-3 transition ${showExtras ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
          {showExtras ? "Hide" : "More regions"}
          <span className="text-[10px] text-ink-muted">({EXTRA_REGIONS.length})</span>
        </button>

        {showExtras && (
          <div className={`mt-2.5 grid gap-2 animate-fade-in ${
            compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3"
          }`}>
            {EXTRA_REGIONS.map((r) => (
              <RegionCard
                key={r.id}
                region={r}
                active={value === r.id}
                onClick={() => onChange(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Region card ──────────────────────────────────────────────────────────────

function RegionCard({ region, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-center gap-2 rounded-lg border bg-white p-2.5 text-left transition sm:gap-3 sm:p-3 ${
        active
          ? "border-navy-500 ring-2 ring-navy-200 shadow-[0_4px_12px_rgba(11,60,93,0.12)]"
          : "border-paper-line hover:border-navy-200 hover:bg-navy-50/50 hover:shadow-soft"
      }`}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-paper-dim text-xl leading-none sm:h-9 sm:w-9 sm:text-2xl">
        {region.flag}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-ink sm:text-sm">{region.id}</span>
        {region.subtitle && (
          <span className="hidden truncate text-[10px] text-ink-muted sm:block">
            {region.subtitle}
          </span>
        )}
      </span>
      {active && (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 flex-shrink-0 text-navy-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </button>
  );
}
