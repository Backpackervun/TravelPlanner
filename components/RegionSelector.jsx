"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";

/*
 * RegionSelector — renders ONLY the region grid + "More regions" button.
 * All section headings (STEP 1, "Where are you planning…") are removed from
 * here; they are provided by the parent (SetupScreen or Header drawer).
 *
 * variant: "grid" | "pill"
 * "grid"  → 3-column cards (used in SetupScreen)
 * "pill"  → compact button (used in Header dropdown)
 */

const REGIONS = [
  { id: "Japan",        flag: "🇯🇵", cities: "Tokyo · Osaka · Kyoto"  },
  { id: "South Korea",  flag: "🇰🇷", cities: "Seoul · Busan · Jeju"   },
  { id: "Thailand",     flag: "🇹🇭", cities: "Bangkok · Chiang Mai · Phuket" },
  { id: "Singapore",    flag: "🇸🇬", cities: "City state"             },
  { id: "Malaysia",     flag: "🇲🇾", cities: "KL · Penang · Borneo"  },
  { id: "Europe",       flag: "🇪🇺", cities: "Trains, trams, FlixBus"  },
  // More regions
  { id: "Australia",    flag: "🇦🇺", cities: "Sydney · Melbourne · Bali" },
  { id: "Indonesia",    flag: "🇮🇩", cities: "Bali · Jakarta · Lombok" },
  { id: "Vietnam",      flag: "🇻🇳", cities: "Hanoi · Ho Chi Minh · Da Nang" },
  { id: "Saudi Arabia", flag: "🇸🇦", cities: "Riyadh · Jeddah · Makkah" },
  { id: "China",        flag: "🇨🇳", cities: "Beijing · Shanghai · Xi'an" },
  { id: "USA",          flag: "🇺🇸", cities: "New York · LA · Las Vegas" },
];

const DEFAULT_SHOWN = 6;

export default function RegionSelector({ variant = "grid", value, onChange }) {
  const { t } = useT();
  const [showAll, setShowAll] = useState(false);

  // ── PILL (compact, for Header dropdown) ──────────────────────────────────
  if (variant === "pill") {
    const current = REGIONS.find(r => r.id === value);
    return (
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.slice(0, DEFAULT_SHOWN).map(r => (
          <button
            key={r.id}
            onClick={() => onChange?.(r.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              value === r.id
                ? "border-navy-300 bg-navy-50 text-navy-600 font-semibold"
                : "border-paper-line bg-white text-ink-soft hover:border-navy-200"
            }`}
          >
            <span className="text-sm leading-none">{r.flag}</span>
            {r.id}
          </button>
        ))}
      </div>
    );
  }

  // ── GRID (full, for SetupScreen) ──────────────────────────────────────────
  const visible = showAll ? REGIONS : REGIONS.slice(0, DEFAULT_SHOWN);
  const remaining = REGIONS.length - DEFAULT_SHOWN;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {visible.map(r => (
          <button
            key={r.id}
            onClick={() => onChange?.(r.id)}
            className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition hover:shadow-soft ${
              value === r.id
                ? "border-navy-400 bg-navy-50 ring-2 ring-navy-400/30"
                : "border-paper-line bg-white hover:border-navy-200"
            }`}
          >
            <span className="text-2xl leading-none flex-shrink-0">{r.flag}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{r.id}</p>
              <p className="text-[11px] text-ink-muted truncate">{r.cities}</p>
            </div>
            {value === r.id && (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-navy-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {!showAll && remaining > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-navy-500 hover:underline underline-offset-2"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {t("moreRegions")} ({remaining})
        </button>
      )}
    </div>
  );
}
