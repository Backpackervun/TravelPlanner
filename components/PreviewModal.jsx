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

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [open, onClose]);

  useEffect(() => {

    if (!open) return;

    const prevOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {

      document.body.style.overflow =
        prevOverflow;
    };

  }, [open]);

  if (!open) return null;

  /* ========================================================
     FINAL PDF EXPORT
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

      /* ========================================================
         BUILD LIVE HTML
      ======================================================== */

      const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<style>

* {

  box-sizing: border-box;

  -webkit-print-color-adjust: exact !important;

  print-color-adjust: exact !important;

  color-adjust: exact !important;
}

html,
body {

  margin: 0;

  padding: 0;

  background: #ffffff;

  font-family:
    Inter,
    Arial,
    sans-serif;
}

@page {

  size: A4;

  margin: 0;
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

      /* ========================================================
         CALL PDF API
      ======================================================== */

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

        const errorText =
          await response.text();

        console.error(
          "PDF API ERROR:",
          errorText
        );

        throw new Error(
          errorText ||
          "Failed to export PDF"
        );
      }

      /* ========================================================
         CREATE PDF DOWNLOAD
      ======================================================== */

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

      if (isMobile) {

        window.open(
          url,
          "_blank"
        );

      } else {

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

      {/* BACKDROP */}

      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* TOP BAR */}

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

        {/* BACK BUTTON */}

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >

          ← {t("backToEdit")}

        </button>

        {/* TITLE */}

        <div className="rounded-full bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">

          {t("previewTitle")}

        </div>

        {/* EXPORT BUTTON */}

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 disabled:opacity-50"
        >

          {exporting
            ? "Exporting..."
            : t("exportPDF")}

        </button>

      </div>

      {/* PREVIEW */}

      <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-6">

        <div
          ref={paperRef}
          className="preview-paper mx-auto w-full max-w-[210mm] overflow-hidden rounded-[28px] bg-white shadow-2xl"
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