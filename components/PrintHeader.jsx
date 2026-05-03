"use client";

import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * Print-only header — sits at the very top of every printed PDF page region.
 *
 * Layout:
 *   LEFT   — Backpackervun wordmark logo (img, NOT background)
 *            "Travel Planner" tagline
 *   RIGHT  — Total · {currency code} / Total · IDR (omitted for IDR trips)
 *
 * Hidden on screen because its parent .print-layout has display: none on
 * screen (toggled to block when the user enters Preview mode or prints).
 */
export default function PrintHeader({ totalLocal, totalIDR, region }) {
  const currency = getCurrency(region);
  const showIDR = currency.code !== "IDR";

  return (
    <header className="print-header">
      <div className="ph-brand">
        <img
          src="/logo.png"
          alt="Backpackervun"
          className="ph-logo"
          width="200"
        />
        <p className="ph-tagline">Travel Planner</p>
      </div>

      <div className="ph-totals">
        <div className="ph-total">
          <span className="ph-total-label">Total · {currency.code}</span>
          <span className="ph-total-val">{formatCurrency(totalLocal, currency)}</span>
        </div>
        {showIDR && (
          <div className="ph-total">
            <span className="ph-total-label ph-total-label-accent">Total · IDR</span>
            <span className="ph-total-val ph-total-val-accent">{formatIDR(totalIDR)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
