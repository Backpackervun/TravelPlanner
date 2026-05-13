"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, formatIDR, getCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "./LanguageSwitcher";
import PlanBadge from "./PlanBadge";

// ─────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────

const REGIONS = [
  { id: "Japan", flag: "🇯🇵" },
  { id: "South Korea", flag: "🇰🇷" },
  { id: "Thailand", flag: "🇹🇭" },
  { id: "Singapore", flag: "🇸🇬" },
  { id: "Malaysia", flag: "🇲🇾" },
  { id: "Europe", flag: "🇪🇺" },
  { id: "Australia", flag: "🇦🇺" },
  { id: "Indonesia", flag: "🇮🇩" },
  { id: "Vietnam", flag: "🇻🇳" },
  { id: "China", flag: "🇨🇳" },
  { id: "USA", flag: "🇺🇸" },
];

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
}) {
  const { logout, user, userProfile } = useAuth();
  const { t } = useT();

  const currency = getCurrency(region);
  const isIDR = currency.code === "IDR";

  const [menuOpen, setMenuOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const menuRef = useRef(null);
  const regionRef = useRef(null);

  // ─────────────────────────────────────────────
  // CLOSE DROPDOWN
  // ─────────────────────────────────────────────

  useEffect(() => {
    const fn = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }

      if (
        regionRef.current &&
        !regionRef.current.contains(e.target)
      ) {
        setRegionOpen(false);
      }
    };

    document.addEventListener("mousedown", fn);

    return () =>
      document.removeEventListener(
        "mousedown",
        fn
      );
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setRegionOpen(false);
      }
    };

    document.addEventListener("keydown", fn);

    return () =>
      document.removeEventListener(
        "keydown",
        fn
      );
  }, []);

  // ─────────────────────────────────────────────
  // USER
  // ─────────────────────────────────────────────

  const firstName = (() => {
    const n =
      userProfile?.name ||
      user?.displayName ||
      "";

    return (
      n.trim().split(/\s+/)[0] || null
    );
  })();

  const current = REGIONS.find(
    (r) => r.id === region
  );

  // ─────────────────────────────────────────────
  // SAVE BUTTON
  // ─────────────────────────────────────────────

  const saveBtnCls =
    saveStatus === "saved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : saveStatus === "error"
      ? "border-red-200 bg-red-50 text-red-600"
      : "border-paper-line bg-white text-ink-soft hover:border-navy-200 hover:text-navy-500";

  const saveLabel =
    saveStatus === "saving"
      ? t("saving")
      : saveStatus === "saved"
      ? t("saved")
      : saveStatus === "error"
      ? t("saveRetry")
      : t("save");

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <header className="page-header sticky top-0 z-30 border-b border-paper-line bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center px-3 py-2 sm:gap-3 sm:px-5">

        {/* ───────────────── BRAND ───────────────── */}

        <div className="flex flex-shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="Backpackervun"
            className="h-6 w-auto sm:h-7"
          />

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

        {/* ───────────────── MOBILE MENU ───────────────── */}

        <div className="ml-auto flex items-center gap-2 sm:hidden">

          {/* PLAN BADGE */}

          {plan && (
            <PlanBadge
              plan={plan}
              onClick={onRedeemOpen}
            />
          )}

          {/* MOBILE DROPDOWN */}

          <div
            ref={menuRef}
            className="relative"
          >

            <button
              onClick={() =>
                setMenuOpen((v) => !v)
              }
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-navy-500
                p-2.5
                text-white
                shadow
                transition
                hover:bg-navy-600
              "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                />
                <line
                  x1="3"
                  y1="12"
                  x2="21"
                  y2="12"
                />
                <line
                  x1="3"
                  y1="18"
                  x2="21"
                  y2="18"
                />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+8px)]
                  z-50
                  w-72
                  overflow-hidden
                  rounded-2xl
                  border
                  border-paper-line
                  bg-white
                  shadow-[0_12px_40px_rgba(11,60,93,0.14)]
                "
              >

                {/* REGION */}

                <div className="border-b border-paper-line p-4">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Region
                  </p>

                  <div className="grid grid-cols-2 gap-2">

                    {REGIONS.map((r) => (

                      <button
                        key={r.id}
                        onClick={() => {
                          onRegionChange?.(
                            r.id
                          );

                          setMenuOpen(false);
                        }}
                        className={`
                          rounded-xl
                          border
                          px-2
                          py-2
                          text-xs
                          font-semibold
                          transition
                          ${
                            region === r.id
                              ? "border-navy-300 bg-navy-50 text-navy-600"
                              : "border-paper-line bg-white text-ink-soft"
                          }
                        `}
                      >
                        {r.flag} {r.id}
                      </button>

                    ))}

                  </div>

                </div>

                {/* LANGUAGE */}

                <div className="border-b border-paper-line p-4">

                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Language
                  </p>

                  <LanguageSwitcher />

                </div>

                {/* RATE */}

                {!isIDR && (
                  <div className="border-b border-paper-line bg-paper-dim/40 p-4">

                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {t("currencyMode")}
                    </p>

                    <div className="mb-3 flex gap-1 rounded-lg border border-paper-line bg-white p-1 w-fit">

                      <button
                        onClick={() =>
                          onCurrencyModeChange?.(
                            "local"
                          )
                        }
                        className={`rounded-md px-3 py-1 text-[10px] font-bold transition ${
                          currencyMode ===
                          "local"
                            ? "bg-navy-500 text-white"
                            : "text-ink-muted"
                        }`}
                      >
                        {currency.code}
                      </button>

                      <button
                        onClick={() =>
                          onCurrencyModeChange?.(
                            "idr"
                          )
                        }
                        className={`rounded-md px-3 py-1 text-[10px] font-bold transition ${
                          currencyMode ===
                          "idr"
                            ? "bg-navy-500 text-white"
                            : "text-ink-muted"
                        }`}
                      >
                        IDR
                      </button>

                    </div>

                    <div className="flex items-center gap-2">

                      <span className="text-[10px] text-ink-muted">
                        1 {currency.code}
                      </span>

                      <input
                        type="number"
                        value={rate}
                        onChange={(e) =>
                          onRateChange(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="
                          w-20
                          rounded-lg
                          border
                          border-paper-line
                          bg-white
                          px-2
                          py-1
                          text-right
                          font-mono
                          text-xs
                          font-semibold
                          outline-none
                        "
                      />

                      <span className="text-[10px] text-ink-muted">
                        IDR
                      </span>

                    </div>

                  </div>
                )}

                {/* ACTIONS */}

                <div className="py-2">

                  <MI
                    icon="💾"
                    label={saveLabel}
                    onClick={() => {
                      onSave?.();
                      setMenuOpen(false);
                    }}
                  />

                  <MI
                    icon="👁"
                    label={t("preview")}
                    onClick={() => {
                      onPreview?.();
                      setMenuOpen(false);
                    }}
                  />

                  <MI
                    icon="📂"
                    label={t("loadTrip")}
                    onClick={() => {
                      onLoadOpen?.();
                      setMenuOpen(false);
                    }}
                  />

                  <MI
                    icon="🎟️"
                    label={t("redeemCode")}
                    onClick={() => {
                      onRedeemOpen?.();
                      setMenuOpen(false);
                    }}
                  />

                  <MI
                    icon="❓"
                    label={t("help")}
                    onClick={() => {
                      onHelp?.();
                      setMenuOpen(false);
                    }}
                  />

                  <MI
                    icon="↺"
                    label={t("reset")}
                    onClick={() => {
                      onReset?.();
                      setMenuOpen(false);
                    }}
                  />

                </div>

                {/* LOGOUT */}

                <div className="border-t border-paper-line py-2">

                  <MI
                    icon="→"
                    label={t("logout")}
                    danger
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  />

                </div>

              </div>
            )}

          </div>

        </div>

        {/* ───────────────── DESKTOP ───────────────── */}

        <div className="hidden flex-1 items-center justify-end gap-1.5 sm:flex">

          {/* REGION */}

          <div
            ref={regionRef}
            className="relative"
          >

            <button
              onClick={() =>
                setRegionOpen((v) => !v)
              }
              className={`
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                px-3
                py-2
                text-xs
                font-semibold
                transition
                ${
                  region
                    ? "border-navy-300 bg-navy-50 text-navy-600"
                    : "border-paper-line bg-white text-ink-muted"
                }
              `}
            >

              <span className="text-base leading-none">
                {current?.flag ?? "🌍"}
              </span>

              <span>
                {region ??
                  t("region")}
              </span>

              <svg
                viewBox="0 0 24 24"
                className={`h-3 w-3 transition-transform ${
                  regionOpen
                    ? "rotate-180"
                    : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>

            </button>

            {regionOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-52 animate-fade-in rounded-2xl border border-paper-line bg-white py-1.5 shadow-[0_12px_40px_rgba(11,60,93,0.14)]">

                {REGIONS.map((r) => (

                  <button
                    key={r.id}
                    onClick={() => {
                      onRegionChange?.(
                        r.id
                      );

                      setRegionOpen(
                        false
                      );
                    }}
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      text-sm
                      transition
                      hover:bg-paper-dim
                      ${
                        region === r.id
                          ? "bg-navy-50 font-semibold text-navy-600"
                          : "text-ink-soft"
                      }
                    `}
                  >

                    <span className="text-base leading-none">
                      {r.flag}
                    </span>

                    {r.id}

                  </button>

                ))}

              </div>
            )}

          </div>

          {/* TOTAL */}

          <div className="flex items-center gap-2 rounded-xl border border-paper-line bg-white px-2.5 py-1.5 shadow-soft">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-muted leading-none">
                {currency.code}
              </p>

              <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-ink">
                {formatCurrency(
                  totalLocal,
                  currency
                )}
              </p>
            </div>

            {!isIDR && (
              <>
                <div className="h-5 w-px bg-paper-line" />

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-navy-400 leading-none">
                    IDR
                  </p>

                  <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-navy-500">
                    {formatIDR(
                      totalIDR
                    )}
                  </p>
                </div>
              </>
            )}

          </div>

          {/* LANGUAGE */}

          <LanguageSwitcher />

          {/* PLAN */}

          {plan && (
            <PlanBadge
              plan={plan}
              onClick={onRedeemOpen}
            />
          )}

          {/* SAVE */}

          <div className="relative">

            <button
              onClick={onSave}
              disabled={
                saveStatus ===
                "saving"
              }
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-xl
                border
                px-3
                py-1.5
                text-xs
                font-semibold
                transition
                disabled:opacity-60
                ${saveBtnCls}
              `}
            >

              💾

              <span>
                {saveLabel}
              </span>

            </button>

            {hasUnsavedChanges &&
              saveStatus ===
                "idle" && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
              )}

          </div>

          {/* DESKTOP MENU */}

          <div
            ref={menuRef}
            className="relative"
          >

            <button
              onClick={() =>
                setMenuOpen((v) => !v)
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-navy-500
                px-3
                py-1.5
                text-xs
                font-semibold
                text-white
                shadow
                transition
                hover:bg-navy-600
              "
            >
              ☰ {t("menu")}
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// MENU ITEM
// ─────────────────────────────────────────────

function MI({
  icon,
  label,
  onClick,
  danger,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-3
        px-4
        py-3
        text-sm
        transition
        hover:bg-paper-dim
        ${
          danger
            ? "font-semibold text-red-500 hover:bg-red-50"
            : "text-ink-soft"
        }
      `}
    >

      <span className="w-5 text-center text-base leading-none">
        {icon}
      </span>

      {label}

    </button>
  );
}