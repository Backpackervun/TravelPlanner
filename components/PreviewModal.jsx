"use client";

import { useEffect, useState } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — patch-4items
 *
 * Changes:
 * 1. Mobile header: hide "PREVIEW" pill on mobile (saves ~80px), give buttons more room
 * 2. Export button label shorter on mobile ("PDF" only)
 * 3. Back button label shorter on mobile (← only)
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

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
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
        setError("Storage unavailable. Please disable Private Mode and try again.");
        setExporting(false);
        return;
      }

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

      {/* ── TOP BAR ──
          Mobile: [← Back]  [Export PDF]   — no center pill, saves space
          Desktop: [← Back to Edit]  [PREVIEW]  [Export PDF]
      */}
      <div className="relative z-10 flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-3 py-2.5 sm:px-6 sm:py-3">

        {/* Back */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
          </svg>
          {/* Desktop: full label. Mobile: icon only */}
          <span className="hidden sm:inline">{t("backToEdit")}</span>
        </button>

        {/* Center pill — hidden on mobile to save space */}
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
          {/* Desktop: "Export PDF". Mobile: "Export PDF" — both shown, fits since pill is hidden */}
          <span>{exporting ? "…" : t("exportPDF")}</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="relative z-10 flex flex-shrink-0 items-center justify-between gap-3 border-b border-red-800 bg-red-900/80 px-4 py-2.5 text-xs text-red-200">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Paper preview */}
      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-3 sm:p-6 preview-paper-area">
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
