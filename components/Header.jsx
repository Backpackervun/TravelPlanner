"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import PlanBadge from "./PlanBadge";

// No Taiwan
const REGIONS = [
  { id: "Japan",       flag: "🇯🇵" },
  { id: "South Korea", flag: "🇰🇷" },
  { id: "Thailand",    flag: "🇹🇭" },
  { id: "Singapore",   flag: "🇸🇬" },
  { id: "Malaysia",    flag: "🇲🇾" },
  { id: "Europe",      flag: "🇪🇺" },
  { id: "Australia",   flag: "🇦🇺" },
  { id: "Indonesia",   flag: "🇮🇩" },
  { id: "Vietnam",     flag: "🇻🇳" },
  { id: "China",       flag: "🇨🇳" },
  { id: "USA",         flag: "🇺🇸" },
];

export default function Header({
  rate, onRateChange, onReset, onPreview, onHelp,
  onSave, onLoadOpen, saveStatus, hasUnsavedChanges,
  totalLocal, totalIDR, region, onRegionChange,
  rateSource, rateUpdatedAt, onRedeemOpen, plan,
  currencyMode, onCurrencyModeChange,
}) {
  const { logout, user, userProfile } = useAuth();
  const { t } = useT();
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const menuRef   = useRef(null);
  const regionRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setMenuOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target)) setRegionOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") { setMenuOpen(false); setRegionOpen(false); } };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const firstName = (() => {
    const n = userProfile?.name || user?.displayName || "";
    return n.trim().split(/\s+/)[0] || null;
  })();

  const current = REGIONS.find(r => r.id === region);

  const saveBtnCls =
    saveStatus === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
    saveStatus === "error" ? "border-red-200 bg-red-50 text-red-600" :
    "border-paper-line bg-white text-ink-soft hover:border-navy-200 hover:text-navy-500";
  const saveLabel =
    saveStatus === "saving" ? t("saving") :
    saveStatus === "saved"  ? t("saved")  :
    saveStatus === "error"  ? t("saveRetry") : t("save");

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-white">
      <div className="mx-auto max-w-[1600px] flex items-center px-3 py-2 sm:px-5 sm:gap-3">

        {/* ── BRAND ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Backpackervun" className="h-6 w-auto sm:h-7" />
          {firstName && (
            <div className="hidden md:block border-l border-paper-line pl-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted leading-none">Travel Planner</p>
              <p className="mt-0.5 text-[11px] text-navy-500 font-medium leading-none">Hi, {firstName} 👋</p>
            </div>
          )}
        </div>

        {/* ── REGION BUTTON ── */}
        <div ref={regionRef} className="relative flex-shrink-0 ml-2 sm:ml-0">
          <button
            onClick={() => setRegionOpen(v => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold transition ${
              region
                ? "border-navy-300 bg-navy-50 text-navy-600"
                : "border-paper-line bg-white text-ink-muted"
            }`}
          >
            <span className="text-sm leading-none">{current?.flag ?? "🌍"}</span>
            {/* Show region name only on sm+ to keep mobile compact */}
            <span className="hidden sm:inline">{region ?? t("region")}</span>
            <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform flex-shrink-0 ${regionOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {regionOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-52 animate-fade-in rounded-2xl border border-paper-line bg-white py-1.5 shadow-[0_12px_40px_rgba(11,60,93,0.14)]">
              {REGIONS.map(r => (
                <button key={r.id}
                  onClick={() => { onRegionChange?.(r.id); setRegionOpen(false); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-paper-dim ${
                    region === r.id ? "bg-navy-50 font-semibold text-navy-600" : "text-ink-soft"
                  }`}>
                  <span className="text-base leading-none">{r.flag}</span>
                  {r.id}
                  {region === r.id && (
                    <svg viewBox="0 0 24 24" className="ml-auto h-3.5 w-3.5 text-navy-500" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/*
          ── SPACER ──
          MOBILE FIX: on mobile (<sm) this is flex-none w-2 — just 8px of breathing room.
          On sm+ it expands to flex-1, pushing right controls to the far right as on desktop.
          This prevents the spacer from stealing space and hiding right-side buttons on mobile.
        */}
        <div className="flex-none w-2 sm:flex-1" />

        {/* ── RIGHT CONTROLS ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Totals — hidden on mobile, show sm+ */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-paper-line bg-white px-2.5 py-1.5 shadow-soft">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted leading-none">{currency.code}</p>
              <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-ink">{formatCurrency(totalLocal, currency)}</p>
            </div>
            {!isIDR && (
              <>
                <div className="h-5 w-px bg-paper-line" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-navy-400 leading-none">IDR</p>
                  <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-navy-500">{formatIDR(totalIDR)}</p>
                </div>
              </>
            )}
          </div>

          {/* Currency mode + rate — desktop xl only */}
          {!isIDR && (
            <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-paper-line bg-white px-2.5 py-1.5">
              <div className="flex gap-0.5 rounded-lg border border-paper-line bg-paper-dim p-0.5">
                <button onClick={() => onCurrencyModeChange?.("local")}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition ${currencyMode === "local" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>
                  {currency.code}
                </button>
                <button onClick={() => onCurrencyModeChange?.("idr")}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition ${currencyMode === "idr" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>
                  IDR
                </button>
              </div>
              <div className="h-4 w-px bg-paper-line" />
              <span className="text-[9px] text-ink-muted">1 {currency.code} =</span>
              <input type="number" value={rate} onChange={(e) => onRateChange(Number(e.target.value))}
                className="w-14 bg-transparent text-right font-mono text-xs font-semibold text-ink outline-none" />
              <span className="text-[9px] text-ink-muted">IDR</span>
              {rateSource === "live" && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">LIVE</span>
              )}
            </div>
          )}

          {/* Plan badge */}
          {plan && <PlanBadge plan={plan} onClick={onRedeemOpen} />}

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Save */}
          <div className="relative">
            <button onClick={onSave} disabled={saveStatus === "saving"}
              className={`no-print inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${saveBtnCls}`}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              <span className="hidden sm:inline">{saveLabel}</span>
            </button>
            {hasUnsavedChanges && saveStatus === "idle" && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            )}
          </div>

          {/* Menu */}
          <div ref={menuRef} className="relative no-print">
            <button onClick={() => setMenuOpen(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-navy-600 active:scale-[0.97]"
              aria-expanded={menuOpen}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span className="hidden sm:inline">{t("menu")}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 animate-fade-in overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_12px_40px_rgba(11,60,93,0.14)]">
                {/* Rate + currency mode on non-xl screens */}
                {!isIDR && (
                  <div className="xl:hidden border-b border-paper-line px-4 py-3 bg-paper-dim/40">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">{t("currencyMode")}</p>
                    <div className="flex gap-0.5 rounded-lg border border-paper-line bg-white p-0.5 w-fit mb-2">
                      <button onClick={() => onCurrencyModeChange?.("local")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${currencyMode === "local" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>{currency.code}</button>
                      <button onClick={() => onCurrencyModeChange?.("idr")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${currencyMode === "idr" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>IDR</button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-ink-muted">1 {currency.code} =</span>
                      <input type="number" value={rate} onChange={(e) => onRateChange(Number(e.target.value))}
                        className="w-20 rounded-lg border border-paper-line bg-white px-2 py-1 text-right font-mono text-xs font-semibold outline-none" />
                      <span className="text-[9px] text-ink-muted">IDR</span>
                      {rateSource === "live" && <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">LIVE</span>}
                    </div>
                  </div>
                )}
                <div className="py-1.5">
                  <MI icon="👁"  label={t("preview")}    onClick={() => { onPreview?.();    setMenuOpen(false); }} />
                  <MI icon="📂"  label={t("loadTrip")}   onClick={() => { onLoadOpen?.();   setMenuOpen(false); }} />
                  <MI icon="🎟️" label={t("redeemCode")}  onClick={() => { onRedeemOpen?.(); setMenuOpen(false); }} />
                  <MI icon="❓"  label={t("help")}       onClick={() => { onHelp?.();       setMenuOpen(false); }} />
                  <MI icon="↺"   label={t("reset")}      onClick={() => { onReset?.();      setMenuOpen(false); }} />
                </div>
                <div className="border-t border-paper-line py-1.5">
                  <MI icon="→" label={t("logout")} danger onClick={() => { logout(); setMenuOpen(false); }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MI({ icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-paper-dim ${danger ? "font-semibold text-red-500 hover:bg-red-50" : "text-ink-soft"}`}>
      <span className="text-base w-5 text-center leading-none">{icon}</span>
      {label}
    </button>
  );
}
