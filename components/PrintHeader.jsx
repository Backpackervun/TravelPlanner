"use client";

import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";

/**
 * PrintHeader — fix-v6
 * Navy blue background for brand identity, white text, clean layout.
 * Applies in both preview modal and /pdf-render page.
 */
export default function PrintHeader({ tripInfo, region, totalLocal, totalIDR }) {
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  return (
    <div
      style={{
        padding: "20px 32px 18px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "#0B3C5D",
        fontFamily: "'Montserrat','Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      }}
    >
      {/* ── Brand ── */}
      <div style={{ flexShrink: 0, marginRight: "16px" }}>
        <div style={{
          fontSize: "20px", fontWeight: 700, color: "white",
          lineHeight: 1, letterSpacing: "-0.3px",
        }}>
          Backpackervun
        </div>
        <div style={{
          fontSize: "9px", fontWeight: 600,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.24em", textTransform: "uppercase", marginTop: "4px",
        }}>
          Travel Planner
        </div>
      </div>

      {/* ── Totals ── */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {!isIDR && (
          <div style={{ marginBottom: "8px" }}>
            <div style={{
              fontSize: "9px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.55)", lineHeight: 1,
            }}>
              TOTAL · {currency.code}
            </div>
            <div style={{
              fontSize: "18px", fontWeight: 700,
              color: "white", lineHeight: 1.1, marginTop: "2px",
            }}>
              {formatCurrency(totalLocal, currency)}
            </div>
          </div>
        )}
        <div>
          <div style={{
            fontSize: "9px", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.55)", lineHeight: 1,
          }}>
            TOTAL · IDR
          </div>
          <div style={{
            fontSize: isIDR ? "18px" : "14px", fontWeight: 700,
            color: "rgba(255,255,255,0.95)", lineHeight: 1.1, marginTop: "2px",
          }}>
            {formatIDR(totalIDR)}
          </div>
        </div>
      </div>
    </div>
  );
}
