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
        // SAFE DYNAMIC IMPORTS
        // =================================================

        const html2canvas =
          (await import("html2canvas"))
            .default;

        const { jsPDF } =
          await import("jspdf");

        // =================================================
        // TARGET ELEMENT
        // =================================================

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

        // =================================================
        // MOBILE DETECTION
        // =================================================

        const isMobile =
          /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
          );

        // =================================================
        // MOBILE → SERVER PDF EXPORT
        // =================================================

        if (isMobile) {

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
                  html:
                    element.outerHTML,
                }),
              }
            );

          if (!response.ok) {

            throw new Error(
              "Failed to export mobile PDF"
            );
          }

          const blob =
            await response.blob();

          const blobUrl =
            URL.createObjectURL(
              blob
            );

          // =================================================
          // IOS SAFARI FIX
          // =================================================

          const isIOS =
            /iPad|iPhone|iPod/.test(
              navigator.userAgent
            );

          if (isIOS) {

            window.location.href =
              blobUrl;

          } else {

            const link =
              document.createElement(
                "a"
              );

            link.href =
              blobUrl;

            link.download =
              "travel-itinerary.pdf";

            document.body.appendChild(
              link
            );

            link.click();

            document.body.removeChild(
              link
            );
          }

          return;
        }

        // =================================================
        // WAIT ALL IMAGES LOADED
        // =================================================

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
        // DESKTOP HTML2CANVAS
        // =================================================

        const canvas =
          await html2canvas(
            element,
            {

              scale: 3,

              useCORS: true,

              allowTaint: true,

              backgroundColor:
                "#ffffff",

              logging: false,

              scrollX: 0,

              scrollY:
                -window.scrollY,

              windowWidth:
                element.scrollWidth,

              windowHeight:
                element.scrollHeight,
            }
          );

        // =================================================
        // PDF SETUP
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
            1.0
          );

        // =================================================
        // MULTIPAGE SUPPORT
        // =================================================

        let heightLeft =
          imgHeight;

        let position = 0;

        // FIRST PAGE

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

        // NEXT PAGES

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
        // DESKTOP SAVE
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