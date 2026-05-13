"use client";

import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * PrintHeader — visual fix
 *
 * Matches the PDF output exactly:
 * - Backpackervun logo + TRAVEL PLANNER tagline (left)
 * - TOTAL JPY + TOTAL IDR (right), stacked cleanly
 * - No overlap at any scale
 */
export default function PrintHeader({ tripInfo, region, totalLocal, totalIDR }) {
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  return (
    <div
      className="flex items-start justify-between border-b"
      style={{
        padding: "20px 32px 16px",
        borderColor: "#E8EDF3",
        fontFamily: "'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Brand ── */}
      <div style={{ flexShrink: 0, marginRight: "16px" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#0B3C5D", lineHeight: 1, letterSpacing: "-0.3px" }}>
          Backpackervun
        </div>
        <div style={{ fontSize: "9px", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: "3px" }}>
          Travel Planner
        </div>
      </div>

      {/* ── Totals ── */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {!isIDR && (
          <div style={{ marginBottom: "6px" }}>
            <div style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#94A3B8", lineHeight: 1 }}>
              TOTAL · {currency.code}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1E293B", lineHeight: 1.1, marginTop: "2px" }}>
              {formatCurrency(totalLocal, currency)}
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "#0B3C5D", lineHeight: 1 }}>
            TOTAL · IDR
          </div>
          <div style={{ fontSize: isIDR ? "18px" : "14px", fontWeight: 700, color: "#0B3C5D", lineHeight: 1.1, marginTop: "2px" }}>
            {formatIDR(totalIDR)}
          </div>
        </div>
      </div>
    </div>
  );
}
