"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";

import PrintHeader from "./PrintHeader";
import PrintLayout from "./PrintLayout";

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

  const [exporting, setExporting] =
    useState(false);

  useEffect(() => {

    if (!open) return;

    const fn = (e) => {

      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      fn
    );

    return () => {

      document.removeEventListener(
        "keydown",
        fn
      );
    };

  }, [open, onClose]);

  useEffect(() => {

    if (!open) return;

    const prev =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {

      document.body.style.overflow =
        prev;
    };

  }, [open]);

  if (!open) return null;

  /* ========================================================
     PDF EXPORT
  ======================================================== */

  const handleExportPDF = async () => {

    if (exporting) return;

    if (!canExportPDF) {

      onUpgradeNeeded?.(
        "PDF export requires a Lite or Pro plan."
      );

      return;
    }

    try {

      setExporting(true);

      const paperEl =
        paperRef.current;

      if (!paperEl) {

        throw new Error(
          "Preview paper missing"
        );
      }

      /* ========================================
         GET WEBSITE STYLES
      ======================================== */

      const styleLinks =
        Array.from(
          document.querySelectorAll(
            'link[rel="stylesheet"]'
          )
        )
        .map(
          (s) => s.outerHTML
        )
        .join("\n");

      const inlineStyles =
        Array.from(
          document.querySelectorAll(
            "style"
          )
        )
        .map(
          (s) =>
            `<style>${s.textContent}</style>`
        )
        .join("\n");

      /* ========================================
         BUILD HTML
      ======================================== */

      const html = `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  Backpackervun Travel Planner
</title>

<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
/>

<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin
/>

<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>

${styleLinks}

${inlineStyles}

<style>

@page {
  size: A4 portrait;
  margin: 0;
}

html,
body {

  margin: 0 !important;

  padding: 0 !important;

  background: #0f172a !important;

  font-family:
    'Inter',
    sans-serif !important;

  -webkit-print-color-adjust: exact !important;

  print-color-adjust: exact !important;

  color-adjust: exact !important;
}

* {

  box-sizing: border-box;

  -webkit-print-color-adjust: exact !important;

  print-color-adjust: exact !important;

  color-adjust: exact !important;
}

body {

  display: flex;

  justify-content: center;

  padding: 24px;
}

.preview-paper {

  width: 794px !important;

  max-width: 794px !important;

  min-width: 794px !important;

  background: white !important;

  overflow: visible !important;

  border-radius: 24px !important;

  box-shadow: none !important;
}

img {

  max-width: 100%;

  display: block;
}

a {

  color: inherit !important;

  text-decoration: none !important;
}

.rounded-2xl,
.rounded-3xl,
.day-block,
.itinerary-card,
.stop,
.print-card,
section,
article {

  page-break-inside: avoid !important;

  break-inside: avoid !important;
}

</style>

</head>

<body>

${paperEl.outerHTML}

</body>

</html>
`;

      /* ========================================
         CALL PDF API
      ======================================== */

      const response =
        await fetch(
          "/api/export-pdf",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              html,
            }),
          }
        );

      if (!response.ok) {

        const errText =
          await response.text();

        console.error(errText);

        throw new Error(
          "Failed to generate PDF"
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob
        );

      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      /* ========================================
         MOBILE
      ======================================== */

      if (isMobile) {

        window.open(
          url,
          "_blank"
        );

      } else {

        /* ========================================
           DESKTOP
        ======================================== */

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          "backpackervun-itinerary.pdf";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }

      setTimeout(() => {

        URL.revokeObjectURL(
          url
        );

      }, 10000);

    } catch (err) {

      console.error(err);

      alert(
        "Failed to export PDF."
      );

    } finally {

      setExporting(false);
    }
  };

  return (

    <div
      className="fixed inset-0 z-[500] flex flex-col"
      role="dialog"
      aria-modal="true"
    >

      {/* Backdrop */}

      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* Top Bar */}

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

        {/* Back */}

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >

          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            <path d="M19 12H5" />

            <path d="M12 5l-7 7 7 7" />

          </svg>

          <span className="hidden sm:inline">
            {t("backToEdit")}
          </span>

          <span className="sm:hidden">
            {t("back")}
          </span>

        </button>

        {/* Title */}

        <div className="rounded-full bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {t("previewTitle")}
        </div>

        {/* Export */}

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >

          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

            <polyline points="7 10 12 15 17 10" />

            <line x1="12" y1="15" x2="12" y2="3" />

          </svg>

          {exporting
            ? "Exporting..."
            : t("exportPDF")}

        </button>

      </div>

      {/* Preview */}

      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-6">

        <div
          ref={paperRef}
          className="preview-paper mx-auto w-full max-w-[210mm] overflow-visible rounded-[28px] bg-white shadow-2xl"
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

    </div>
  );
}