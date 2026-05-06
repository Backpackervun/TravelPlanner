"use client";

import { useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import RegionSelector from "./RegionSelector";

export default function Header({
  rate,
  onRateChange,
  onReset,
  onPrint,
  onHelp,
  onSave,
  onLoadOpen,
  saveStatus,        // "idle" | "saving" | "saved" | "error"
  totalLocal,
  totalIDR,
  mode,
  onModeChange,
  region,
  onRegionChange,
}) {
  const { logout } = useAuth();
  const currency    = getCurrency(region);
  const isIDRRegion = currency.code === "IDR";
  const [open, setOpen] = useState(false);

  // Close dropdown when clicking outside
  const close = () => setOpen(false);

  const saveLabel = {
    idle:   "Save",
    saving: "Saving…",
    saved:  "Saved ✓",
    error:  "Save failed",
  }[saveStatus ?? "idle"];

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">

          {/* LEFT — brand */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Backpackervun"
              className="h-7 w-auto sm:h-8"
            />
            <span className="ml-3 hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
              Travel Planner
            </span>
          </div>

          {/* RIGHT — controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">

            {/* Region pill */}
            {onRegionChange && (
              <RegionSelector
                variant="pill"
                value={region}
                onChange={onRegionChange}
              />
            )}

            {/* Totals */}
            <div className="flex items-center gap-4 rounded-lg border border-paper-line bg-white px-4 py-2 shadow-soft">
              <div>
                <div className="text-[10px] text-ink-muted">Total · {currency.code}</div>
                <div className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {formatCurrency(totalLocal, currency)}
                </div>
              </div>
              {!isIDRRegion && (
                <>
                  <div className="h-6 w-px bg-paper-line" />
                  <div>
                    <div className="text-[10px] text-navy-400">Total · IDR</div>
                    <div className="font-mono text-sm font-semibold tabular-nums text-navy-500">
                      {formatIDR(totalIDR)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Rate */}
            {!isIDRRegion && (
              <div className="flex items-center gap-2 rounded-lg border border-paper-line bg-white px-3 py-2 shadow-soft">
                <span className="text-[10px] text-ink-muted">1 {currency.code} =</span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-16 text-right font-mono text-sm font-semibold text-ink outline-none bg-transparent"
                  aria-label={`${currency.code} to IDR rate`}
                />
                <span className="text-[10px] text-ink-muted">IDR</span>
              </div>
            )}

            {/* Quick Save button — visible separately for prominence */}
            <button
              onClick={onSave}
              disabled={saveStatus === "saving"}
              className={`no-print inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                saveStatus === "saved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : saveStatus === "error"
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-paper-line bg-white text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500"
              } disabled:opacity-60`}
              title="Save trip to cloud"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saveLabel}
            </button>

            {/* Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="no-print inline-flex items-center justify-center gap-2 rounded-lg bg-navy-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-navy-600"
                aria-haspopup="true"
                aria-expanded={open}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Menu
              </button>

              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={close} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-paper-line bg-white shadow-card">
                    <DropdownItem
                      icon="👁"
                      label="Preview"
                      onClick={() => { onModeChange?.("preview"); close(); }}
                    />
                    <DropdownItem
                      icon="🖨"
                      label="Export PDF"
                      onClick={() => { onPrint(); close(); }}
                    />
                    <DropdownItem
                      icon="📂"
                      label="Load trip"
                      onClick={() => { onLoadOpen(); close(); }}
                    />
                    <DropdownItem
                      icon="❓"
                      label="Help"
                      onClick={() => { onHelp(); close(); }}
                    />
                    <DropdownItem
                      icon="↺"
                      label="Reset"
                      onClick={() => { onReset(); close(); }}
                    />
                    <div className="my-1 border-t border-paper-line" />
                    <DropdownItem
                      icon="→"
                      label="Logout"
                      danger
                      onClick={() => { logout(); close(); }}
                    />
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

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-paper-dim ${
        danger ? "text-red-500 hover:bg-red-50" : "text-ink-soft"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </button>
  );
}
