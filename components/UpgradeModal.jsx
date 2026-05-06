"use client";

import { useEffect, useState } from "react";
import RedeemModal from "./RedeemModal";

/**
 * UpgradeModal — shown when a FREE user hits a plan gate.
 * Has two CTAs: Enter Redeem Code and Chat on WhatsApp.
 */
export default function UpgradeModal({ open, onClose, reason }) {
  const [showRedeem, setShowRedeem] = useState(false);

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

  if (showRedeem) {
    return (
      <RedeemModal
        open
        onClose={() => setShowRedeem(false)}
        onSuccess={() => { setShowRedeem(false); onClose?.(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card animate-fade-in">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        {/* Icon + heading */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-navy-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink">Unlock the Planner</h2>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            {reason ?? "Enter a redeem code or upgrade your plan to start creating itineraries."}
          </p>
        </div>

        {/* Plan comparison — minimal */}
        <div className="mb-5 grid grid-cols-3 gap-2 text-center">
          {[
            { name: "Free", desc: "Locked",       badge: "bg-gray-100 text-gray-500" },
            { name: "Lite", desc: "3 trips · 7d", badge: "bg-blue-100 text-blue-700" },
            { name: "Pro",  desc: "Unlimited",     badge: "bg-violet-100 text-violet-700" },
          ].map((p) => (
            <div key={p.name} className="rounded-xl border border-paper-line p-3">
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.badge}`}>{p.name}</span>
              <p className="mt-1 text-[10px] text-ink-muted">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-2.5">
          <button
            onClick={() => setShowRedeem(true)}
            className="w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600"
          >
            🎟️ Enter Redeem Code
          </button>

          <a
            href={`https://wa.me/6281298053826?text=${encodeURIComponent("Hi Backpackervun, I'd like to upgrade my Travel Planner plan. Please help 🙏")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-paper-line py-3 text-sm font-semibold text-ink-soft transition hover:bg-paper-dim"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Contact Backpackervun
          </a>
        </div>
      </div>
    </div>
  );
}
