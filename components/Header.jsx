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
    <header className="border-b border-gray-200 bg-white z-30">
      <div className="mx-auto max-w-[1600px] px-4">

        <div className="flex items-center justify-between py-3 gap-4 overflow-x-auto">

          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-max">
            <img src="/logo.png" className="h-7" />
            <span className="text-xs text-gray-400 hidden sm:block">
              Travel Planner
            </span>
          </div>

          {/* RIGHT (ALL CONTROLS) */}
          <div className="flex items-center gap-3 min-w-max">

            <RegionSelector
              variant="pill"
              value={region}
              onChange={onRegionChange}
            />

            {/* TOTAL */}
            <div className="flex items-center gap-3 border px-3 py-1 rounded bg-white">
              <div>
                <div className="text-[10px] text-gray-400">
                  {currency.code}
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(totalLocal, currency)}
                </div>
              </div>

              {!isIDRRegion && (
                <div>
                  <div className="text-[10px] text-blue-400">IDR</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {formatIDR(totalIDR)}
                  </div>
                </div>
              )}
            </div>

            {/* RATE */}
            {!isIDRRegion && (
              <input
                type="number"
                value={rate}
                onChange={(e) => onRateChange(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            )}

            {/* MODE */}
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => onModeChange("edit")}
                className={`px-3 py-1 text-xs ${
                  mode === "edit" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Edit
              </button>

              <button
                onClick={() => onModeChange("preview")}
                className={`px-3 py-1 text-xs ${
                  mode === "preview" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Preview
              </button>
            </div>

            {/* BUTTONS */}
            <button
              onClick={onPrint}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
            >
              Export
            </button>

            <button
              onClick={onHelp}
              className="text-sm text-gray-500"
            >
              Help
            </button>

            <button
              onClick={onReset}
              className="text-sm text-gray-500"
            >
              Reset
            </button>

          </div>
        </div>

      </div>
    </header>
  );
}