"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useT } from "@/context/TranslationContext";
import { getPlanFeatures, UPGRADE_REASONS } from "@/lib/plans";
import LanguageSwitcher from "./LanguageSwitcher";
import PlanBadge from "./PlanBadge";

// ─────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

export default function Header({
  rate,
  onRateChange,
  onReset,
  onPreview,
  onHelp,
  onSave,
  onLoadOpen,
  saveStatus,
  hasUnsavedChanges,
  totalLocal,
  totalIDR,
  region,
  onRegionChange,
  rateSource,
  rateUpdatedAt,
  onRedeemOpen,
  plan,
  currencyMode,
  onCurrencyModeChange,
  // Export / Import / Duplicate
  onExportBvntrip,
  onImportOpen,
  onDuplicate,
  // ✅ NEW: called when user hits a gated feature — shows UpgradeModal
  onUpgradeNeeded,
}) {
  const { logout, user, userProfile } = useAuth();
  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  // ✅ Compute all feature flags from plan — single source of truth
  const features = getPlanFeatures(plan);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const menuRef   = useRef(null);
  const regionRef = useRef(null);

  // Close dropdowns on outside click / ESC
  useEffect(() => {
    const fn = (e) => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setMenuOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target)) setRegionOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { setMenuOpen(false); setRegionOpen(false); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  // ── Helpers ───────────────────────────────

  const firstName = (() => {
    const n = userProfile?.name || user?.displayName || "";
    return n.trim().split(/\s+/)[0] || null;
  })();

  const current = REGIONS.find((r) => r.id === region);

  const saveBtnCls =
    saveStatus === "saved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : saveStatus === "error"
      ? "border-red-200 bg-red-50 text-red-600"
      : "border-paper-line bg-white text-ink-soft hover:border-navy-200 hover:text-navy-500";

  const saveLabel =
    saveStatus === "saving" ? t("saving")    :
    saveStatus === "saved"  ? t("saved")     :
    saveStatus === "error"  ? t("saveRetry") :
    t("save");

  /**
   * Creates a gated action handler.
   * If the user has the feature → run the real handler.
   * If not → call onUpgradeNeeded with the reason string.
   */
  const gate = (featureKey, handler) => () => {
    if (features[featureKey]) {
      handler?.();
    } else {
      onUpgradeNeeded?.(UPGRADE_REASONS[featureKey] ?? "Upgrade your plan to unlock this feature.");
    }
  };

  // ── Gated handlers (used in both desktop & mobile menus) ─────────────────

  const handleLoad         = gate("canLoad",          onLoadOpen);
  const handleExportPDF    = gate("canExportPDF",     onPreview);
  const handleExportBvn    = gate("canExportBvntrip", onExportBvntrip);
  const handleImport       = gate("canImportBvntrip", onImportOpen);

  // ── Shared props for both menus ───────────────────────────────────────────

  const sharedMenuProps = {
    region, onRegionChange,
    isIDR, currency, currencyMode, onCurrencyModeChange,
    rate, onRateChange, rateSource,
    saveLabel, onSave, onPreview,
    handleLoad, handleExportPDF, handleExportBvn, handleImport,
    onRedeemOpen, onHelp, onReset, logout, t,
    features, plan,
  };

  // ── Render ────────────────────────────────

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center px-3 py-2 sm:gap-3 sm:px-5">

        {/* ── BRAND ── */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <img src="/logo.png" alt="Backpackervun" className="h-6 w-auto sm:h-7" />
          {firstName && (
            <div className="hidden border-l border-paper-line pl-2.5 md:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted leading-none">
                Travel Planner
              </p>
              <p className="mt-0.5 text-[11px] font-medium leading-none text-navy-500">
                Hi, {firstName} 👋
              </p>
            </div>
          )}
        </div>

        {/* ══ MOBILE (hidden on sm+) ══ */}
        <div className="ml-auto flex items-center gap-2 sm:hidden">
          {plan && <PlanBadge plan={plan} onClick={onRedeemOpen} />}
          <MobileMenu {...sharedMenuProps} />
        </div>

        {/* ══ DESKTOP (hidden below sm) ══ */}
        <div className="hidden flex-1 items-center justify-end gap-1.5 sm:flex">

          {/* Region picker */}
          <div ref={regionRef} className="relative">
            <button
              onClick={() => setRegionOpen((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                region
                  ? "border-navy-300 bg-navy-50 text-navy-600"
                  : "border-paper-line bg-white text-ink-muted"
              }`}
            >
              <span className="text-base leading-none">{current?.flag ?? "🌍"}</span>
              <span>{region ?? t("region")}</span>
              <svg
                viewBox="0 0 24 24"
                className={`h-3 w-3 transition-transform ${regionOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {regionOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_12px_40px_rgba(11,60,93,0.14)]">
                <div className="p-3 grid grid-cols-2 gap-1.5">
                  {REGIONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { onRegionChange?.(r.id); setRegionOpen(false); }}
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                        region === r.id
                          ? "border-navy-300 bg-navy-50 text-navy-600"
                          : "border-paper-line bg-white text-ink-soft hover:bg-paper-dim"
                      }`}
                    >
                      {r.flag} {r.id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language */}
          <LanguageSwitcher />

          {/* Plan badge */}
          {plan && <PlanBadge plan={plan} onClick={onRedeemOpen} />}

          {/* Save */}
          <button
            onClick={onSave}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${saveBtnCls}`}
          >
            {saveStatus === "saving"
              ? <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            }
            {saveLabel}
          </button>

          {/* Currency rate (non-IDR only) */}
          {!isIDR && (
            <div className="flex items-center gap-1.5 rounded-xl border border-paper-line bg-paper-dim/60 px-3 py-2">
              <div className="flex gap-0.5 rounded-md border border-paper-line bg-white p-0.5">
                <button
                  onClick={() => onCurrencyModeChange?.("local")}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${currencyMode === "local" ? "bg-navy-500 text-white" : "text-ink-muted"}`}
                >
                  {currency.code}
                </button>
                <button
                  onClick={() => onCurrencyModeChange?.("idr")}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${currencyMode === "idr" ? "bg-navy-500 text-white" : "text-ink-muted"}`}
                >
                  IDR
                </button>
              </div>
              <input
                type="number" value={rate}
                onChange={(e) => onRateChange(Number(e.target.value))}
                className="w-20 rounded-lg border border-paper-line bg-white px-2 py-1 text-right font-mono text-xs font-semibold outline-none focus:border-accent-300"
              />
              <span className="text-[10px] text-ink-muted">IDR</span>
              {rateSource === "live" && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">LIVE</span>
              )}
            </div>
          )}

          {/* ⋯ Desktop hamburger menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl bg-navy-500 p-2.5 text-white shadow transition hover:bg-navy-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_12px_40px_rgba(11,60,93,0.14)]">

                {/* View & manage */}
                <div className="py-1.5">
                  <MI icon="👁"  label={t("preview")}  onClick={() => { onPreview?.();  setMenuOpen(false); }} />
                  <MI icon="📂"  label={t("loadTrip")}
                    locked={!features.canLoad}
                    lockLabel="Lite+"
                    onClick={() => { handleLoad(); setMenuOpen(false); }}
                  />
                </div>

                {/* Export */}
                <div className="border-t border-paper-line/60 py-1.5">
                  <p className="px-4 pt-1 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Export
                  </p>
                  <MI icon="📄" label="Export PDF"
                    locked={!features.canExportPDF}
                    lockLabel="Pro"
                    onClick={() => { handleExportPDF(); setMenuOpen(false); }}
                  />
                  <MI icon="📦" label="Export .bvntrip"
                    locked={!features.canExportBvntrip}
                    lockLabel="Pro"
                    onClick={() => { handleExportBvn(); setMenuOpen(false); }}
                  />
                </div>

                {/* Import & Clone */}
                <div className="border-t border-paper-line/60 py-1.5">
                  <p className="px-4 pt-1 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Import
                  </p>
                  <MI icon="📥" label="Import .bvntrip"
                    locked={!features.canImportBvntrip}
                    lockLabel="Pro"
                    onClick={() => { handleImport(); setMenuOpen(false); }}
                  />
                </div>

                {/* Tools */}
                <div className="border-t border-paper-line/60 py-1.5">
                  <MI icon="🎟️" label={t("redeemCode")} onClick={() => { onRedeemOpen?.(); setMenuOpen(false); }} />
                  <MI icon="❓"  label={t("help")}       onClick={() => { onHelp?.();       setMenuOpen(false); }} />
                  <MI icon="↺"   label={t("reset")}      onClick={() => { onReset?.();      setMenuOpen(false); }} />
                </div>

                {/* Logout */}
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

// ─────────────────────────────────────────────
// MOBILE MENU — self-contained with own state
// ─────────────────────────────────────────────

function MobileMenu({
  region, onRegionChange, isIDR, currency, currencyMode, onCurrencyModeChange,
  rate, onRateChange, rateSource,
  saveLabel, onSave, onPreview,
  handleLoad, handleExportPDF, handleExportBvn, handleImport,
  onRedeemOpen, onHelp, onReset,
  logout, t, features, plan,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-xl bg-navy-500 p-2.5 text-white shadow transition hover:bg-navy-600"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-2xl border border-paper-line bg-white shadow-[0_12px_40px_rgba(11,60,93,0.14)]">

          {/* Region grid */}
          <div className="border-b border-paper-line p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Region</p>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { onRegionChange?.(r.id); setOpen(false); }}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    region === r.id
                      ? "border-navy-300 bg-navy-50 text-navy-600"
                      : "border-paper-line bg-white text-ink-soft"
                  }`}
                >
                  {r.flag} {r.id}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="border-b border-paper-line p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Language</p>
            <LanguageSwitcher />
          </div>

          {/* Currency mode + rate */}
          {!isIDR && (
            <div className="border-b border-paper-line bg-paper-dim/40 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{t("currencyMode")}</p>
              <div className="mb-3 flex gap-1 rounded-lg border border-paper-line bg-white p-1 w-fit">
                <button
                  onClick={() => onCurrencyModeChange?.("local")}
                  className={`rounded-md px-3 py-1 text-[10px] font-bold transition ${currencyMode === "local" ? "bg-navy-500 text-white" : "text-ink-muted"}`}
                >
                  {currency.code}
                </button>
                <button
                  onClick={() => onCurrencyModeChange?.("idr")}
                  className={`rounded-md px-3 py-1 text-[10px] font-bold transition ${currencyMode === "idr" ? "bg-navy-500 text-white" : "text-ink-muted"}`}
                >
                  IDR
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink-muted">1 {currency.code}</span>
                <input
                  type="number" value={rate}
                  onChange={(e) => onRateChange(Number(e.target.value))}
                  className="w-20 rounded-lg border border-paper-line bg-white px-2 py-1 text-right font-mono text-xs font-semibold outline-none"
                />
                <span className="text-[10px] text-ink-muted">IDR</span>
                {rateSource === "live" && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">LIVE</span>
                )}
              </div>
            </div>
          )}

          {/* Core actions */}
          <div className="py-2">
            <MI icon="💾" label={saveLabel}    onClick={() => { onSave?.();    setOpen(false); }} />
            <MI icon="👁" label={t("preview")} onClick={() => { onPreview?.(); setOpen(false); }} />
            <MI
              icon="📂" label={t("loadTrip")}
              locked={!features.canLoad}
              lockLabel="Lite+"
              onClick={() => { handleLoad(); setOpen(false); }}
            />
          </div>

          {/* Export / Import */}
          <div className="border-t border-paper-line/60 py-2">
            <p className="px-4 pt-1 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Export / Import</p>
            <MI
              icon="📄" label="Export PDF"
              locked={!features.canExportPDF}
              lockLabel="Pro"
              onClick={() => { handleExportPDF(); setOpen(false); }}
            />
            <MI
              icon="📦" label="Export .bvntrip"
              locked={!features.canExportBvntrip}
              lockLabel="Pro"
              onClick={() => { handleExportBvn(); setOpen(false); }}
            />
            <MI
              icon="📥" label="Import .bvntrip"
              locked={!features.canImportBvntrip}
              lockLabel="Pro"
              onClick={() => { handleImport(); setOpen(false); }}
            />
          </div>

          <div className="border-t border-paper-line/60 py-2">
            <MI icon="🎟️" label={t("redeemCode")} onClick={() => { onRedeemOpen?.(); setOpen(false); }} />
            <MI icon="❓"  label={t("help")}       onClick={() => { onHelp?.();       setOpen(false); }} />
            <MI icon="↺"   label={t("reset")}      onClick={() => { onReset?.();      setOpen(false); }} />
          </div>

          <div className="border-t border-paper-line py-2">
            <MI icon="→" label={t("logout")} danger onClick={() => { logout(); setOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MENU ITEM — supports locked state
// ─────────────────────────────────────────────

/**
 * @param {string}  icon
 * @param {string}  label
 * @param {fn}      onClick
 * @param {boolean} danger     — red text
 * @param {boolean} locked     — shows 🔒 badge + muted style
 * @param {string}  lockLabel  — badge text shown when locked, e.g. "Pro"
 */
function MI({ icon, label, onClick, danger, locked, lockLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
        danger
          ? "font-semibold text-red-500 hover:bg-red-50"
          : locked
          ? "text-ink-muted/60 hover:bg-paper-dim"
          : "text-ink-soft hover:bg-paper-dim"
      }`}
    >
      <span className="w-5 text-center text-base leading-none">
        {locked ? "🔒" : icon}
      </span>
      <span className={locked ? "line-through decoration-ink-muted/40" : ""}>{label}</span>
      {locked && lockLabel && (
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">
          {lockLabel}
        </span>
      )}
    </button>
  );
}
