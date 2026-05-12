"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — Patch PDF-v2
 *
 * Preview: renders React components in-modal (unchanged design)
 * Export:  saves data to localStorage → opens /pdf-render in new tab
 *          → browser-native PDF with clickable links on ALL pages
 *
 * iOS Safari: window.open() is called SYNCHRONOUSLY before any async work
 * to bypass Safari popup blocker. Data is written to localStorage BEFORE
 * the window opens, so the tab can read it immediately.
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
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

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
    const p = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = p; };
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
      // ── 1. Write data to localStorage BEFORE opening the window ──
      //    (must be synchronous — localStorage.setItem is sync)
      const payload = JSON.stringify({ tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR });
      localStorage.setItem("bpv-pdf-render", payload);

      // ── 2. Open /pdf-render in a new tab SYNCHRONOUSLY ──
      //    This is inside the click handler (user gesture) so iOS Safari
      //    will NOT block it, even though we haven't done any async work.
      const newTab = window.open("/pdf-render", "_blank");

      if (!newTab) {
        // Popup was blocked — navigate current tab instead
        window.location.href = "/pdf-render";
        return;
      }

      // Reset exporting after a delay (the new tab handles everything)
      setTimeout(() => setExporting(false), 2000);

    } catch (err) {
      console.error("[PreviewModal] Export error:", err);
      setError("Export failed. Please try again.");
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col" role="dialog" aria-modal="true">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* Top bar */}
      <div className="relative z-10 flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
          </svg>
          <span className="hidden sm:inline">{t("backToEdit")}</span>
          <span className="sm:hidden">{t("back")}</span>
        </button>

        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
          {t("previewTitle")}
        </span>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Opening…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {t("exportPDF")}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-red-800 bg-red-900/80 px-4 py-2.5 text-xs text-red-200 flex-shrink-0">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Preview paper */}
      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-4 sm:p-6">
        <div className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl bg-white shadow-2xl">
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

        <p className="mt-4 pb-6 text-center text-xs text-white/25">
          {t("previewHint")}
        </p>
      </div>
    </div>
  );
}
