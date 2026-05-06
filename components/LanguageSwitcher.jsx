"use client";

import { useState } from "react";
import { SUPPORTED_LANGS } from "@/hooks/useLanguage";

/**
 * LanguageSwitcher — compact flag+code button with popover list.
 * Receives `lang` and `setLang` from parent (via useLanguage hook).
 */
export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGS.find((l) => l.code === lang) ?? SUPPORTED_LANGS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-2.5 py-2 text-xs font-semibold text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
        aria-label="Switch language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline uppercase tracking-[0.1em] text-[11px]">{current.code}</span>
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-paper-line bg-white shadow-card">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-paper-dim ${
                  l.code === lang ? "bg-navy-50 font-semibold text-navy-500" : "text-ink-soft"
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span>{l.label}</span>
                {l.code === lang && (
                  <svg viewBox="0 0 24 24" className="ml-auto h-3.5 w-3.5 text-navy-500" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
