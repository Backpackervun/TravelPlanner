"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — mobile visual fix
 *
 * Key fix: the preview paper is 210mm (~794px) wide but renders on a ~390px
 * iPhone screen. Previously it just overflow-hid, making everything tiny.
 *
 * Solution: CSS transform scale() on mobile so the paper fills the screen
 * width while keeping all proportions intact. The paper looks like a
 * real A4 preview — just zoomed to fit.
 *
 * Scale = viewport_width / paper_width (794px)
 */
export default function PreviewModal({
  open,
  onClose,
  tripInfo,
  rows,
  dayMap,
  region,
  rate,
  totalLocal,
  totalIDR,
  canExportPDF,
  onUpgradeNeeded,
}) {
  const { t } = useT();
  const paperRef = useRef(null);
  const containerRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ── Mobile scale calculation ──────────────────────────────────────────────
  // Run on open and on resize
  useEffect(() => {
    if (!open) return;

    const PAPER_W = 794; // px equivalent of 210mm at 96dpi

    const calc = () => {
      const vw = window.innerWidth;
      if (vw >= 768) {
        // Desktop / tablet: no scale needed, paper fits naturally with padding
        setScale(1);
      } else {
        // Mobile: scale paper to fill viewport minus 24px horizontal padding
        const available = vw - 24;
        setScale(Math.min(1, available / PAPER_W));
      }
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [open]);

  if (!open) return null;

  const handleExport = () => {
    if (exporting) return;
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires a Lite or Pro plan.");
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const payload = JSON.stringify({
        tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR,
      });

      let saved = false;
      try { localStorage.setItem("bpv-pdf-render", payload); saved = true; } catch {}
      if (!saved) {
        try { sessionStorage.setItem("bpv-pdf-render", payload); saved = true; } catch {}
      }
      if (!saved) {
        setError("Storage unavailable. Please disable Private Mode.");
        setExporting(false);
        return;
      }

      // SYNC open — must be before any await for iOS Safari
      const newTab = window.open("/pdf-render", "_blank");
      if (!newTab) {
        window.location.href = "/pdf-render";
        return;
      }
      setTimeout(() => setExporting(false), 2000);
    } catch (err) {
      console.error("[PreviewModal]", err);
      setError("Export failed. Please try again.");
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col" role="dialog" aria-modal="true">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-3 py-2.5 sm:px-6 sm:py-3">

        {/* Back */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
          </svg>
          <span className="hidden sm:inline">{t("backToEdit")}</span>
        </button>

        {/* Title — hidden on mobile to save space */}
        <span className="hidden sm:block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
          {t("previewTitle")}
        </span>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          )}
          <span>{exporting ? "…" : t("exportPDF")}</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="relative z-10 flex-shrink-0 flex items-center justify-between gap-3 border-b border-red-800 bg-red-900/80 px-4 py-2.5 text-xs text-red-200">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/*
        ── PAPER AREA ──
        On desktop: standard scrollable container with padding
        On mobile: scale the paper to fit viewport width, then allow
        vertical scroll through the scaled content
      */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-auto bg-[#0f172a]"
        style={{
          // Extra padding at top/bottom for breathing room
          paddingTop: "16px",
          paddingBottom: "40px",
          paddingLeft: scale < 1 ? 0 : "16px",
          paddingRight: scale < 1 ? 0 : "16px",
        }}
      >
        {/*
          The paper wrapper:
          - On desktop: centered, max-w-[210mm], rounded corners
          - On mobile: transform scale() to fit width, origin top-left,
            then set explicit width/height so the container scrolls correctly
        */}
        <div
          style={
            scale < 1
              ? {
                  // Mobile: scale transform
                  transformOrigin: "top center",
                  transform: `scale(${scale})`,
                  // After scaling, the element still occupies its original
                  // layout space. We compensate by setting explicit dimensions
                  // so the scroll container knows the real height.
                  width: "794px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }
              : {
                  // Desktop: normal flow
                  maxWidth: "210mm",
                  margin: "0 auto",
                }
          }
        >
          <div
            ref={paperRef}
            className="preview-paper overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <PrintHeader
              tripInfo={tripInfo}
              region={region}
              totalLocal={totalLocal}
              totalIDR={totalIDR}
            />
            <PrintLayout
              tripInfo={tripInfo}
              rows={rows}
              dayMap={dayMap}
              region={region}
              rate={rate}
              totalLocal={totalLocal}
              totalIDR={totalIDR}
            />
          </div>
        </div>

        {/* Hint text */}
        <p className="mt-4 text-center text-xs text-white/25">
          {t("previewHint")}
        </p>
      </div>
    </div>
  );
}
