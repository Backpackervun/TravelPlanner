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

 console.log(
  "TRIP INFO:",
  tripInfo
);

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

    // GENERATE UNIQUE EXPORT ID
    const exportId =
      crypto.randomUUID();

    // SAVE LIVE PREVIEW DATA
    localStorage.setItem(
      `bpv-export-${exportId}`,
      JSON.stringify({
        tripInfo,
        rows,
        dayMap,
        region,
        rate,
        totalLocal,
        totalIDR,
      })
    );

    // BUILD LIVE PRINT URL
    const currentUrl =
      `${window.location.origin}/print/${exportId}`;

    console.log(
      "EXPORT URL:",
      currentUrl
    );

    // CALL EXPORT API
    const response =
      await fetch(
        `/api/export-pdf?url=${encodeURIComponent(currentUrl)}`,
        {
          method: "GET",
        }
      );

    // HANDLE ERROR
    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "EXPORT ERROR:",
        errorText
      );

      throw new Error(
        errorText ||
        "Failed to export PDF"
      );
    }

    // GET PDF FILE
    const blob =
      await response.blob();

    // CREATE TEMP URL
    const pdfUrl =
      URL.createObjectURL(blob);

    // MOBILE DETECTION
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    // DOWNLOAD
    if (isMobile) {

      window.open(
        pdfUrl,
        "_blank"
      );

    } else {

      const link =
        document.createElement("a");

      link.href =
        pdfUrl;

      link.download =
        "backpackervun-itinerary.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );
    }

    // CLEANUP
    setTimeout(() => {

      URL.revokeObjectURL(
        pdfUrl
      );

      localStorage.removeItem(
        `bpv-export-${exportId}`
      );

    }, 10000);

  } catch (error) {

    console.error(
      "EXPORT FAILED:",
      error
    );

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

      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >

          ← {t("backToEdit")}

        </button>

        <div className="rounded-full bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">

          {t("previewTitle")}

        </div>

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