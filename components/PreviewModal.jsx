"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — fullscreen centered preview of the PDF document.
 *
 * Renders as a fixed overlay with a dark backdrop.
 * The A4 paper is centered and scrollable.
 * Top action bar: Back to Edit | Print | Export PDF.
 *
 * This replaces the old inline/bottom-of-page preview approach.
 */
export default function PreviewModal({
  open,
  onClose,
  onPrint,
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
  const scrollRef = useRef(null);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Lock body scroll behind modal
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleExport = () => {
    if (!canExportPDF) { onUpgradeNeeded?.("PDF export requires a Lite or Pro plan."); return; }
    onPrint?.();
  };

  return (
    <div className="no-print fixed inset-0 z-[200] flex flex-col" role="dialog" aria-modal="true" aria-label="Print preview">

      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-[#1a1a2e]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Top action bar ── */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#1a1a2e]/95 px-4 py-3 sm:px-6">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
          </svg>
          {t("backToEdit")}
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:inline">
            Preview
          </span>

          {/* Print button */}
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>
            </svg>
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Export PDF button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-navy-500 shadow transition hover:bg-white/90 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            {t("exportPDF")}
          </button>
        </div>
      </div>

      {/* ── Paper area — scrollable ── */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-8 sm:px-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/*
          A4 paper centered, white on dark background.
          max-w-[794px] = 210mm at 96dpi (standard A4 width in px)
        */}
        <div
          className="mx-auto max-w-[794px] rounded-lg bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden"
          style={{ minHeight: "1123px" }} // A4 height at 96dpi
          onClick={(e) => e.stopPropagation()}
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
        <p className="mt-4 text-center text-xs text-white/40">
          Use browser Print (Ctrl+P / ⌘+P) and select "Save as PDF" for best results.
        </p>
      </div>
    </div>
  );
}
