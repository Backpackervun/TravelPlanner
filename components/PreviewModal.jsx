"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!open) return;

    const fn = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", fn);

    return () => {
      document.removeEventListener("keydown", fn);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

const handleExportPDF = async () => {

  if (!canExportPDF) {

    onUpgradeNeeded?.(
      "PDF export requires a Lite or Pro plan."
    );

    return;
  }

  try {

    localStorage.setItem(
      "bpv-print-data",
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

const url =
  `/api/export-pdf`;

    const isIOS =
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      );

    if (isIOS) {

      window.open(url, "_blank");

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

      document.body.removeChild(
        link
      );
    }

  } catch (err) {

    console.error(err);

    alert("Failed to export PDF.");

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
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-lg transition hover:bg-white/90 active:scale-[0.98]"
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

          {t("exportPDF")}
        </button>

      </div>

      {/* Preview */}
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