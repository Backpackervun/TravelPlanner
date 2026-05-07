"use client";

import { useEffect } from "react";
import { useT } from "@/context/TranslationContext";

const WA = "6281298053826";

export default function ContactModal({ open, onClose }) {
  const { t } = useT();

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

  const items = [
    {
      icon: "💬",
      label: "WhatsApp",
      detail: "+62 812 9805 3826",
      hint: "Fastest response",
      href: `https://wa.me/${WA}`,
      bg: "bg-[#25D366]",
      text: "text-white",
    },
    {
      icon: "📸",
      label: "Instagram",
      detail: "@backpackervun",
      hint: "DMs open",
      href: "https://instagram.com/backpackervun",
      bg: "bg-gradient-to-br from-purple-500 to-pink-500",
      text: "text-white",
    },
    {
      icon: "📧",
      label: "Email",
      detail: "info@backpackervun.com",
      hint: "Reply within 24h",
      href: "mailto:info@backpackervun.com",
      bg: "bg-paper-dim",
      text: "text-ink",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-paper-line bg-white shadow-card animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-line">
          <h2 className="text-base font-semibold text-ink">{t("contactUs")}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-4 space-y-2">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-4 rounded-xl border border-paper-line p-4 transition hover:shadow-soft active:scale-[0.98]"
            >
              <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl text-xl ${it.bg} ${it.text}`}>
                {it.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{it.label}</p>
                <p className="text-xs text-ink-muted truncate">{it.detail}</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
