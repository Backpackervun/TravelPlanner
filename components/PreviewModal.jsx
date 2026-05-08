"use client";

import { useEffect } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — the ONLY preview system.
 *
 * Patch 1.3 fix: Action bar has class "no-print" so it is excluded from
 * the @media print CSS, ensuring only the white document is saved to PDF.
 */
export default function PreviewModal({
  open, onClose, tripInfo, rows, dayMap,
  region, rate, totalLocal, totalIDR,
  canExportPDF, onUpgradeNeeded,
}) {
  const { t } = useT();

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
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires a Lite or Pro plan.");
      return;
    }
    window.print();
  };

  return (
    <div
      className="preview-modal-overlay fixed inset-0 z-[500] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* ── Action bar — has "no-print" class so it's hidden in PDF ── */}
      <div className="no-print preview-action-bar relative z-10 flex-shrink-0 flex items-center justify-between gap-3 bg-[#0f172a]/95 border-b border-white/10 px-4 py-3 sm:px-6">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
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

        {/* ✅ Single Export PDF button — no duplicate Print button */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {t("exportPDF")}
        </button>
      </div>

      {/* ── Scrollable paper area ── */}
      <div
        className="preview-paper-area relative flex-1 overflow-y-auto py-8 px-3 sm:px-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* A4 paper — this is what prints */}
        <div
          className="preview-paper mx-auto max-w-[860px] rounded-2xl bg-white overflow-hidden"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)", minHeight: "1100px" }}
        >
          <PrintHeader totalLocal={totalLocal} totalIDR={totalIDR} region={region} />
          <PrintLayout
            tripInfo={tripInfo} rows={rows} dayMap={dayMap}
            region={region} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR}
          />
        </div>

        <p className="no-print preview-hint-text mt-4 pb-8 text-center text-xs text-white/25">
          {t("previewHint")}
        </p>
      </div>
    </div>
  );
}
