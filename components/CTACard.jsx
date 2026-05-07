"use client";

import { useState } from "react";
import { useT } from "@/context/TranslationContext";

const WA_NUMBER = "6281298053826";

// ── Desktop card (shown in sidebar) ──────────────────────────────────────────

export function CTACard({ tripInfo, totalLocal, currency, totalIDR }) {
  const { t } = useT();

  const buildMessage = () => {
    const dest   = tripInfo?.destinations || "-";
    const dates  = tripInfo?.travelDates  || "-";
    const budget = totalLocal > 0
      ? `${currency?.symbol ?? ""}${totalLocal.toLocaleString()} ${currency?.code ?? ""} (≈ Rp ${(totalIDR ?? 0).toLocaleString("id-ID")})`
      : "-";
    return encodeURIComponent(
      `Hi Backpackervun,\n\nI just created a trip using the Travel Planner.\n\nDestination: ${dest}\nTravel Dates: ${dates}\nBudget: ${budget}\n\nCan you help arrange this trip? 🙏`
    );
  };

  const waUrl     = `https://wa.me/${WA_NUMBER}?text=${buildMessage()}`;
  const customUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Backpackervun, I'd like to request a custom trip itinerary 🙏")}`;

  const services = ["serviceHotels","serviceTransport","serviceFlights","serviceVisa","serviceItinerary","serviceArrangement"];

  return (
    <div className="no-print rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-50 via-white to-accent-50/40 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🌏</span>
        <div>
          <h3 className="text-sm font-semibold text-ink leading-tight">{t("needHelp")}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">Backpackervun can handle everything.</p>
        </div>
      </div>

      <ul className="mt-3.5 space-y-1">
        {services.map((k) => (
          <li key={k} className="flex items-center gap-1.5 text-xs text-ink-soft">
            {t(k)}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(37,211,102,0.35)] transition hover:bg-[#20BB5A] active:scale-[0.98]"
        >
          <WAIcon />
          {t("chatWA")}
        </a>
        <a
          href={customUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-500 transition hover:bg-navy-50 active:scale-[0.98]"
        >
          {t("requestTrip")}
        </a>
      </div>
      <p className="mt-2.5 text-center text-[10px] text-ink-muted">{t("freeConsult")}</p>
    </div>
  );
}

// ── Mobile FAB (Floating Action Button) ──────────────────────────────────────
// Shown only on mobile (< md). Fixed bottom-right. Tap to open action sheet.

export function CTAFab({ tripInfo, totalLocal, currency, totalIDR }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi Backpackervun! I just planned a trip to ${tripInfo?.destinations || "—"} and need help arranging it 🙏`
  )}`;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Action sheet */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 w-64 rounded-2xl border border-paper-line bg-white p-4 shadow-card animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-3 text-xs font-semibold text-ink-muted uppercase tracking-[0.14em]">
            {t("needHelp")}
          </p>
          <div className="space-y-2">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20BB5A]">
              <WAIcon />{t("chatWA")}
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi Backpackervun, I'd like to request a custom trip 🙏")}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl border border-navy-200 px-3 py-2.5 text-sm font-semibold text-navy-500 transition hover:bg-navy-50">
              🗺️ {t("requestTrip")}
            </a>
            <a href="https://instagram.com/backpackervun" target="_blank" rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl border border-paper-line px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-paper-dim">
              📸 Instagram
            </a>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition hover:bg-[#20BB5A] active:scale-95"
        aria-label="Get help"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {open
          ? <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          : <WAIcon size={24} />
        }
      </button>
    </>
  );
}

// ── Default export = desktop card ────────────────────────────────────────────
export default CTACard;

// ── Helpers ───────────────────────────────────────────────────────────────────
function WAIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} className="fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
