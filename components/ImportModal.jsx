"use client";

import { useRef, useState } from "react";
import { parseBvntrip } from "@/lib/itinerary-file";
import { useT } from "@/context/TranslationContext";

/**
 * ImportModal
 *
 * Handles .bvntrip file upload, validation, preview, and confirmation.
 * Calls onImport(data) only after the user confirms.
 *
 * Props:
 *   open       - boolean
 *   onClose    - () => void
 *   onImport   - (data: { tripInfo, rows, region, rate }) => void
 */
export default function ImportModal({ open, onClose, onImport }) {
  const { t } = useT();
  const fileRef = useRef(null);

  const [step,    setStep]    = useState("upload");   // "upload" | "preview" | "loading"
  const [error,   setError]   = useState(null);
  const [parsed,  setParsed]  = useState(null);
  const [dragging, setDragging] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep("upload");
    setError(null);
    setParsed(null);
    setDragging(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => { reset(); onClose?.(); };

  // ── File processing ────────────────────────────────────────────────────────

  const processFile = async (file) => {
    setError(null);
    setStep("loading");

    const result = await parseBvntrip(file);

    if (!result.ok) {
      setError(result.error);
      setStep("upload");
      return;
    }

    setParsed(result.data);
    setStep("preview");
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    onImport?.(parsed);
    reset();
    onClose?.();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-paper-line bg-white shadow-card animate-fade-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Import Itinerary</h2>
            <p className="text-xs text-ink-muted mt-0.5">Load a <code className="font-mono bg-paper-dim px-1 rounded">.bvntrip</code> file</p>
          </div>
          <button onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Loading */}
          {step === "loading" && (
            <div className="py-10 flex flex-col items-center gap-3 text-ink-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-500 border-t-transparent" />
              <p className="text-sm">Reading file…</p>
            </div>
          )}

          {/* Upload */}
          {step === "upload" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer transition ${
                  dragging
                    ? "border-navy-400 bg-navy-50"
                    : "border-paper-line hover:border-navy-300 hover:bg-paper-dim/40"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-500">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink">Drop file here or click to browse</p>
                  <p className="text-xs text-ink-muted mt-1">Accepts <code className="font-mono">.bvntrip</code> files</p>
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".bvntrip,.json"
                className="hidden"
                onChange={handleFileInput}
              />

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5">
                  <span className="text-base mt-0.5">⚠️</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Preview + Confirm */}
          {step === "preview" && parsed && (
            <>
              {/* Preview card */}
              <div className="rounded-xl border border-paper-line bg-paper-dim/40 p-4 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted mb-3">Itinerary Preview</p>
                <div className="space-y-2">
                  {[
                    ["Client",      parsed.tripInfo?.clientName   || "—"],
                    ["Destination", parsed.tripInfo?.destinations || "—"],
                    ["Dates",       parsed.tripInfo?.travelDates  || (parsed.tripInfo?.startDate && parsed.tripInfo?.endDate
                                      ? `${parsed.tripInfo.startDate} – ${parsed.tripInfo.endDate}` : "—")],
                    ["Duration",    parsed.tripInfo?.duration     || "—"],
                    ["Region",      parsed.region                 || "—"],
                    ["Stops",       `${parsed.rows.length} stop${parsed.rows.length !== 1 ? "s" : ""}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start gap-2">
                      <span className="w-24 flex-shrink-0 text-xs text-ink-muted">{label}</span>
                      <span className="text-xs font-medium text-ink">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 mb-4">
                <span className="text-base mt-0.5">⚠️</span>
                <p className="text-sm text-amber-800">
                  <strong>Your current itinerary will be replaced.</strong> This cannot be undone. Make sure you've saved your work first.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button onClick={() => { setStep("upload"); setParsed(null); }}
                  className="flex-1 rounded-xl border border-paper-line py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-dim transition">
                  Back
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-navy-500 py-2.5 text-sm font-semibold text-white hover:bg-navy-600 transition active:scale-[0.97]">
                  Load Itinerary
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
