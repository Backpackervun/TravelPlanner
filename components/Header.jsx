"use client";

import { useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import RegionSelector from "./RegionSelector";

export default function Header({
  rate, onRateChange, onReset, onPrint, onHelp,
  onSave, onLoadOpen, saveStatus, hasUnsavedChanges,
  totalLocal, totalIDR, mode, onModeChange,
  region, onRegionChange, rateSource,
}) {
  const { logout }  = useAuth();
  const currency    = getCurrency(region);
  const isIDR       = currency.code === "IDR";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const saveBtnClass =
    saveStatus === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
    saveStatus === "error" ? "border-red-200 bg-red-50 text-red-600" :
    "border-paper-line bg-white text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500";

  const saveLabel =
    saveStatus === "saving" ? "Saving…" :
    saveStatus === "saved"  ? "Saved ✓" :
    saveStatus === "error"  ? "Retry"   : "Save";

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
            <span className="hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
              Travel Planner
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Region selector */}
            {onRegionChange && <RegionSelector variant="pill" value={region} onChange={onRegionChange} />}

            {/* Totals card */}
            <div className="flex items-center gap-3 rounded-lg border border-paper-line bg-white px-3 py-2 shadow-soft">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Total · {currency.code}</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-ink">{formatCurrency(totalLocal, currency)}</p>
              </div>
              {!isIDR && (
                <>
                  <div className="h-5 w-px bg-paper-line" />
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-navy-400">Total · IDR</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-navy-500">{formatIDR(totalIDR)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Rate input with live badge */}
            {!isIDR && (
              <div className="flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 shadow-soft">
                <span className="text-[9px] text-ink-muted">1 {currency.code} =</span>
                <input
                  type="number" value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-14 bg-transparent text-right font-mono text-sm font-semibold text-ink outline-none"
                />
                <span className="text-[9px] text-ink-muted">IDR</span>
                {rateSource === "live" && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700" title="Live rate">LIVE</span>
                )}
                {rateSource === "fallback" && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700" title="Approximate fallback rate">~</span>
                )}
              </div>
            )}

            {/* Save button + unsaved dot */}
            <div className="relative">
              <button
                onClick={onSave}
                disabled={saveStatus === "saving"}
                className={`no-print inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 ${saveBtnClass}`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {saveLabel}
              </button>
              {hasUnsavedChanges && saveStatus === "idle" && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" title="Unsaved changes" />
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setOpen(v => !v)}
                className="no-print inline-flex items-center gap-2 rounded-lg bg-navy-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-navy-600"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                Menu
              </button>

              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={close} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-paper-line bg-white shadow-card">
                    {mode === "preview"
                      ? <DItem icon="✏️" label="Back to Edit" onClick={() => { onModeChange("edit"); close(); }} />
                      : <DItem icon="👁"  label="Preview"     onClick={() => { onModeChange("preview"); close(); }} />
                    }
                    <DItem icon="🖨"  label="Export PDF"  onClick={() => { onPrint(); close(); }} />
                    <DItem icon="📂"  label="Load trip"   onClick={() => { onLoadOpen(); close(); }} />
                    <DItem icon="❓"  label="Help"        onClick={() => { onHelp(); close(); }} />
                    <DItem icon="↺"   label="Reset"       onClick={() => { onReset(); close(); }} />
                    <div className="my-1 border-t border-paper-line" />
                    <DItem icon="→" label="Logout" danger onClick={() => { logout(); close(); }} />
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

function DItem({ icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-paper-dim ${danger ? "text-red-500 hover:bg-red-50" : "text-ink-soft"}`}>
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}
