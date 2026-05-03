"use client";

import { useState } from "react";
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

  const [open, setOpen] = useState(false);

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
              className="h-7 w-auto sm:h-8"
            />
            <span className="ml-3 hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
              Travel Planner
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">

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
              <div>
                <div className="text-[10px] text-ink-muted">
                  Total · {currency.code}
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(totalLocal, currency)}
                </div>
              </div>

              {!isIDRRegion && (
                <>
                  <div className="h-6 w-px bg-paper-line" />
                  <div>
                    <div className="text-[10px] text-navy-400">
                      Total · IDR
                    </div>
                    <div className="text-sm font-semibold text-navy-500">
                      {formatIDR(totalIDR)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RATE */}
            {!isIDRRegion && (
              <div className="flex items-center gap-2 border border-paper-line bg-white px-3 py-2 rounded-lg">
                <span className="text-[10px] text-ink-muted">
                  1 {currency.code} =
                </span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-16 text-right text-sm outline-none"
                />
                <span className="text-[10px] text-ink-muted">IDR</span>
              </div>
            )}

            {/* SETTINGS */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setOpen(!open)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-navy-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-navy-600"
              >
                ⚙ Settings
              </button>

              {open && (
                <div className="
                  absolute left-0 right-0 mt-2 
                  sm:left-auto sm:right-0 sm:w-52
                  w-full 
                  rounded-lg border border-paper-line 
                  bg-white shadow-xl z-50
                ">

                  <button
                    onClick={() => {
                      onModeChange?.("preview");
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => {
                      onPrint();
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    Export PDF
                  </button>

                  <button
                    onClick={() => {
                      onHelp();
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    Help
                  </button>

                  <button
                    onClick={() => {
                      onReset();
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    Reset
                  </button>

                  <div className="border-t my-1"></div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}