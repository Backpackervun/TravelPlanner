"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { redeemCode } from "@/lib/firestore";
import { planLabel, planBadgeClass } from "@/lib/plans";
import { useT } from "@/context/TranslationContext";

export default function RedeemModal({ open, onClose, onSuccess }) {
  const { user, refreshPlan } = useAuth();
  const { t } = useT();
  const [code, setCode]   = useState("");
  const [status, setStatus] = useState("idle"); // idle|loading|success|error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setCode(""); setStatus("idle"); setResult(null); setErrorMsg("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

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

  const handleApply = async () => {
    if (!code.trim() || !user) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      // Pass user.email so redeemCode can create the profile if missing
      const res = await redeemCode(user.uid, user.email, code.trim());
      await refreshPlan();
      setResult(res);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message ?? t("redeemError"));
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success" && result) {
    const expStr = result.expiresAt
      ? new Date(result.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
      : null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card animate-fade-in text-center">
          {/* Confetti icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-4xl">
            🎉
          </div>
          <h2 className="text-xl font-semibold text-ink">{t("redeemSuccess")}</h2>

          {/* Plan badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${planBadgeClass(result.plan)}`}>
              {planLabel(result.plan)} Plan
            </span>
            <span className="text-sm text-ink-muted">activated</span>
          </div>

          {expStr && (
            <p className="mt-2 text-xs text-ink-muted">
              Valid until <span className="font-semibold text-ink">{expStr}</span>
            </p>
          )}

          <div className="mt-6 rounded-xl border border-paper-line bg-paper-dim p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">What you unlocked:</p>
            {result.plan === "PRO" ? (
              <ul className="space-y-1 text-sm text-ink-soft">
                {["Unlimited itineraries","Unlimited trip rows","Premium PDF export","All analytics & charts","Priority support"].map(f=>(
                  <li key={f} className="flex items-center gap-2"><span className="text-emerald-500">✓</span> {f}</li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-1 text-sm text-ink-soft">
                {["Up to 3 itineraries","Up to 20 rows per trip","PDF export enabled","Cloud save enabled"].map(f=>(
                  <li key={f} className="flex items-center gap-2"><span className="text-blue-500">✓</span> {f}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => { onSuccess?.(result); onClose?.(); }}
            className="mt-5 w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white shadow hover:bg-navy-600"
          >
            Start Planning →
          </button>
        </div>
      </div>
    );
  }

  // ── Input state ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card animate-fade-in">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">🎟️</span>
          <h2 className="mt-3 text-xl font-semibold text-ink">{t("redeemCode")}</h2>
          <p className="mt-1 text-sm text-ink-muted">Activate Lite or Pro plan instantly.</p>
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setErrorMsg(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
            placeholder="e.g. BE-3DAYSTRIAL"
            className="w-full rounded-xl border border-paper-line bg-paper-dim px-4 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.12em] text-ink outline-none transition focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
          />

          {status === "error" && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-center text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={!code.trim() || status === "loading"}
            className="w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:opacity-60"
          >
            {status === "loading" ? "Checking…" : t("redeemApply")}
          </button>
        </div>

        {/* Plan comparison */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { name: t("free") || "Free", desc: t("planFreeDesc") || "Trial 7 days",      badge: "bg-gray-100 text-gray-500" },
            { name: t("lite") || "Lite", desc: t("planLiteDesc") || "3 trips · 25 rows", badge: "bg-blue-100 text-blue-700" },
            { name: t("pro")  || "Pro",  desc: t("planProDesc")  || "Unlimited",          badge: "bg-violet-100 text-violet-700" },
          ].map((p) => (
            <div key={p.name} className="rounded-xl border border-paper-line p-2.5">
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.badge}`}>{p.name}</span>
              <p className="mt-1 text-[10px] text-ink-muted">{p.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Need a code?{" "}
          <a href="https://wa.me/6281298053826" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-500 hover:underline">
            Chat us on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
