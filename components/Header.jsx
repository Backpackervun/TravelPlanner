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

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">

          {/* LEFT */}
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

          {/* RIGHT */}
          <div className="flex flex-wrap items-stretch gap-2.5">

            {/* REGION */}
            {onRegionChange && (
              <RegionSelector
                variant="pill"
                value={region}
                onChange={onRegionChange}
              />
            )}

            {/* TOTAL */}
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

            {/* RATE */}
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
                  className="w-16 rounded border-none bg-transparent text-right font-mono text-sm font-semibold tabular-nums text-ink outline-none"
                />
                <span className="text-[10px] text-ink-muted">IDR</span>
              </label>
            )}

            {/* MODE */}
            {onModeChange && (
              <div className="no-print inline-flex rounded-lg border bg-white p-0.5 shadow-soft">
                <ModeButton
                  active={mode === "edit"}
                  onClick={() => onModeChange("edit")}
                  label="Edit"
                />
                <ModeButton
                  active={mode === "preview"}
                  onClick={() => onModeChange("preview")}
                  label="Preview"
                />
              </div>
            )}

            {/* EXPORT */}
            <button
              onClick={onPrint}
              className="no-print inline-flex items-center rounded-lg bg-navy-500 px-3.5 py-2 text-xs font-semibold text-white"
            >
              Export PDF
            </button>

            {/* HELP */}
            <button
              onClick={onHelp}
              className="no-print px-3 py-2 text-xs text-ink-soft"
            >
              Help
            </button>

            {/* RESET */}
            <button
              onClick={onReset}
              className="no-print px-3 py-2 text-xs text-ink-soft"
            >
              Reset
            </button>

            {/* 🔥 LOGOUT */}
            <button
              onClick={handleLogout}
              className="no-print inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

function ModeButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
        active
          ? "bg-navy-500 text-white"
          : "text-ink-soft hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}