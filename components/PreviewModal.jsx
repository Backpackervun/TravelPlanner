"use client";

import { useEffect } from "react";
import { useT } from "@/context/TranslationContext";
import {
  formatCurrency, formatIDR, getCurrency, getRegion,
  CATEGORY_ICONS, CATEGORY_OPTIONS, CATEGORY_STYLES,
} from "@/lib/utils";
import { groupByDay, formatDayLabel, formatTimeLabel } from "@/lib/itinerary";

export default function PreviewModal({
  open, onClose, tripInfo, rows, dayMap,
  region, rate, totalLocal, totalIDR,
  canExportPDF, onUpgradeNeeded,
}) {
  const { t }      = useT();
  const currency   = getCurrency(region);
  const regionMeta = getRegion(region);
  const showIDR    = currency.code !== "IDR";
  const days       = groupByDay(rows, dayMap);
  const stopsCount = rows.length;

  const categoryTotals = CATEGORY_OPTIONS.map((name) => ({
    name,
    local: rows.filter(r => r.category === name).reduce((s, r) => s + (Number(r.budgetLocal)||0), 0),
    color: CATEGORY_STYLES[name]?.bar,
  }));

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

  const handleExport = () => {
    if (!canExportPDF) { onUpgradeNeeded?.("PDF export requires a Lite or Pro plan."); return; }
    window.print();
  };

  return (
    <div className="preview-modal-root fixed inset-0 z-[500] flex flex-col" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md" />

      {/* Action bar */}
      <div className="preview-modal-bar relative z-10 flex-shrink-0 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0f172a]/90 px-4 py-3 sm:px-6">
        <button onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          <span className="hidden sm:inline">{t("backToEdit")}</span>
          <span className="sm:hidden">Back</span>
        </button>

        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {t("previewLabel")}
        </span>

        <button onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg hover:bg-white/90 transition active:scale-95">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {t("exportPDF")}
        </button>
      </div>

      {/* Scrollable paper */}
      <div className="preview-modal-scroll relative flex-1 overflow-y-auto py-8 px-4 sm:px-8" style={{ WebkitOverflowScrolling:"touch" }}>
        <div className="preview-paper mx-auto max-w-[860px] rounded-2xl bg-white overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

          {/* Header band */}
          <div className="flex items-center justify-between bg-[#0B3C5D] px-8 py-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Backpackervun" className="h-8 w-auto brightness-0 invert" />
              <span className="hidden sm:block text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t("travelPlanner")}</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">{t("totalBudget")}</p>
              <p className="font-mono text-lg font-bold text-white tabular-nums">{formatIDR(totalIDR)}</p>
              {showIDR && <p className="font-mono text-xs text-white/50 tabular-nums">≈ {formatCurrency(totalLocal, currency)}</p>}
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">

            {/* Prepared for */}
            <section className="mb-8 rounded-xl bg-slate-50 p-6 border border-slate-100">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0B3C5D]/60 mb-1">{t("preparedForClient")}</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">{tripInfo.clientName || "—"}</h1>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {[
                  { l: t("duration"),     v: tripInfo.duration     },
                  { l: t("destinations"), v: tripInfo.destinations },
                  { l: "Travel Dates",    v: tripInfo.travelDates  },
                  { l: t("region"),       v: regionMeta ? `${regionMeta.flag} ${regionMeta.id}` : "—" },
                ].map((m) => (
                  <div key={m.l}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">{m.l}</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 leading-snug">{m.v || "—"}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-0.5 w-8 rounded-full bg-[#0B3C5D]" />
              <h2 className="text-lg font-bold text-slate-900">{t("itinerary")}</h2>
            </div>

            {days.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">{t("noItinerary")}</div>
            ) : (
              <div className="space-y-5">
                {days.map((group, gi) => {
                  const dayLabel  = group.day ? `Day ${group.day}` : "—";
                  const dateLabel = formatDayLabel(group.date);
                  return (
                    <div key={gi} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-4 bg-[#0B3C5D] px-5 py-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">{group.day ?? "—"}</div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{dayLabel}{group.city ? ` — ${group.city}` : ""}</h3>
                          <p className="text-[11px] text-white/60">{dateLabel}</p>
                        </div>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {group.items.map((row) => {
                          const catStyle = CATEGORY_STYLES[row.category];
                          const catIcon  = CATEGORY_ICONS[row.category];
                          const local    = Number(row.budgetLocal) || 0;
                          const idr      = Number(row.budgetIDR)   || 0;
                          const time     = formatTimeLabel(row.time);
                          return (
                            <div key={row.id} className="flex items-start gap-3 px-5 py-3">
                              <span className="w-10 flex-shrink-0 text-right font-mono text-[10px] text-slate-400 mt-0.5">{time || "—"}</span>
                              <div className="flex-1 min-w-0">
                                {row.category && catStyle && (
                                  <span className="mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                                    style={{ background: catStyle.bar + "18", color: catStyle.bar }}>
                                    {catIcon} {row.category}
                                  </span>
                                )}
                                <p className="text-sm font-semibold text-slate-900 leading-snug">{row.destination || "—"}</p>
                                {(row.transport || row.from || row.to) && (
                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    {row.transport}{row.transport && (row.from || row.to) && " · "}{row.from}{row.from && row.to && " → "}{row.to}
                                  </p>
                                )}
                                {row.notes && <p className="mt-0.5 text-[11px] text-slate-400 italic">{row.notes}</p>}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                {local > 0 ? (
                                  <>
                                    <p className="text-sm font-semibold text-slate-800 tabular-nums">{formatCurrency(local, currency)}</p>
                                    {showIDR && <p className="text-[11px] text-[#0B3C5D] tabular-nums">{formatIDR(idr)}</p>}
                                  </>
                                ) : <p className="text-sm text-slate-300">—</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            <section className="mt-8 rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">{t("tripSummary")}</h2>
              </div>
              <div className="px-5 py-4 space-y-1.5">
                {[
                  { l: t("totalStops"),   v: stopsCount },
                  { l: t("totalDays"),    v: days.length },
                  ...(showIDR ? [{ l: t("conversionRate"), v: `1 ${currency.code} = ${rate} IDR` }] : []),
                  { l: `${t("totalBudget")} · ${currency.code}`, v: formatCurrency(totalLocal, currency), bold:true },
                  ...(showIDR ? [{ l: `${t("totalBudget")} · IDR`, v: formatIDR(totalIDR), bold:true, accent:true }] : []),
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-50 py-1.5">
                    <span className={`text-sm ${r.bold ? "font-semibold text-slate-900" : "text-slate-500"}`}>{r.l}</span>
                    <span className={`font-mono text-sm tabular-nums ${r.accent ? "font-bold text-[#0B3C5D]" : r.bold ? "font-semibold text-slate-900" : "text-slate-600"}`}>{r.v}</span>
                  </div>
                ))}
              </div>

              {categoryTotals.some(c => c.local > 0) && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-3">{t("byCategory")}</p>
                  <div className="space-y-2.5">
                    {categoryTotals.filter(c => c.local > 0).map((c) => {
                      const pct = totalLocal > 0 ? Math.round((c.local / totalLocal) * 100) : 0;
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <span className="text-xs w-28 flex-shrink-0 text-slate-600">{CATEGORY_ICONS[c.name]} {c.name}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:c.color }} />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                          <span className="text-xs font-semibold text-slate-700 w-24 text-right tabular-nums">{formatCurrency(c.local, currency)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 text-center">
            <p className="text-[11px] text-slate-400">{t("pdfFooter")}</p>
            <p className="mt-0.5 text-[10px] text-slate-300">{t("pdfCTA")}</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/20 pb-8">{t("printHint")}</p>
      </div>
    </div>
  );
}
