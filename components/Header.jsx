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

        <div className="flex items-center justify-between py-2">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-6" />
            <span className="hidden sm:block text-xs text-gray-400">
              Travel Planner
            </span>
          </div>

          {/* MOBILE */}
          <div className="flex sm:hidden items-center gap-2">
            <RegionSelector
              variant="pill"
              value={region}
              onChange={onRegionChange}
            />

            <button
              onClick={onPrint}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
            >
              PDF
            </button>
          </div>

          {/* DESKTOP */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">

            <RegionSelector
              variant="pill"
              value={region}
              onChange={onRegionChange}
            />

            <div className="flex items-center gap-3 border px-3 py-1 rounded">
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

            {!isIDRRegion && (
              <input
                type="number"
                value={rate}
                onChange={(e) => onRateChange(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-sm"
              />
            )}

            <button onClick={onPrint} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
              Export
            </button>

            <button onClick={onHelp} className="px-3 py-1 text-sm text-gray-500">
              Help
            </button>

            <button onClick={onReset} className="px-3 py-1 text-sm text-gray-500">
              Reset
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}