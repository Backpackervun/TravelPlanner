"use client";

import { useEffect, useRef, useState } from "react";
import { redeemCode } from "@/lib/firestore";
import { useAuth } from "@/context/AuthProvider";

export default function RedeemModal({ open, onClose, onSuccess }) {
  const { user, refreshPlan } = useAuth();
  const [code, setCode]       = useState("");
  const [status, setStatus]   = useState("idle"); // idle|loading|success|error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setCode(""); setStatus("idle"); setMessage(""); setTimeout(() => inputRef.current?.focus(), 80); }
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
    try {
      const result = await redeemCode(user.uid, code.trim());
      await refreshPlan();
      setStatus("success");
      setMessage(`🎉 Plan activated! You now have ${result.plan} access.`);
      setTimeout(() => { onSuccess?.(result); onClose?.(); }, 1800);
    } catch (err) {
      setStatus("error");
      setMessage(err.message ?? "Invalid code.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card animate-fade-in">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">🎟️</span>
          <h2 className="mt-3 text-xl font-semibold text-ink">Enter Redeem Code</h2>
          <p className="mt-1 text-sm text-ink-muted">Activate Lite or Pro plan instantly.</p>
        </div>

        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); setMessage(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
            placeholder="e.g. BE-3DAYSTRIAL"
            className="w-full rounded-xl border border-paper-line bg-paper-dim px-4 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.12em] text-ink outline-none transition focus:border-accent-300 focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
          />

          {message && (
            <div className={`rounded-lg px-3 py-2.5 text-xs font-medium text-center ${
              status === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={!code.trim() || status === "loading" || status === "success"}
            className="w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:opacity-60"
          >
            {status === "loading" ? "Checking…" : status === "success" ? "Activated! ✓" : "Apply Code"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Need a code? <a href="https://wa.me/6281298053826" target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-500 hover:underline">Chat us on WhatsApp</a>
        </p>
      </div>
    </div>
  );
}
