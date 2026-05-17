"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useT } from "@/context/TranslationContext";
import { getCurrency, CATEGORY_OPTIONS } from "@/lib/utils";

/*
 * ItineraryTable — Patch 14e
 *
 * BUG FIX: createPortal was crashing the entire Next.js App Router page
 * when the 3-dot menu was clicked. In Next.js 14 App Router, portaling
 * to document.body inside a table cell can cause React reconciliation
 * errors that propagate as unhandled exceptions.
 *
 * FIX: Replace createPortal entirely with a simple inline div that uses
 * position:fixed + getBoundingClientRect(). position:fixed escapes ALL
 * overflow:hidden ancestors (including table cells), so no portal needed.
 */

const REGION_TRANSPORT = {
  "Japan":       ["Flight","Shinkansen","Train","Bus","Subway","Car","Ferry","Walk","Taxi"],
  "South Korea": ["Flight","KTX","Train","Bus","Subway","Car","Ferry","Walk","Taxi"],
  "Thailand":    ["Flight","Bus","BTS","MRT","Train","Tuk-Tuk","Songthaew","Car","Ferry","Walk","Taxi"],
  "Singapore":   ["Flight","MRT","LRT","Bus","Car","Walk","Taxi","Grab"],
  "Malaysia":    ["Flight","Train","Bus","Car","MRT","LRT","Ferry","Walk","Taxi","Grab"],
  "Europe":      ["Flight","Eurostar","FlixBus","Train","Bus","Car","Ferry","Metro","Walk","Taxi"],
  "Australia":   ["Flight","Train","Bus","Car","Ferry","Tram","Walk","Taxi","Uber"],
  "Indonesia":   ["Flight","Train","Bus","Car","Ferry","Speedboat","Walk","Taxi","Ojek"],
  "Vietnam":     ["Flight","Train","Bus","Car","Motorbike","Ferry","Walk","Taxi","Grab"],
  "China":       ["Flight","High-Speed Rail","Train","Bus","Subway","Car","Walk","Taxi"],
  "USA":         ["Flight","Amtrak","Bus","Car","Subway","Walk","Taxi","Uber"],
  default:       ["Flight","Train","Bus","Car","Ferry","Walk","Taxi"],
};

function getTransportOpts(region) {
  return REGION_TRANSPORT[region] ?? REGION_TRANSPORT.default;
}

function getBookingUrl(transport, { from, to, destination, region } = {}) {
  const enc = encodeURIComponent;
  if (!transport) return null;
  const tl = transport.toLowerCase();
  if (tl.includes("flight")) return null;
  if (transport === "Shinkansen") return "https://www.jrpass.com";
  if (transport === "KTX") return "https://www.letskorail.com";
  if (transport === "Eurostar") return "https://www.eurostar.com";
  if (transport === "FlixBus") return from && to ? `https://www.flixbus.com/bus/${enc(from)}-${enc(to)}` : "https://www.flixbus.com";
  if (transport === "Amtrak") return "https://www.amtrak.com";
  if (transport === "High-Speed Rail") return "https://www.trip.com/trains/";
  if (transport === "Train") {
    if (region === "Japan") return "https://www.jrpass.com";
    if (region === "South Korea") return "https://www.letskorail.com";
    return `https://www.klook.com/search/?keyword=${enc("train " + (destination || ""))}`;
  }
  if (["Bus","Ferry","Speedboat"].includes(transport)) {
    return `https://www.klook.com/search/?keyword=${enc(transport + " " + (destination || ""))}`;
  }
  return null;
}

