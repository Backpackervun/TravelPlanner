"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleExport = () => {
    if (!canExportPDF) {
      onUpgradeNeeded?.("PDF export requires Lite or Pro.");
      return;
    }

    window.print();
  };

  return (
    <div
      className="preview-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* ACTION BAR */}
      <div className="preview-action-bar no-print">
        <button
          onClick={onClose}
          className="preview-top-btn"
        >
          ← {t("backToEdit")}
        </button>

        <span className="preview-pill">
          {t("previewTitle")}
        </span>

        <button
          onClick={handleExport}
          className="preview-export-btn"
        >
          ⬇ {t("exportPDF")}
        </button>
      </div>

      {/* PAPER AREA */}
      <div className="preview-paper-area">

        <div className="preview-paper">

          <PrintHeader
            totalLocal={totalLocal}
            totalIDR={totalIDR}
            region={region}
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

        <p className="preview-hint-text no-print">
          {t("previewHint")}
        </p>

      </div>
    </div>
  );
}