"use client";

import { useState } from "react";

export default function DownloadPDFButton() {

  const [loading, setLoading] =
    useState(false);

  const handleDownload =
    async () => {

      try {

        setLoading(true);

        // =================================================
        // IOS SAFARI
        // =================================================

        const isIOS =
          /iPad|iPhone|iPod/.test(
            navigator.userAgent
          );

        // =================================================
        // IOS → OPEN PRINT PAGE
        // =================================================

        if (isIOS) {

          window.location.href =
            "/print";

          return;
        }

        // =================================================
        // DESKTOP EXPORT
        // =================================================

        const html2canvas =
          (await import("html2canvas"))
            .default;

        const { jsPDF } =
          await import("jspdf");

        const element =
          document.getElementById(
            "pdf-content"
          );

        if (!element) {

          alert(
            "PDF content not found"
          );

          return;
        }

        const canvas =
          await html2canvas(
            element,
            {

              scale: 3,

              useCORS: true,

              allowTaint: true,

              backgroundColor:
                "#ffffff",
            }
          );

        const pdf =
          new jsPDF({
            orientation:
              "portrait",

            unit: "mm",

            format: "a4",
          });

        const pdfWidth =
          210;

        const pdfHeight =
          297;

        const imgWidth =
          pdfWidth;

        const imgHeight =
          (canvas.height *
            imgWidth) /
          canvas.width;

        const imgData =
          canvas.toDataURL(
            "image/jpeg",
            1.0
          );

        let heightLeft =
          imgHeight;

        let position = 0;

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -=
          pdfHeight;

        while (
          heightLeft > 0
        ) {

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
            imgHeight
          );

          heightLeft -=
            pdfHeight;
        }

        pdf.save(
          "travel-itinerary.pdf"
        );

      } catch (err) {

        console.error(err);

        alert(
          "Failed to export PDF"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <button
      onClick={
        handleDownload
      }
      disabled={loading}
      className="
        fixed
        bottom-6
        right-6
        z-50
        rounded-2xl
        bg-black
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        shadow-xl
        transition
        hover:scale-105
        disabled:opacity-50
      "
    >

      {loading
        ? "Generating PDF..."
        : "Download PDF"}

    </button>
  );
}