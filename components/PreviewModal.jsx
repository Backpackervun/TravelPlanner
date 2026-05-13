"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — mobile-v2
 *
 * DESKTOP (sm+):
 *   Dark overlay modal. Paper centered, max-w-[210mm], rounded corners.
 *   Unchanged from before.
 *
 * MOBILE (< sm):
 *   Full-screen white view. No dark background. No scaling.
 *   Paper fills full viewport width — exactly like Image 2 (/pdf-render).
 *   Sticky top bar with Back + Export buttons.
 *   Content scrolls naturally.
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  if (!open) return null;

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (exporting) return;
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires a Lite or Pro plan.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const payload = JSON.stringify({ tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR });
      let saved = false;
      try { localStorage.setItem("bpv-pdf-render", payload); saved = true; } catch {}
      if (!saved) { try { sessionStorage.setItem("bpv-pdf-render", payload); saved = true; } catch {} }
      if (!saved) { setError("Storage unavailable. Disable Private Mode."); setExporting(false); return; }
      const newTab = window.open("/pdf-render", "_blank");
      if (!newTab) { window.location.href = "/pdf-render"; return; }
      setTimeout(() => setExporting(false), 2000);
    } catch (err) {
      setError("Export failed. Please try again.");
      setExporting(false);
    }
  };

  // ── TOP BAR (shared between mobile + desktop) ──────────────────────────────
  const TopBar = ({ dark }) => (
    <div
      className="flex flex-shrink-0 items-center justify-between px-4 py-3 sm:px-6"
      style={dark
        ? { background: "rgba(15,23,42,0.95)", borderBottom: "1px solid rgba(255,255,255,0.1)" }
        : { background: "white", borderBottom: "1px solid #E8EDF3", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
      }
    >
      {/* Back */}
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-[0.97]"
        style={dark
          ? { border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)", color: "white" }
          : { border: "1px solid #E8EDF3", background: "white", color: "#1E293B" }
        }
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
        </svg>
        <span className="hidden sm:inline">{t("backToEdit")}</span>
      </button>

      {/* Title — desktop only */}
      {dark && (
        <span className="hidden sm:block rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
          {t("previewTitle")}
        </span>
      )}

      {/* Mobile: label instead of pill */}
      {!dark && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
          {t("previewTitle")}
        </span>
      )}

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow transition active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: dark ? "white" : "#0B3C5D", color: dark ? "#0f172a" : "white" }}
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
  );

  const PaperContent = () => (
    <>
      <PrintHeader tripInfo={tripInfo} region={region} totalLocal={totalLocal} totalIDR={totalIDR} />
      <PrintLayout tripInfo={tripInfo} rows={rows} dayMap={dayMap} region={region} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT — full-screen white, paper fills viewport width
  // Matches /pdf-render page appearance (Image 2)
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-[500] flex flex-col"
        style={{ background: "white" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky top bar — white */}
        <div className="flex-shrink-0 sticky top-0 z-10">
          <TopBar dark={false} />
          {/* Error */}
          {error && (
            <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}
        </div>

        {/* Paper — full width, white background, scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
          <div
            className="preview-paper bg-white"
            style={{
              width: "100%",
              fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            <PaperContent />
          </div>

          {/* Bottom hint */}
          <div
            className="py-6 text-center text-xs"
            style={{ color: "#CBD5E1", borderTop: "1px solid #F1F5F9", marginTop: "16px" }}
          >
            {t("previewHint")}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT — dark overlay modal, unchanged
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[500] flex flex-col" role="dialog" aria-modal="true">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* Top bar */}
      <div className="relative z-10 flex-shrink-0">
        <TopBar dark={true} />
        {error && (
          <div className="flex items-center justify-between gap-3 border-b border-red-800 bg-red-900/80 px-4 py-2.5 text-xs text-red-200">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* Paper area */}
      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-4 sm:p-6 preview-paper-area">
        <div className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <PaperContent />
        </div>
        <p className="mt-4 pb-6 text-center text-xs text-white/25">
          {t("previewHint")}
        </p>
      </div>
    </div>
  );
}
