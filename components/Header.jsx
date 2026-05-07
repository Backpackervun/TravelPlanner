"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useT } from "@/context/TranslationContext";
import RegionSelector from "./RegionSelector";
import LanguageSwitcher from "./LanguageSwitcher";
import PlanBadge from "./PlanBadge";

export default function Header({
  rate, onRateChange, onReset, onPreview, onHelp,
  onSave, onLoadOpen, saveStatus, hasUnsavedChanges,
  totalLocal, totalIDR, region, onRegionChange,
  rateSource, rateUpdatedAt, onRedeemOpen, plan,
}) {
  const { logout, user, userProfile } = useAuth();
  const { t } = useT();
  const currency = getCurrency(region);
  const isIDR    = currency.code === "IDR";
  const [open, setOpen] = useState(false);

  // Body scroll lock when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  const rateTime = rateUpdatedAt
    ? new Date(rateUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  const firstName = (() => {
    const n = userProfile?.name || user?.displayName || "";
    return n.trim().split(/\s+/)[0] || null;
  })();

  const saveBtnCls =
    saveStatus === "saved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
    saveStatus === "error" ? "border-red-200 bg-red-50 text-red-600" :
    "border-paper-line bg-white text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500";
  const saveLabel =
    saveStatus === "saving" ? t("saving") :
    saveStatus === "saved"  ? t("saved")  :
    saveStatus === "error"  ? t("saveRetry") : t("save");

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-3">

          {/* Logo + greeting */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
            <div className="hidden sm:block border-l border-paper-line pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted leading-none">{t("travelPlanner")}</p>
              {firstName && <p className="mt-0.5 text-[11px] text-navy-500 font-medium leading-none">Hi, {firstName} 👋</p>}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Region — hidden on xs */}
            <div className="hidden sm:block">
              {onRegionChange && <RegionSelector variant="pill" value={region} onChange={onRegionChange} />}
            </div>

            {/* Totals */}
            <div className="flex items-center gap-2.5 rounded-lg border border-paper-line bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-soft">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{currency.code}</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-ink sm:text-sm">{formatCurrency(totalLocal, currency)}</p>
              </div>
              {!isIDR && (
                <>
                  <div className="h-5 w-px bg-paper-line" />
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-navy-400">IDR</p>
                    <p className="font-mono text-xs font-semibold tabular-nums text-navy-500 sm:text-sm">{formatIDR(totalIDR)}</p>
                  </div>
                </>
              )}
            </div>

            {/* Rate — desktop only */}
            {!isIDR && (
              <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 shadow-soft">
                <span className="text-[9px] text-ink-muted">1 {currency.code} =</span>
                <input
                  type="number" value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-14 bg-transparent text-right font-mono text-sm font-semibold text-ink outline-none"
                />
                <span className="text-[9px] text-ink-muted">IDR</span>
                {rateSource === "live" && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700" title={rateTime ? `Updated ${rateTime}` : "Live"}>LIVE</span>
                )}
                {rateSource === "error" && (
                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">OFFLINE</span>
                )}
              </div>
            )}

            {/* Plan badge */}
            {plan && <PlanBadge plan={plan} onClick={onRedeemOpen} />}

            {/* Language switcher — desktop */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Save button */}
            <div className="relative">
              <button
                onClick={onSave} disabled={saveStatus === "saving"}
                className={`no-print inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition disabled:opacity-60 ${saveBtnCls}`}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span className="hidden sm:inline">{saveLabel}</span>
              </button>
              {hasUnsavedChanges && saveStatus === "idle" && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" title={t("unsavedChanges")} />
              )}
            </div>

            {/* Menu button */}
            <button
              onClick={() => setOpen(true)}
              className="no-print inline-flex items-center gap-2 rounded-lg bg-navy-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-navy-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span className="hidden sm:inline">{t("menu")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm" onClick={close} />
          <div
            className="fixed right-0 top-0 z-50 flex flex-col bg-white shadow-2xl"
            style={{ width:"min(320px,90vw)", height:"100vh", maxHeight:"100dvh", overflowY:"auto", WebkitOverflowScrolling:"touch", overscrollBehavior:"contain", paddingBottom:"env(safe-area-inset-bottom,16px)" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-paper-line px-5 py-4 sticky top-0 bg-white z-10">
              <div>
                <p className="text-sm font-semibold text-ink">{firstName ? `Hi, ${firstName} 👋` : t("menu")}</p>
                {user?.email && <p className="text-[11px] text-ink-muted truncate max-w-[180px]">{user.email}</p>}
              </div>
              <button onClick={close} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Language in drawer */}
            <div className="border-b border-paper-line px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">{t("language")}</p>
              <LanguageSwitcher />
            </div>

            {/* Region in drawer */}
            <div className="border-b border-paper-line px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">{t("region")}</p>
              <RegionSelector variant="pill" value={region} onChange={(r) => { onRegionChange(r); }} />
            </div>

            {/* Rate in drawer */}
            {!isIDR && (
              <div className="border-b border-paper-line px-5 py-3 bg-paper-dim/40">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">Rate: 1 {currency.code} =</p>
                <div className="flex items-center gap-2">
                  <input type="number" value={rate} onChange={(e) => onRateChange(Number(e.target.value))}
                    className="w-24 rounded-lg border border-paper-line bg-white px-2 py-1 text-right font-mono text-sm font-semibold outline-none focus:border-accent-300" />
                  <span className="text-xs text-ink-muted">IDR</span>
                  {rateSource === "live" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">LIVE</span>}
                  {rateSource === "error" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">OFFLINE</span>}
                </div>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 px-2 py-2">
              <DItem icon="👁" label={t("preview")}   onClick={() => { onPreview?.(); close(); }} />
              <DItem icon="📂" label={t("loadTrip")}  onClick={() => { onLoadOpen?.(); close(); }} />
              <DItem icon="🎟️" label={t("redeemCode")} onClick={() => { onRedeemOpen?.(); close(); }} />
              <DItem icon="❓" label={t("help")}      onClick={() => { onHelp?.(); close(); }} />
              <DItem icon="↺"  label={t("reset")}     onClick={() => { onReset?.(); close(); }} />
            </nav>

            {/* Logout */}
            <div className="border-t border-paper-line px-2 py-2">
              <DItem icon="→" label={t("logout")} danger onClick={() => { logout(); close(); }} />
            </div>
          </div>
        </>
      )}
    </header>
  );
}

function DItem({ icon, label, onClick, danger }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition hover:bg-paper-dim active:scale-[0.98] ${danger ? "text-red-500 hover:bg-red-50" : "text-ink-soft"}`}
      style={{ minHeight: "48px" }}>
      <span className="text-lg leading-none w-6 text-center flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}
