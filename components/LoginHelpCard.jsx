"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";

/**
 * LoginHelpCard v10
 *
 * BUG FIX: Was rendering raw translation keys like "howToStartStep1"
 * instead of calling t("howToStartStep1").
 * Now correctly calls t() for every string.
 */
export default function LoginHelpCard() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  // Steps are now proper t() calls — not raw key strings
  const steps = [
    t("howToStartStep1"),
    t("howToStartStep2"),
    t("howToStartStep3"),
    t("howToStartStep4"),
    t("howToStartStep5"),
  ];

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-accent-100 bg-accent-50/60">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-accent-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">❓</span>
          <span className="text-sm font-semibold text-navy-600">{t("howToStart")}</span>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 text-navy-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="border-t border-accent-100/60 px-5 pb-5 pt-4">
          <ol className="space-y-3.5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-ink-soft leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 rounded-xl border border-accent-200 bg-white px-4 py-3">
            <p className="text-xs text-ink-soft">
              {t("howToStartCta")}&nbsp;
              <a
                href="https://wa.me/6281298053826"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy-500 hover:underline underline-offset-2"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
