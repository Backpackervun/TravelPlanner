"use client";

import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * PrintHeader — white background header matching the Sydney Marathon PDF reference.
 *
 * Layout:
 *   Left: Backpackervun logo + "TRAVEL PLANNER" subtitle
 *   Right: TOTAL · {LOCAL} and TOTAL · IDR amounts
 */
export default function PrintHeader({ totalLocal, totalIDR, region }) {
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  return (
    <div className="print-header border-b-2 border-navy-100 bg-white px-8 py-5">
      <div className="flex items-center justify-between gap-4">

        {/* Left: brand */}
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="Backpackervun" className="h-8 w-auto flex-shrink-0" />
          <div className="border-l border-paper-line pl-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-muted leading-none">
              TRAVEL PLANNER
            </p>
          </div>
        </div>

        {/* Right: totals */}
        <div className="flex-shrink-0 text-right">
          {!isIDR && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
                TOTAL · {currency.code}
              </p>
              <p className="text-xl font-semibold text-ink leading-tight">
                {formatCurrency(totalLocal, currency)}
              </p>
            </div>
          )}
          <div className={!isIDR ? "mt-1" : ""}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-navy-400">
              TOTAL · IDR
            </p>
            <p className={`font-semibold text-navy-500 leading-tight ${isIDR ? "text-xl" : "text-base"}`}>
              {formatIDR(totalIDR)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
