"use client";

import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import RegionSelector from "./RegionSelector";

export default function Header({
  rate,
  onRateChange,
  onReset,
  onPrint,
  onHelp,
  totalLocal,
  totalIDR,
  mode,
  onModeChange,
  region,
  onRegionChange,
}) {
  const currency = getCurrency(region);
  const isIDRRegion = currency.code === "IDR";

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          {/* Left: brand */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Backpackervun"
              width="180"
              height="22"
              className="h-7 w-auto sm:h-8"
            />
            <span className="ml-3 hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
              Travel Planner
            </span>
          </div>

          {/* Right: controls + totals */}
          <div className="flex flex-wrap items-stretch gap-2.5">
            {/* Region pill */}
            {onRegionChange && (
              <RegionSelector
                variant="pill"
                value={region}
                onChange={onRegionChange}
              />
            )}

            {/* Totals card */}
            <div className="flex items-center gap-4 rounded-lg border border-paper-line bg-white px-4 py-2 shadow-soft">
              <div className="leading-tight">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Total · {currency.code}
                </div>
                <div className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {formatCurrency(totalLocal, currency)}
                </div>
              </div>
              {!isIDRRegion && (
                <>
                  <div className="h-8 w-px bg-paper-line" />
                  <div className="leading-tight">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy-400">
                      Total · IDR
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums text-navy-500">
                      {formatIDR(totalIDR)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Rate input — hidden when local IS IDR (no conversion needed) */}
            {!isIDRRegion && (
              <label className="no-print flex items-center gap-2 rounded-lg border border-paper-line bg-white px-3 py-2 shadow-soft">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  1 {currency.code} =
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-16 rounded border-none bg-transparent text-right font-mono text-sm font-semibold tabular-nums text-ink outline-none focus:bg-paper-dim"
                  aria-label={`${currency.code} to IDR conversion rate`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  IDR
                </span>
              </label>
            )}

            {/* Edit / Preview mode toggle */}
            {onModeChange && (
              <div
                className="no-print inline-flex items-stretch overflow-hidden rounded-lg border border-paper-line bg-white p-0.5 shadow-soft"
                role="tablist"
                aria-label="View mode"
              >
                <ModeButton
                  active={mode === "edit"}
                  onClick={() => onModeChange("edit")}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  }
                  label="Edit"
                />
                <ModeButton
                  active={mode === "preview"}
                  onClick={() => onModeChange("preview")}
                  icon={
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                  label="Preview"
                />
              </div>
            )}

            {/* Export to PDF — primary brand action (navy) */}
            <button
              type="button"
              onClick={onPrint}
              className="no-print inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 hover:shadow-[0_3px_12px_rgba(11,60,93,0.4)]"
              title="Open the browser print dialog · save as PDF"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              Export PDF
            </button>

            {/* Need Help — opens contact tab */}
            <button
              type="button"
              onClick={onHelp}
              className="no-print inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
              title="How to use & contact"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="no-print inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
              title="Clear everything and start over"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModeButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-navy-500 text-white shadow-[0_1px_3px_rgba(11,60,93,0.3)]"
          : "text-ink-soft hover:bg-paper-dim hover:text-navy-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
