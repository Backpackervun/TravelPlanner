"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — THE ONLY preview system. Renders as a fullscreen overlay
 * with a scrollable A4-style paper document. No inline/bottom rendering.
 *
 * Action bar: Back to Edit | Export PDF (single button — opens print dialog)
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

  // Esc to close
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

  if (!open) return null;

  const handleExport = () => {
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires a Lite or Pro plan. Enter a redeem code to unlock.");
      return;
    }
    window.print();
  };

  return (
    <>
      {/* ── Fixed overlay — fullscreen, high z-index ── */}
      <div
        className="preview-modal-overlay fixed inset-0 z-[500] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Print preview"
      >
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-[#111827]/85 backdrop-blur-md" />

        {/* ── Top action bar ── */}
        <div className="relative z-10 flex-shrink-0 flex items-center justify-between gap-3 border-b border-white/10 bg-[#111827]/90 px-4 py-3 sm:px-6">
          {/* Back button */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
            </svg>
            <span className="hidden sm:inline">{t("backToEdit")}</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Preview label */}
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Preview
          </span>

          {/* Export PDF — single action */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-navy-600 shadow-lg transition hover:bg-white/90 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            {t("exportPDF")}
          </button>
        </div>

        {/* ── Scrollable paper area ── */}
        <div
          className="relative flex-1 overflow-y-auto py-8 px-4 sm:px-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/*
            A4 paper: 210mm wide at 96dpi ≈ 794px.
            White card centered on dark background.
            This is what prints when user clicks Export PDF.
          */}
          <div
            ref={paperRef}
            className="preview-paper mx-auto max-w-[860px] rounded-2xl bg-white shadow-[0_25px_60px_rgba(0,0,0,0.4)] ring-1 ring-white/10 overflow-hidden"
            style={{ minHeight: "1100px" }}
          >
            <PrintHeader totalLocal={totalLocal} totalIDR={totalIDR} region={region} />
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

          <p className="mt-5 text-center text-xs text-white/30 pb-6">
            Select "Save as PDF" in the browser print dialog for best results.
          </p>
        </div>
      </div>
    </>
  );
}
