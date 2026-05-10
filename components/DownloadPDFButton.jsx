"use client";

import { useState } from "react";

export default function DownloadPDFButton() {

  const [loading, setLoading] =
    useState(false);

  const handleDownload =
    async () => {

      try {

        setLoading(true);

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

        const isMobile =
          /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
          );

        // =================================================
        // IOS SAFARI FIX
        // OPEN TAB IMMEDIATELY
        // =================================================

        let mobileWindow = null;

        if (isMobile) {

          mobileWindow =
            window.open(
              "",
              "_blank"
            );
        }

        const html2canvas =
          (await import("html2canvas"))
            .default;

        const { jsPDF } =
          await import("jspdf");

        // WAIT IMAGES

        const images =
          element.querySelectorAll(
            "img"
          );

        await Promise.all(

          [...images].map(
            (img) => {

              if (
                img.complete
              ) {

                return Promise.resolve();
              }

              return new Promise(
                (
                  resolve
                ) => {

                  img.onload =
                    resolve;

                  img.onerror =
                    resolve;
                }
              );
            }
          )
        );

        // =================================================
        // CANVAS
        // =================================================

        const canvas =
          await html2canvas(
            element,
            {

              scale:
                isMobile
                  ? 1.2
                  : 3,

              useCORS: true,

              allowTaint: true,

              backgroundColor:
                "#ffffff",

              logging: false,
            }
          );

        // =================================================
        // PDF
        // =================================================

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
            0.9
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

        // =================================================
        // MOBILE
        // =================================================

        if (isMobile) {

          const blobUrl =
            pdf.output(
              "bloburl"
            );

          if (mobileWindow) {

            mobileWindow.location =
              blobUrl;

          } else {

            window.location.href =
              blobUrl;
          }

          return;
        }

        // =================================================
        // DESKTOP
        // =================================================

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