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

      const currentUrl =
        `${window.location.origin}/print/${tripInfo?.id}`;

      console.log(
        "EXPORT URL:",
        currentUrl
      );

      const response =
        await fetch(

          `/api/export-pdf?url=${encodeURIComponent(currentUrl)}`

        );

      console.log(
        "EXPORT STATUS:",
        response.status
      );

      if (!response.ok) {

        const text =
          await response.text();

        console.error(
          "EXPORT ERROR:",
          text
        );

        alert(text);

        return;
      }

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      if (isMobile) {

        window.open(
          blobUrl,
          "_blank"
        );

      } else {

        const link =
          document.createElement("a");

        link.href = blobUrl;

        link.download =
          "backpackervun-itinerary.pdf";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      }

      setTimeout(() => {

        window.URL.revokeObjectURL(
          blobUrl
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

      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

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

        <div className="rounded-full bg-white/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">

          {t("previewTitle")}

        </div>

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

            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
            />

          </svg>

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