"use client";

import { useRef, useState } from "react";
import { useT, LANGS } from "@/context/TranslationContext";

/**
 * LanguageSwitcher v10
 *
 * Compact dropdown that works in both header (any position) and page-level use.
 * Does NOT contain the logo or title — pure switcher.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-paper-line bg-white px-2.5 py-2 text-xs font-semibold text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-[11px] uppercase tracking-[0.08em]">{current.code.toUpperCase()}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_8px_30px_rgba(11,60,93,0.12)]"
            role="listbox"
          >
            {LANGS.map(l => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-paper-dim ${
                  l.code === lang ? "bg-navy-50 font-semibold text-navy-500" : "text-ink-soft"
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {l.code === lang && (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-navy-500" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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
