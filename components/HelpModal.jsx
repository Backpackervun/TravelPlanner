"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";

/**
 * HelpModal — patch-4items
 *
 * Changes:
 * 1. All text uses t() — follows user's language setting
 * 2. Added "Export & Import (.bvntrip)" section in How to Use tab
 * 3. Structure: What is this app? → Steps → .bvntrip guide → Important rules
 */
export default function HelpModal({ open, onClose, initialTab = "how" }) {
  const { t } = useT();
  const [tab, setTab] = useState(initialTab);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-end justify-center sm:items-center px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-paper-line bg-white shadow-card overflow-hidden animate-fade-in flex flex-col" style={{maxHeight:"90vh"}}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-line px-6 py-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-ink">{t("helpTitle") || "Help & contact"}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-paper-line flex-shrink-0">
          {[["how", t("helpTabHow") || "📖 How to Use"], ["contact", t("helpTabContact") || "💬 Contact"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 px-5 py-3 text-sm font-semibold transition border-b-2 ${
                tab === key ? "border-navy-500 text-navy-600" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── HOW TO USE ── */}
          {tab === "how" && (
            <>
              {/* What is this app */}
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">{t("helpWhatTitle") || "What is this app?"}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {t("helpWhatDesc") || "This app helps you plan travel itineraries in a structured and professional way. Enter details, pick a region, and build a day-by-day plan you can export as a premium PDF."}
                </p>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-sm font-semibold text-ink mb-3">{t("helpStepsTitle") || "Step-by-step guide"}</h3>
                <ol className="space-y-2.5">
                  {(t("helpSteps") || [
                    "Enter trip details: client name, destination, and dates.",
                    "Select a travel region carefully — it sets the local currency.",
                    "Click 'Start Planning' to open the itinerary editor.",
                    "Add itinerary rows one by one using '+ Add row'.",
                    "Enter destinations EXACTLY as shown on Google Maps.",
                    "Fill From → To when a row involves moving between locations.",
                    "Select the transport type from the dropdown.",
                    "Click Map or Route to verify locations on Google Maps.",
                    "Enter the actual budget manually — costs are not auto-estimated.",
                    "Click Preview then Export PDF to save your itinerary.",
                  ]).map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
                      <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-navy-100 text-navy-600 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* ✅ .bvntrip Export/Import guide */}
              <div className="rounded-xl border border-paper-line bg-paper-dim/40 p-4">
                <h3 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <span>📦</span>
                  {t("helpBvntripTitle") || "Export & Import Itinerary (.bvntrip)"}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed mb-3">
                  {t("helpBvntripDesc") || "You can save your itinerary as a .bvntrip file to back it up, share it, or reload it later."}
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 rounded-md bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold text-navy-600">
                      {t("helpBvntripExportLabel") || "Export"}
                    </span>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {t("helpBvntripExportStep") || "Click Menu → Export .bvntrip to download your itinerary as a file."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      {t("helpBvntripImportLabel") || "Import"}
                    </span>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {t("helpBvntripImportStep") || "Click Menu → Import .bvntrip and upload a .bvntrip file to load a saved itinerary."}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-200">
                  ⚠️ {t("helpBvntripNote") || "Importing will replace your current itinerary. Make sure to save first."}
                </p>
              </div>

              {/* Important rules */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ {t("helpRulesTitle") || "Important rules"}
                </h3>
                <ul className="space-y-1.5">
                  {(t("helpRules") || [
                    "Always use Google Maps names for location accuracy.",
                    "Make sure destinations match the selected region.",
                    "This app does NOT provide real-time transport or pricing data.",
                    "Times and costs must be entered manually by you.",
                  ]).map((rule, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-amber-500">·</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* ── CONTACT ── */}
          {tab === "contact" && (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                {t("helpContactDesc") || "Need help or want to arrange a trip with us?"}
              </p>

              {[
                { icon:"💬", label:"WhatsApp", value:"+62 812-9805-3826", href:"https://wa.me/6281298053826" },
                { icon:"📧", label:"Email",    value:"info@backpackervun.com", href:"mailto:info@backpackervun.com" },
                { icon:"📷", label:"Instagram",value:"@backpackervun", href:"https://instagram.com/backpackervun" },
              ].map(({ icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-paper-line bg-white p-4 hover:border-navy-200 hover:bg-navy-50 transition"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
                    <p className="text-sm font-semibold text-navy-600">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
