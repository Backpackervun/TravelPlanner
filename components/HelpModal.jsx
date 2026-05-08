"use client";

import { useEffect, useState } from "react";
import { useT } from "@/context/TranslationContext";

/**
 * HelpModal — fully translated.
 * All text comes from t() — no hardcoded English.
 */
export default function HelpModal({ open, onClose, initialTab = "how" }) {
  const { t } = useT();
  const [tab, setTab] = useState(initialTab);

  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const steps = [
    t("helpStep1"), t("helpStep2"), t("helpStep3"),
    t("helpStep4"), t("helpStep5"), t("helpStep6"),
    t("helpStep7"), t("helpStep8"), t("helpStep9"), t("helpStep10"),
  ];
  const rules = [t("helpRule1"), t("helpRule2"), t("helpRule3"), t("helpRule4")];
  const tips  = [t("helpTip1"), t("helpTip2"), t("helpTip3"), t("helpTip4")];

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-paper-line bg-white shadow-card overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-line px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">{t("helpTitle")}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-paper-line px-6">
          {[
            { key: "how",     icon: "📋", label: t("helpTabHow") },
            { key: "contact", icon: "💬", label: t("helpTabContact") },
          ].map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-3.5 text-sm font-semibold transition ${
                tab === tb.key
                  ? "border-navy-500 text-navy-500"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <span>{tb.icon}</span> {tb.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-5">

          {tab === "how" && (
            <>
              {/* What is this app */}
              <section>
                <h3 className="text-base font-semibold text-ink mb-1.5">{t("helpWhatTitle")}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{t("helpWhatBody")}</p>
              </section>

              {/* Step guide */}
              <section>
                <h3 className="text-base font-semibold text-ink mb-3">{t("helpGuideTitle")}</h3>
                <ol className="space-y-2.5">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-600 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-ink-soft leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Important rules */}
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ {t("helpRulesTitle")}</h3>
                <ul className="space-y-1.5">
                  {rules.map((r, i) => (
                    <li key={i} className="text-sm text-amber-700">· {r}</li>
                  ))}
                </ul>
              </section>

              {/* Tips */}
              <section>
                <h3 className="text-base font-semibold text-ink mb-2">💡 {t("helpTipsTitle")}</h3>
                <ul className="space-y-1.5">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-ink-soft">· {tip}</li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {tab === "contact" && (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">{t("helpContactBody")}</p>
              {[
                { icon: "💬", label: "WhatsApp", detail: "+62 812-9805-3826", href: "https://wa.me/6281298053826" },
                { icon: "📸", label: "Instagram", detail: "@backpackervun", href: "https://instagram.com/backpackervun" },
                { icon: "📧", label: "Email", detail: "info@backpackervun.com", href: "mailto:info@backpackervun.com" },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-paper-line p-4 transition hover:border-navy-200 hover:shadow-soft">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{c.label}</p>
                    <p className="text-xs text-ink-muted">{c.detail}</p>
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
