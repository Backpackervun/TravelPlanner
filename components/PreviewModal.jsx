"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/context/TranslationContext";
import PrintHeader from "./PrintHeader";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TravelPdfDocument from "./pdf/TravelPdfDocument";
import { getCurrency } from "@/lib/utils";
import PrintLayout from "./PrintLayout";

/**
 * PreviewModal — Patch 14e
 *
 * FIX: Print window now includes the Montserrat Google Font so the
 * exported PDF matches the web app typography exactly.
 */
export default function PreviewModal({
  open, onClose, tripInfo, rows, dayMap,
  region, rate, totalLocal, totalIDR,
  canExportPDF, onUpgradeNeeded,
}) {
  const { t }    = useT();
  const paperRef = useRef(null);

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

    const paperEl = paperRef.current;
    if (!paperEl) { window.print(); return; }

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { window.print(); return; }

    // Collect all stylesheet links from the current page
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(l => `<link rel="stylesheet" href="${l.href}">`)
      .join("\n");

    // Collect inline style tags
    const inlineStyles = Array.from(document.querySelectorAll("style"))
      .map(s => `<style>${s.textContent}</style>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backpackervun Travel Planner</title>

  <!-- ✅ Montserrat font — matches web app typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  ${styleLinks}
  ${inlineStyles}

  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    html, body {
      background: white !important;
      margin: 0;
      padding: 0;
      /* ✅ Use Montserrat as primary font */
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .preview-paper {
      box-shadow: none !important;
      border-radius: 0 !important;
      border: none !important;
      max-width: 100% !important;
      width: 100% !important;
    }
  </style>
</head>
<body class="bg-white" style="font-family: 'Montserrat', sans-serif;">
  ${paperEl.outerHTML}
  <script>
    // Print after fonts and styles load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        setTimeout(function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }, 200);
      });
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }, 400);
      });
    }
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div
      className="preview-modal-overlay fixed inset-0 z-[500] flex flex-col"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* Action bar */}
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

        <PDFDownloadLink
  document={
    <TravelPdfDocument
      tripInfo={tripInfo}
      rows={rows}
      currency={getCurrency(region)}
      totals={{
        local: totalLocal,
        idr: totalIDR,
      }}
    />
  }
  fileName="Backpackervun-Itinerary.pdf"
  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.97]"
>
  {({ loading }) => (
    <>
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>

      {loading
        ? "Generating PDF..."
        : t("exportPDF")}
    </>
  )}
</PDFDownloadLink>
      </div>

      {/* Scrollable paper area */}
      <div
        className="preview-paper-area relative flex-1 overflow-y-auto py-8 px-3 sm:px-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          ref={paperRef}
          className="preview-paper mx-auto max-w-[860px] rounded-2xl bg-white overflow-hidden"
          style={{
            boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            minHeight: "1100px",
          }}
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
