"use client";

import { useState } from "react";

import { CORE_REGIONS, EXTRA_REGIONS, getRegion } from "@/lib/utils";

/**
 * RegionSelector — two display modes:
 *
 *   1. variant="grid"   — full card grid, used when no region is selected.
 *      Shows core regions prominently with an expandable "More" tray for
 *      extras (Australia, Indonesia, Malaysia, Vietnam).
 *
 *   2. variant="pill"   — compact single button showing the current region,
 *      opens a popover with the same grid for changing.
 *
 * Selecting a region calls onChange(regionId) and (in pill mode) closes
 * the popover.
 */
export default function RegionSelector({ value, onChange, variant = "grid" }) {
  if (variant === "pill") {
    return <PillSelector value={value} onChange={onChange} />;
  }
  return <GridSelector value={value} onChange={onChange} />;
}

// ============================================================
// Pill selector — compact inline control
// ============================================================

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
        <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          Region
        </span>
        <span className="text-ink">{region?.id ?? "Choose"}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
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
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(94vw,560px)] animate-fade-in rounded-xl border border-paper-line bg-white p-4 shadow-card">
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

// ============================================================
// Grid selector — the canonical card grid
// ============================================================

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
            Pick a region — it tweaks the transport options to match.
          </p>
        </div>
      )}

      <div
        className={`grid gap-2.5 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
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
          <span className="text-[10px] font-medium text-ink-muted">
            ({EXTRA_REGIONS.length})
          </span>
        </button>

        {showExtras && (
          <div
            className={`mt-2.5 grid animate-fade-in gap-2.5 ${
              compact
                ? "grid-cols-2 sm:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}
          >
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

// ============================================================
// Single region card
// ============================================================

function RegionCard({ region, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-center gap-3 rounded-lg border bg-white p-3 text-left min-h-[72px] transition ${
        active
          ? "border-navy-500 ring-2 ring-navy-200 shadow-[0_4px_12px_rgba(11,60,93,0.12)]"
          : "border-paper-line hover:border-navy-200 hover:bg-navy-50/50 hover:shadow-soft"
      }`}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-paper-dim text-2xl leading-none">
        {region.flag}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">
          {region.id}
        </span>
       {region.subtitle && (
  <span className="block text-[11px] text-ink-muted leading-tight line-clamp-2">
    {region.subtitle}
  </span>
)}
      {active && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 flex-shrink-0 text-navy-500"
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
