"use client";

import { useEffect, useState } from "react";

/**
 * HelpModal — single modal with two tabs:
 *   1. How to Use — beginner guide (intro / steps / rules / tips)
 *   2. Contact     — email / Instagram / WhatsApp
 *
 * Opened from the header. Closed via Escape, backdrop click, or the
 * X button. Body scroll is locked while open.
 */
export default function HelpModal({ open, initialTab = "how", onClose }) {
  const [tab, setTab] = useState(initialTab);

  // Sync external initialTab when re-opened
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-paper-line bg-white shadow-card animate-fade-in">
        <header className="flex items-center justify-between gap-3 border-b border-paper-line px-5 py-4">
          <h2 id="help-modal-title" className="text-base font-semibold text-ink">
            Help & contact
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted transition hover:bg-paper-dim hover:text-navy-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Tabs */}
        <div role="tablist" className="flex gap-1 border-b border-paper-line px-3 pt-2">
          <TabButton id="how" active={tab === "how"} onClick={() => setTab("how")}>
            📚 How to Use
          </TabButton>
          <TabButton id="contact" active={tab === "contact"} onClick={() => setTab("contact")}>
            💬 Contact
          </TabButton>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {tab === "how" ? <HowToUse /> : <Contact />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      onClick={onClick}
      className={`relative rounded-t-md px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-white text-navy-500"
          : "text-ink-muted hover:bg-paper-dim hover:text-navy-500"
      }`}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-navy-500"
        />
      )}
    </button>
  );
}

// ============================================================
// How to Use — the 4 spec sections
// ============================================================
function HowToUse() {
  return (
    <div className="space-y-6 text-sm text-ink-soft">
      <section>
        <h3 className="text-base font-semibold text-ink">What is this app?</h3>
        <p className="mt-2 leading-relaxed">
          This app helps you plan your travel itinerary in a structured and
          professional way. It runs entirely in your browser — no account, no
          backend, and your data is saved locally.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">Step-by-step guide</h3>
        <ol className="mt-2 space-y-1.5">
          {[
            "Enter your trip details (client, duration, destination, dates).",
            "Select your travel region carefully.",
            "Click 'Start Planning'.",
            "Add itinerary rows one by one.",
            "Enter destinations EXACTLY as shown on Google Maps.",
            "Fill From → To when the row involves moving.",
            "Select the transport type manually from the dropdown.",
            "Click Map or Route to verify on Google Maps.",
            "Enter the actual budget manually — no auto-estimates.",
            "Switch to Preview mode before printing or exporting PDF.",
          ].map((step, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-navy-50 text-[10px] font-bold text-navy-500">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-amber-900">
          ⚠️ Important rules
        </h3>
        <ul className="mt-2 space-y-1 text-amber-900/90 leading-relaxed">
          <li>• Always use <strong>Google Maps names</strong> for locations.</li>
          <li>• Make sure destinations match the selected region.</li>
          <li>• This app does <strong>NOT</strong> provide real-time transport data.</li>
          <li>• Times and costs you see are <strong>not estimated</strong> — you type them.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-ink">💡 Tips</h3>
        <ul className="mt-2 space-y-1 leading-relaxed">
          <li>• Keep itineraries simple. Less is more.</li>
          <li>• Double-check routes on Google Maps before travel day.</li>
          <li>• Use the <strong>Transport</strong> category for movement legs.</li>
          <li>• Use the Insert Above / Below buttons to slot in last-minute stops.</li>
        </ul>
      </section>
    </div>
  );
}

// ============================================================
// Contact — email / Instagram / WhatsApp
// ============================================================
function Contact() {
  const items = [
    {
      icon: "📧",
      label: "Email",
      value: "info@backpackervun.com",
      href: "mailto:info@backpackervun.com",
    },
    {
      icon: "📸",
      label: "Instagram",
      value: "@backpackervun",
      href: "https://instagram.com/backpackervun",
    },
    {
      icon: "💬",
      label: "WhatsApp",
      value: "+62 812 9805 3826",
      href: "https://wa.me/6281298053826",
    },
  ];

  return (
    <div>
      <p className="text-sm text-ink-soft">
        Questions, custom planning, or trouble with the app? Reach us through
        any of these channels.
      </p>

      <ul className="mt-5 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <a
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-paper-line bg-white px-4 py-3 transition hover:border-navy-200 hover:bg-navy-50/50 hover:shadow-soft"
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-paper-dim text-xl leading-none">
                {it.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  {it.label}
                </span>
                <span className="block text-sm font-medium text-ink">
                  {it.value}
                </span>
              </span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
