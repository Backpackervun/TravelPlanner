"use client";

import { useEffect, useState } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — plan-gate-v2
 *
 * canExportPDF prop MUST come from getPlanFeatures(plan).canExportPDF
 * in the parent (dashboard page). Pass onUpgradeNeeded to show the UpgradeModal.
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
  canExportPDF,       // boolean — derived from plan features
  onUpgradeNeeded,    // (reason: string) => void
}) {
  const { t } = useT();
  const [exporting, setExporting] = useState(false);
  const [error,     setError]     = useState(null);
  const [isMobile,  setIsMobile]  = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

    // ✅ Gate: only PRO can export PDF
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires a Pro plan.");
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const payload = JSON.stringify({
        tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR,
      });

      let saved = false;
      try   { localStorage.setItem("bpv-pdf-render", payload);   saved = true; } catch {}
      if (!saved) {
        try { sessionStorage.setItem("bpv-pdf-render", payload); saved = true; } catch {}
      }
      if (!saved) {
        setError("Storage unavailable. Disable Private Mode.");
        setExporting(false);
        return;
      }

      const newTab = window.open("/pdf-render", "_blank");
      if (!newTab) { window.location.href = "/pdf-render"; return; }
      setTimeout(() => setExporting(false), 2000);
    } catch {
      setError("Export failed. Please try again.");
      setExporting(false);
    }
  };

  // ── Shared top bar ─────────────────────────────────────────────────────────

  const TopBar = () => (
    <div
      className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-6"
      style={{ background: "#0B3C5D", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Back */}
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.97]"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
        </svg>
        <span className="hidden sm:inline">{t("backToEdit")}</span>
      </button>

      {/* Label */}
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
        {t("previewTitle")}
      </span>

      {/* Export button — always visible, shows lock when not PRO */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-md transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
          canExportPDF
            ? "bg-white text-[#0B3C5D] hover:bg-white/90"
            : "border border-white/30 bg-white/10 text-white/80 hover:bg-white/20"
        }`}
      >
        {exporting ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : canExportPDF ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        ) : (
          // Show lock icon if not PRO
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
        <span>
          {exporting ? "…" : canExportPDF ? t("exportPDF") : "Pro — Export PDF"}
        </span>
      </button>
    </div>
  );

  const PaperContent = () => (
    <>
      <PrintHeader tripInfo={tripInfo} region={region} totalLocal={totalLocal} totalIDR={totalIDR} />
      <PrintLayout tripInfo={tripInfo} rows={rows} dayMap={dayMap} region={region} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
    </>
  );

  // ── MOBILE ─────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col bg-white" role="dialog" aria-modal="true"
        style={{ width: "100vw", maxWidth: "100vw", overflowX: "hidden" }}>
        <div className="flex-shrink-0 sticky top-0 z-10">
          <TopBar />
          {error && (
            <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white" style={{ maxWidth: "100vw" }}>
          <div style={{
            fontFamily: "'Montserrat',-apple-system,sans-serif",
            width: "100%",
            maxWidth: "100vw",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}>
            <PaperContent />
          </div>
          <div className="py-6 text-center text-xs" style={{ color: "#CBD5E1", borderTop: "1px solid #F1F5F9", marginTop: "12px" }}>
            {t("previewHint")}
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[500] flex flex-col" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#0f172a]/85 backdrop-blur-md" />
      <div className="relative z-10 flex-shrink-0">
        <TopBar />
        {error && (
          <div className="flex items-center justify-between gap-3 border-b border-red-800 bg-red-900/80 px-4 py-2.5 text-xs text-red-200">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
          </div>
        )}
      </div>
      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a]/60 p-4 sm:p-8 preview-paper-area">
        <div className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <PaperContent />
        </div>
        <p className="mt-4 pb-6 text-center text-xs text-white/25">{t("previewHint")}</p>
      </div>
    </div>
  );
}
