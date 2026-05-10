"use client";

import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  /* =======================================================
     ESC CLOSE
  ======================================================= */

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

  /* =======================================================
     LOCK BODY SCROLL
  ======================================================= */

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

  /* =======================================================
     PDF EXPORT
  ======================================================= */

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

      const input =
        paperRef.current;

      if (!input) {

        throw new Error(
          "Preview paper not found"
        );
      }

      /* ===================================================
         HIGH QUALITY SCREENSHOT
      =================================================== */

      const canvas =
        await html2canvas(
          input,
          {

            scale:
              Math.max(
                window.devicePixelRatio,
                3
              ),

            useCORS: true,

            allowTaint: true,

            backgroundColor:
              "#ffffff",

            logging: false,

            letterRendering: true,

            imageTimeout: 0,

            scrollX: 0,

            scrollY:
              -window.scrollY,

            windowWidth:
              document.documentElement
                .scrollWidth,

            windowHeight:
              document.documentElement
                .scrollHeight,
          }
        );

      /* ===================================================
         PDF SETUP
      =================================================== */

      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a4",
          compress: false,
        });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const canvasWidth =
        canvas.width;

      const canvasHeight =
        canvas.height;

      const imgWidth =
        pdfWidth;

      const imgHeight =
        (canvasHeight *
          imgWidth) /
        canvasWidth;

      const imgData =
        canvas.toDataURL(
          "image/jpeg",
          1.0
        );

      /* ===================================================
         MULTI PAGE SUPPORT
      =================================================== */

      let heightLeft =
        imgHeight;

      let position = 0;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -=
        pdfHeight;

      while (heightLeft > 0) {

        position =
          heightLeft -
          imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        heightLeft -=
          pdfHeight;
      }

      /* ===================================================
         DOWNLOAD
      =================================================== */

      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        );

      if (isMobile) {

        const blobUrl =
          pdf.output(
            "bloburl"
          );

        window.open(
          blobUrl,
          "_blank"
        );

      } else {

        pdf.save(
          "backpackervun-itinerary.pdf"
        );
      }

    } catch (err) {

      console.error(err);

      alert(
        "Failed to export PDF."
      );

    } finally {

      setExporting(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

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

        {/* BACK */}

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

        {/* EXPORT */}

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

      {/* CONTENT */}

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