function buildLinks(row, region) {
  const enc   = encodeURIComponent;
  const destQ = enc([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${destQ}`;
  const routeUrl = row.from && row.to ? `https://www.google.com/maps/dir/${enc(row.from)}/${enc(row.to)}` : null;
  const isFlight = (row.transport || "").toLowerCase().includes("flight");
  const flightUrl = isFlight && row.from && row.to
    ? `https://www.google.com/flights?q=Flights+from+${enc(row.from)}+to+${enc(row.to)}` : null;
  const bookUrl  = !isFlight ? getBookingUrl(row.transport, { from: row.from, to: row.to, destination: row.destination || row.city, region }) : null;
  const hotelUrl = row.category === "Hotel" && (row.destination || row.city)
    ? `https://www.booking.com/search.html?ss=${enc(row.destination || row.city)}` : null;
  return { mapUrl, routeUrl, flightUrl, bookUrl, hotelUrl };
}

// ── Input style constants ─────────────────────────────────────────────────────
const CI = "w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";
const SI = "w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-xs text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";
const BI = "w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-right text-xs font-mono outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white transition";
const DIS = "cursor-not-allowed bg-paper-dim/60 text-ink-muted opacity-50";

// ── Main component ────────────────────────────────────────────────────────────

export default function ItineraryTable({
  rows, dayMap, region,
  onUpdate, onAdd, onDelete,
  onInsertAbove, onInsertBelow,
  onMoveUp, onMoveDown,
  currencyMode = "local",
}) {
  const { t }         = useT();
  const currency      = getCurrency(region);
  const isIDR         = currency.code === "IDR";
  const localDisabled = currencyMode === "idr";
  const idrDisabled   = currencyMode === "local";
  const transportOpts = getTransportOpts(region);
  const colCount      = isIDR ? 13 : 14;

  return (
    <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">

      {/* Heading */}
      <div className="px-5 py-4 border-b border-paper-line flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">{t("itinerarySection")}</p>
          <h2 className="text-lg font-semibold text-ink mt-0.5">{t("dayByDay")}</h2>
        </div>
        <span className="rounded-full border border-paper-line bg-paper-dim px-2.5 py-1 text-xs text-ink-muted">
          {rows.length === 1 ? t("stopCount", { count: 1 }) : t("stopsCount", { count: rows.length })}
        </span>
      </div>

      {/* Currency hint */}
      {!isIDR && (
        <div className="border-b border-paper-line bg-accent-50/40 px-5 py-2">
          <p className="text-xs text-navy-600 font-medium">
            ✏️ {currencyMode === "idr"
              ? `${t("editIDR")} — ${currency.code} auto-calculated`
              : `${t("editLocal", { code: currency.code })} — IDR auto-calculated`}
          </p>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: "1200px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "32px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "110px" }} />
            {!isIDR && <col style={{ width: "90px" }} />}
            <col style={{ width: "90px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "34px" }} />
            <col style={{ width: "34px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-paper-line bg-paper-dim/60">
              <th className="px-3 py-2.5" />
              {[
                t("date"), t("time"), t("city"), t("destination"),
                `${t("from")} / ${t("to")}`,
                t("transport"), t("category"), t("notes"),
                ...(isIDR ? ["IDR"] : [`${currency.code}`, "IDR"]),
                t("links"), "↕", "",
              ].map((h, i) => (
                <th key={i} className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted overflow-hidden whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-paper-line/40">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-5 py-14 text-center text-sm text-ink-muted">
                  {t("noStops")}
                </td>
              </tr>
            ) : rows.map((row, idx) => {
              const prevDate = idx > 0 ? (rows[idx - 1].date || "").trim() : null;
              const thisDate = (row.date || "").trim();
              const showSep  = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
              const dayNum   = thisDate ? (dayMap[thisDate] ?? null) : null;
              const links    = buildLinks(row, region);

              return (
                <Fragment key={row.id}>
                  {showSep && (
                    <tr className="bg-paper-dim/30">
                      <td colSpan={colCount} className="py-1 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-navy-100" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">
                            — {t("day")} {dayMap[thisDate] ?? "?"} —
                          </span>
                          <div className="h-px flex-1 bg-navy-100" />
                        </div>
                      </td>
                    </tr>
                  )}

                  <tr className="hover:bg-paper-dim/20 transition-colors">
                    <td className="pl-3 py-3">
                      {dayNum !== null && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-[9px] font-bold text-white">{dayNum}</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <input type="date" value={row.date||""} onChange={(e)=>onUpdate(row.id,"date",e.target.value)} className={CI} />
                    </td>
                    <td className="px-2 py-2.5">
                      <input type="time" value={row.time||""} onChange={(e)=>onUpdate(row.id,"time",e.target.value)} className={CI} />
                    </td>
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.city||""} placeholder={t("city")} onChange={(e)=>onUpdate(row.id,"city",e.target.value)} className={CI} />
                    </td>
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.destination||""} placeholder={t("destinationPlaceholder")} onChange={(e)=>onUpdate(row.id,"destination",e.target.value)} className={CI} />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="space-y-1">
                        <input type="text" value={row.from||""} placeholder={t("from")} onChange={(e)=>onUpdate(row.id,"from",e.target.value)} className={CI} />
                        <input type="text" value={row.to||""} placeholder={t("to")} onChange={(e)=>onUpdate(row.id,"to",e.target.value)} className={CI} />
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <select value={row.transport||""} onChange={(e)=>onUpdate(row.id,"transport",e.target.value)} className={SI}>
                        <option value="">—</option>
                        {transportOpts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2.5">
                      <select value={row.category||""} onChange={(e)=>onUpdate(row.id,"category",e.target.value)} className={SI}>
                        <option value="">—</option>
                        {(CATEGORY_OPTIONS??["Hotel","Food","Attraction","Activity","Transport"]).map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2.5">
                      <input type="text" value={row.notes||""} placeholder="—" onChange={(e)=>onUpdate(row.id,"notes",e.target.value)} className={CI} />
                    </td>
                    {!isIDR && (
                      <td className="px-2 py-2.5">
                        <input type="number" value={row.budgetLocal||0} readOnly={localDisabled}
                          onChange={(e)=>!localDisabled&&onUpdate(row.id,"budgetLocal",Number(e.target.value))}
                          className={`${BI} ${localDisabled?DIS:"text-ink"}`} />
                      </td>
                    )}
                    <td className="px-2 py-2.5">
                      <input type="number" value={row.budgetIDR||0} readOnly={idrDisabled&&!isIDR}
                        onChange={(e)=>(isIDR||!idrDisabled)&&onUpdate(row.id,"budgetIDR",Number(e.target.value))}
                        className={`${BI} ${idrDisabled&&!isIDR?DIS:"text-navy-500 font-semibold"}`} />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {links.mapUrl    && <Chip href={links.mapUrl}    icon="📍" label="Map" />}
                        {links.routeUrl  && <Chip href={links.routeUrl}  icon="🗺"  label="Route" />}
                        {links.flightUrl && <Chip href={links.flightUrl} icon="✈️" label="Flights" />}
                        {links.bookUrl   && <Chip href={links.bookUrl}   icon="🎫" label="Book" />}
                        {links.hotelUrl  && <Chip href={links.hotelUrl}  icon="🏨" label="Hotel" />}
                      </div>
                    </td>
                    <td className="px-1 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <MoveBtn onClick={()=>onMoveUp?.(row.id)} disabled={idx===0} dir="up" />
                        <MoveBtn onClick={()=>onMoveDown?.(row.id)} disabled={idx===rows.length-1} dir="down" />
                      </div>
                    </td>
                    <td className="pr-3 py-2.5">
                      {/* ✅ RowActions with NO createPortal — uses inline fixed-position div */}
                      <RowActions
                        onInsertAbove={()=>onInsertAbove?.(row.id)}
                        onInsertBelow={()=>onInsertBelow?.(row.id)}
                        onDelete={()=>onDelete?.(row.id)}
                        t={t}
                      />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden divide-y-0 space-y-0">
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink-muted">{t("noStops")}</p>
        ) : rows.map((row, idx) => {
          const prevDate = idx > 0 ? (rows[idx-1].date||"").trim() : null;
          const thisDate = (row.date||"").trim();
          const showSep  = idx > 0 && thisDate && prevDate && thisDate !== prevDate;
          const dayNum   = thisDate ? (dayMap[thisDate]??null) : null;
          const links    = buildLinks(row, region);
          return (
            <Fragment key={row.id}>
              {showSep && (
                <div className="bg-navy-500 py-2 px-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">{t("day")} {dayMap[thisDate]??"?"}</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
              )}
              <div className="mx-3 my-2 rounded-xl border border-paper-line bg-white shadow-soft overflow-hidden">
                <MobileCard row={row} idx={idx} total={rows.length} dayNum={dayNum}
                currency={currency} isIDR={isIDR} localDisabled={localDisabled} idrDisabled={idrDisabled}
                transportOpts={transportOpts} links={links} onUpdate={onUpdate}
                onMoveUp={()=>onMoveUp?.(row.id)} onMoveDown={()=>onMoveDown?.(row.id)}
                onInsertAbove={()=>onInsertAbove?.(row.id)} onInsertBelow={()=>onInsertBelow?.(row.id)}
                onDelete={()=>onDelete?.(row.id)} t={t} />
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Add row */}
      <div className="border-t border-paper-line/60 px-5 py-3">
        <button onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-paper-line px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-navy-300 hover:bg-navy-50 hover:text-navy-500">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t("addRow")}
        </button>
      </div>
    </div>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function MobileCard({ row, idx, total, dayNum, currency, isIDR, localDisabled, idrDisabled,
  transportOpts, links, onUpdate, onMoveUp, onMoveDown, onInsertAbove, onInsertBelow, onDelete, t }) {
  const inp = "w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300 focus:ring-1 focus:ring-accent-300/20";
  return (
    <div className="divide-y divide-paper-line">
      {/* Header: destination + city + controls */}
      <div className="px-4 py-3 flex items-start gap-2.5">
        {dayNum!==null && (
          <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white mt-0.5">
            {dayNum}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <input type="text" value={row.destination||""} placeholder={t("destinationPlaceholder")}
            onChange={(e)=>onUpdate(row.id,"destination",e.target.value)}
            className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-ink outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
          <input type="text" value={row.city||""} placeholder={t("city")}
            onChange={(e)=>onUpdate(row.id,"city",e.target.value)}
            className="w-full mt-0.5 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-ink-muted outline-none hover:border-paper-line focus:border-accent-300 focus:bg-white" />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <MoveBtn onClick={onMoveUp} disabled={idx===0} dir="up" />
          <MoveBtn onClick={onMoveDown} disabled={idx===total-1} dir="down" />
          <RowActions onInsertAbove={onInsertAbove} onInsertBelow={onInsertBelow} onDelete={onDelete} t={t} />
        </div>
      </div>

      {/* Date & Time */}
      <div className="px-4 py-3 bg-paper-dim/30">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mlab">{t("date")}</p>
            <input type="date" value={row.date||""} onChange={(e)=>onUpdate(row.id,"date",e.target.value)} className={inp} />
          </div>
          <div>
            <p className="mlab">{t("time")}</p>
            <input type="time" value={row.time||""} onChange={(e)=>onUpdate(row.id,"time",e.target.value)} className={inp} />
          </div>
        </div>
      </div>

      {/* From & To */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mlab">{t("from")}</p>
            <input type="text" value={row.from||""} placeholder="—" onChange={(e)=>onUpdate(row.id,"from",e.target.value)} className={inp} />
          </div>
          <div>
            <p className="mlab">{t("to")}</p>
            <input type="text" value={row.to||""} placeholder="—" onChange={(e)=>onUpdate(row.id,"to",e.target.value)} className={inp} />
          </div>
        </div>
      </div>

      {/* Transport & Category */}
      <div className="px-4 py-3 bg-paper-dim/30">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mlab">{t("transport")}</p>
            <select value={row.transport||""} onChange={(e)=>onUpdate(row.id,"transport",e.target.value)} className={inp}>
              <option value="">—</option>
              {transportOpts.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <p className="mlab">{t("category")}</p>
            <select value={row.category||""} onChange={(e)=>onUpdate(row.id,"category",e.target.value)} className={inp}>
              <option value="">—</option>
              {(CATEGORY_OPTIONS??["Hotel","Food","Attraction","Activity","Transport"]).map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 py-3">
        <p className="mlab">{t("notes")}</p>
        <input type="text" value={row.notes||""} placeholder="—"
          onChange={(e)=>onUpdate(row.id,"notes",e.target.value)} className={inp} />
      </div>

      {/* Budget */}
      <div className="px-4 py-3 bg-paper-dim/30">
        <div className="grid grid-cols-2 gap-3">
          {!isIDR && (
            <div>
              <p className="mlab">{currency.code}{localDisabled?" (auto)":""}</p>
              <input type="number" value={row.budgetLocal||0}
                readOnly={localDisabled}
                onChange={(e)=>!localDisabled&&onUpdate(row.id,"budgetLocal",Number(e.target.value))}
                className={`${inp} text-right font-mono ${localDisabled?"bg-paper-dim opacity-60 cursor-not-allowed":""}`} />
            </div>
          )}
          <div className={isIDR ? "col-span-2" : ""}>
            <p className="mlab">IDR{idrDisabled&&!isIDR?" (auto)":""}</p>
            <input type="number" value={row.budgetIDR||0}
              readOnly={idrDisabled&&!isIDR}
              onChange={(e)=>(isIDR||!idrDisabled)&&onUpdate(row.id,"budgetIDR",Number(e.target.value))}
              className={`${inp} text-right font-mono font-semibold text-navy-500 ${idrDisabled&&!isIDR?"bg-paper-dim opacity-60 cursor-not-allowed":""}`} />
          </div>
        </div>
      </div>

      {/* Links */}
      {(links.mapUrl||links.routeUrl||links.flightUrl||links.bookUrl||links.hotelUrl) && (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {links.mapUrl&&<Chip href={links.mapUrl} icon="📍" label="Map" />}
            {links.routeUrl&&<Chip href={links.routeUrl} icon="🗺" label="Route" />}
            {links.flightUrl&&<Chip href={links.flightUrl} icon="✈️" label="Flights" />}
            {links.bookUrl&&<Chip href={links.bookUrl} icon="🎫" label="Book" />}
            {links.hotelUrl&&<Chip href={links.hotelUrl} icon="🏨" label="Hotel" />}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared small components ───────────────────────────────────────────────────

function Chip({ href, icon, label }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-white px-2.5 py-0.5 text-[10px] font-semibold text-ink-soft shadow-sm transition hover:border-navy-200 hover:bg-navy-50 hover:text-navy-500 active:scale-95 whitespace-nowrap">
      <span className="text-[11px] leading-none">{icon}</span>{label}
    </a>
  );
}

function MoveBtn({ onClick, disabled, dir }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="grid h-5 w-5 place-items-center rounded text-ink-muted hover:bg-paper-dim disabled:opacity-30 disabled:cursor-not-allowed">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir==="up"?<path d="M18 15l-6-6-6 6"/>:<path d="M6 9l6 6 6-6"/>}
      </svg>
    </button>
  );
}

/**
 * RowActions — NO createPortal
 *
 * Uses position:fixed for the dropdown, computed from getBoundingClientRect.
 * position:fixed escapes overflow:hidden on table cells.
 * Backdrop is also a fixed div (no portal needed).
 */
function RowActions({ onInsertAbove, onInsertBelow, onDelete, t }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);

  // Close on scroll (reposition would be complex)
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(v => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        className="grid h-7 w-7 place-items-center rounded-lg text-ink-muted hover:bg-paper-dim"
        aria-label="Row actions"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — inline fixed, no portal */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          />
          {/* Dropdown — inline fixed, no portal */}
          <div
            className="fixed rounded-xl border border-paper-line bg-white py-1.5 shadow-[0_8px_30px_rgba(11,60,93,0.14)]"
            style={{ top: pos.top, right: pos.right, zIndex: 9999, minWidth: "164px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <RA
              label={`↑ ${t("insertAbove")}`}
              onClick={() => { onInsertAbove(); setOpen(false); }}
            />
            <RA
              label={`↓ ${t("insertBelow")}`}
              onClick={() => { onInsertBelow(); setOpen(false); }}
            />
            <div className="my-1 border-t border-paper-line/60" />
            <RA
              label={`🗑 ${t("deleteRow")}`}
              onClick={() => { onDelete(); setOpen(false); }}
              danger
            />
          </div>
        </>
      )}
    </>
  );
}

function RA({ label, onClick, danger }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-paper-dim whitespace-nowrap ${danger ? "font-medium text-red-500 hover:bg-red-50" : "text-ink-soft"}`}
    >
      {label}
    </button>
  );
}
