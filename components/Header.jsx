"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import PlanBadge from "./PlanBadge";

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
  { id: "Taiwan",      flag: "🇹🇼" },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  const firstName = (() => {
    const n = userProfile?.name || user?.displayName || "";
    return n.trim().split(/\s+/)[0] || null;
  })();

  const saveBtnCls =
    saveStatus === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
    saveStatus === "error" ? "border-red-200 bg-red-50 text-red-600" :
    "border-paper-line bg-white text-ink-soft hover:border-navy-200 hover:text-navy-500";
  const saveLabel =
    saveStatus === "saving" ? t("saving") :
    saveStatus === "saved"  ? t("saved") :
    saveStatus === "error"  ? t("saveRetry") : t("save");

  return (
    /* ✅ SOLID WHITE — bg-white, no backdrop-blur, no transparency */
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-white">
      <div className="mx-auto max-w-[1600px] flex items-center gap-2 px-4 py-2 sm:px-5">

        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0 min-w-0">
          <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto flex-shrink-0" />
          {firstName && (
            <div className="hidden md:block border-l border-paper-line pl-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted leading-none">Travel Planner</p>
              <p className="mt-0.5 text-[11px] text-navy-500 font-medium leading-none">Hi, {firstName} 👋</p>
            </div>
          )}
        </div>

        {/* ✅ REGION PILLS — horizontal scrollable strip, no dropdown */}
        <div
          className="flex-1 min-w-0 overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex items-center gap-1.5 py-0.5 px-1" style={{ width: "max-content" }}>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => onRegionChange?.(r.id)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition whitespace-nowrap flex-shrink-0 ${
                  region === r.id
                    ? "border-navy-400 bg-navy-50 text-navy-600 font-semibold"
                    : "border-paper-line bg-white text-ink-muted hover:border-navy-200 hover:text-navy-500"
                }`}
              >
                <span className="text-sm leading-none">{r.flag}</span>
                <span className="hidden sm:inline text-xs">{r.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side: totals, rate, lang, save, menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Totals pill */}
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

          {/* Currency mode + rate — desktop only */}
          {!isIDR && (
            <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-paper-line bg-white px-2.5 py-1.5">
              {/* Toggle */}
              <div className="flex items-center gap-0.5 rounded-lg border border-paper-line bg-paper-dim p-0.5">
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

          {plan && <PlanBadge plan={plan} onClick={onRedeemOpen} />}
          <LanguageSwitcher />

          {/* Save */}
          <div className="relative">
            <button onClick={onSave} disabled={saveStatus === "saving"}
              className={`no-print inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${saveBtnCls}`}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              className="inline-flex items-center gap-2 rounded-xl bg-navy-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-navy-600 active:scale-[0.97]"
              aria-expanded={menuOpen}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span className="hidden sm:inline">{t("menu")}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 origin-top-right animate-fade-in overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_12px_40px_rgba(11,60,93,0.14)]" role="menu">
                {/* Rate on mobile */}
                {!isIDR && (
                  <div className="xl:hidden border-b border-paper-line px-4 py-3 bg-paper-dim/40">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">{t("currencyMode")}</p>
                    <div className="flex gap-1 mb-2">
                      <div className="flex gap-0.5 rounded-lg border border-paper-line bg-white p-0.5">
                        <button onClick={() => onCurrencyModeChange?.("local")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${currencyMode === "local" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>{currency.code}</button>
                        <button onClick={() => onCurrencyModeChange?.("idr")} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${currencyMode === "idr" ? "bg-navy-500 text-white" : "text-ink-muted"}`}>IDR</button>
                      </div>
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
                  <MI icon="👁"  label={t("preview")}   onClick={() => { onPreview?.(); close(); }} />
                  <MI icon="📂"  label={t("loadTrip")}  onClick={() => { onLoadOpen?.(); close(); }} />
                  <MI icon="🎟️" label={t("redeemCode")} onClick={() => { onRedeemOpen?.(); close(); }} />
                  <MI icon="❓"  label={t("help")}      onClick={() => { onHelp?.(); close(); }} />
                  <MI icon="↺"   label={t("reset")}     onClick={() => { onReset?.(); close(); }} />
                </div>
                <div className="border-t border-paper-line py-1.5">
                  <MI icon="→" label={t("logout")} danger onClick={() => { logout(); close(); }} />
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
    <button type="button" onClick={onClick} role="menuitem"
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-paper-dim ${danger ? "font-semibold text-red-500 hover:bg-red-50" : "text-ink-soft"}`}>
      <span className="text-base w-5 text-center leading-none">{icon}</span>
      {label}
    </button>
  );
}
