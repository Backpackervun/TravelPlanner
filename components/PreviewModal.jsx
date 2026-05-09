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

  if (!open) return null;

const handleExport = async () => {
  if (!canExportPDF) {
    onUpgradeNeeded?.("PDF export requires a Lite or Pro plan.");
    return;
  }

  const paperEl = paperRef.current;

  if (!paperEl) {
    window.print();
    return;
  }

  const printWindow = window.open(
    "",
    "_blank",
    "width=1400,height=900"
  );

  if (!printWindow) {
    alert("Please allow popups for PDF export.");
    return;
  }

  const stylesheets = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  )
    .map((link) => link.outerHTML)
    .join("\n");

  const inlineStyles = Array.from(
    document.querySelectorAll("style")
  )
    .map((style) => style.outerHTML)
    .join("\n");

const html = `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>Travel Planner PDF</title>

${stylesheets}
${inlineStyles}

<style>

@page {
  size: A4 portrait;
  margin: 10mm;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #0f172a;
  font-family: Inter, sans-serif;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  display: flex;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.pdf-shell {
  width: 100%;
  display: flex;
  justify-content: center;
}

.print-doc {
  width: 210mm !important;
  max-width: 210mm !important;
  min-width: 210mm !important;
  background: white !important;
  overflow: hidden !important;
  border-radius: 20px;
  transform-origin: top center;
}

.rounded-2xl {
  break-inside: avoid;
}

.day-card {
  break-inside: avoid;
}

button,
a {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

a {
  color: inherit !important;
  text-decoration: none !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  position: relative;
  z-index: 9999;
}

a[href]::after {
  content: "";
}

.no-print {
  display: none !important;
}

@media print {

  html,
  body {
    background: white !important;
    padding: 0 !important;
  }

  body {
    display: block !important;
  }

  .pdf-shell {
    width: 100% !important;
    padding: 0 !important;
  }

  .print-doc {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 100% !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

}

</style>

</head>

<body>

<div class="pdf-shell">
  ${paperEl.outerHTML}
</div>

<script>

window.onload = () => {

  setTimeout(() => {

    window.focus();
    window.print();

    setTimeout(() => {
      window.close();
    }, 500);

  }, 700);

};

window.onafterprint = () => {
  window.close();
};

</script>

</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}; 

 return (
  <div
    className="fixed inset-0 z-[500] flex flex-col"
    role="dialog"
    aria-modal="true"
  >
    {/* Backdrop */}
    <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

    {/* Top Action Bar */}
    <div className="no-print relative z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-4 py-3 sm:px-6">

      {/* Back Button */}
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

      {/* Export Button */}
      <button
        onClick={handleExport}
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

    {/* Preview Area */}
    <div className="relative z-10 flex-1 overflow-auto bg-[#0f172a] p-6">

      <div
        ref={paperRef}
        className="preview-paper mx-auto overflow-hidden rounded-[28px] bg-white shadow-2xl"
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