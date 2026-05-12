"use client";

/**
 * /pdf-render — Backpackervun PDF Renderer
 *
 * ARCHITECTURE: Browser-native print (Vercel Hobby compatible)
 *
 * Flow:
 *  1. PreviewModal saves data to localStorage["bpv-pdf-render"]
 *  2. Opens this page in a new tab (synchronously for iOS Safari)
 *  3. This page reads the data, renders the itinerary, auto-triggers window.print()
 *  4. Browser's native PDF renderer creates the PDF with clickable links on ALL pages
 *
 * Why this works better than html2canvas + jsPDF:
 *  - Links are real <a href> tags → browser PDF renderer preserves them natively
 *  - Works on page 1, 2, 3, 10, 50 — no manual coordinate calculation
 *  - No server/Puppeteer needed → zero timeout risk on Vercel Hobby
 *  - iOS Safari: print dialog → Save to Files → real PDF with clickable links
 */

import { useEffect, useState } from "react";

// ── Design tokens (matching Sydney Marathon PDF) ──────────────────────────────
const N  = "#0B3C5D";   // navy
const I  = "#1E293B";   // ink dark
const IS = "#475569";   // ink soft
const IM = "#94A3B8";   // ink muted
const B  = "#E8EDF3";   // border

const CATEGORY = {
  Transport:  { icon: "🚌", bg: "#EFF6FF", color: "#1D4ED8" },
  Hotel:      { icon: "🏨", bg: "#F0FDF4", color: "#15803D" },
  Food:       { icon: "🍽️", bg: "#FFF7ED", color: "#C2410C" },
  Attraction: { icon: "🎡", bg: "#FDF4FF", color: "#7E22CE" },
  Activity:   { icon: "🏃", bg: "#ECFDF5", color: "#065F46" },
};

const TICONS = {
  Flight: "✈️", Shinkansen: "🚅", Train: "🚆", KTX: "🚄", "High-Speed Rail": "🚄",
  Bus: "🚌", FlixBus: "🚌", Car: "🚗", Ferry: "⛴️", Walk: "🚶",
  Taxi: "🚕", MRT: "🚇", LRT: "🚇", Subway: "🚇", Tram: "🚊", BTS: "🚊",
  Eurostar: "🚄", Ojek: "🛵", Motorbike: "🛵", "Tuk-Tuk": "🛺",
  Grab: "🚗", Uber: "🚗", Amtrak: "🚆", Songthaew: "🛺",
};

const FLAGS = {
  Japan: "🇯🇵", "South Korea": "🇰🇷", Thailand: "🇹🇭", Singapore: "🇸🇬",
  Malaysia: "🇲🇾", Europe: "🇪🇺", Australia: "🇦🇺", Indonesia: "🇮🇩",
  Vietnam: "🇻🇳", China: "🇨🇳", USA: "🇺🇸",
};

const CURRENCIES = {
  Japan:        { code: "JPY",  symbol: "¥",   locale: "ja-JP" },
  "South Korea":{ code: "KRW",  symbol: "₩",   locale: "ko-KR" },
  Thailand:     { code: "THB",  symbol: "฿",   locale: "th-TH" },
  Singapore:    { code: "SGD",  symbol: "S$",  locale: "en-SG" },
  Malaysia:     { code: "MYR",  symbol: "RM",  locale: "ms-MY" },
  Europe:       { code: "EUR",  symbol: "€",   locale: "de-DE" },
  Australia:    { code: "AUD",  symbol: "A$",  locale: "en-AU" },
  Indonesia:    { code: "IDR",  symbol: "Rp",  locale: "id-ID" },
  Vietnam:      { code: "VND",  symbol: "₫",   locale: "vi-VN" },
  China:        { code: "CNY",  symbol: "¥",   locale: "zh-CN" },
  USA:          { code: "USD",  symbol: "$",   locale: "en-US" },
};

function getCurr(r) { return CURRENCIES[r] ?? { code: "IDR", symbol: "Rp", locale: "id-ID" }; }

function fmtC(amount, curr) {
  if (!amount && amount !== 0) return `${curr.symbol}0`;
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: "currency", currency: curr.code,
      maximumFractionDigits: ["IDR","VND","KRW"].includes(curr.code) ? 0 : 2,
    }).format(Number(amount));
  } catch { return `${curr.symbol}${Number(amount).toLocaleString()}`; }
}

function fmtIDR(a) {
  if (!a && a !== 0) return "Rp 0";
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(a));
  } catch { return `Rp ${Number(a).toLocaleString("id-ID")}`; }
}

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m || 0).padStart(2,"0")} ${ap}`;
}

function fmtDate(s) {
  if (!s) return "";
  try {
    let d;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) d = new Date(s + "T12:00:00");
    else { const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/); d = m ? new Date(`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}T12:00:00`) : new Date(s); }
    return isNaN(d) ? s : d.toLocaleDateString("en-US", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
  } catch { return s; }
}

// ── CSS (print + screen) ──────────────────────────────────────────────────────
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

@page { size: A4 portrait; margin: 10mm 12mm; }

*, *::before, *::after {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

html, body {
  margin: 0; padding: 0; background: white;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1E293B; font-size: 13px; line-height: 1.5;
}

a { color: #0B3C5D; text-decoration: none; }

.day-block { break-inside: avoid; page-break-inside: avoid; }
.row-item  { break-inside: avoid; page-break-inside: avoid; }

@media screen {
  body { max-width: 794px; margin: 0 auto; padding: 0; }
}

@media print {
  .print-hide { display: none !important; }
}
`;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PDFRenderPage() {
  const [data,  setData]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bpv-pdf-render");
      if (raw) {
        setData(JSON.parse(raw));
        // Clean up after 10s (give time for re-print)
        setTimeout(() => localStorage.removeItem("bpv-pdf-render"), 10_000);
      }
    } catch (e) { console.error("PDF data error:", e); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!data || !ready) return;
    const go = () => window.print();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => setTimeout(go, 150));
    } else {
      setTimeout(go, 700);
    }
  }, [data, ready]);

  if (!ready) return <Splash text="Loading…" />;
  if (!data)  return <Splash text="No itinerary data found. Please open this page from the Travel Planner." link="/dashboard" />;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <Document {...data} />
    </>
  );
}

function Splash({ text, link }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0f172a", fontFamily:"Montserrat,sans-serif", color:"white" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.7)", marginBottom:"12px" }}>{text}</div>
        {link && <a href={link} style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", textDecoration:"underline" }}>← Back to Dashboard</a>}
      </div>
    </div>
  );
}

// ── Document ──────────────────────────────────────────────────────────────────

function Document({ tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR }) {
  const curr  = getCurr(region);
  const isIDR = curr.code === "IDR";

  const meaningful = rows.filter(r =>
    r.destination || r.city || r.notes || r.from || r.to ||
    Number(r.budgetLocal) > 0 || Number(r.budgetIDR) > 0
  );

  // Group rows by date → sorted days
  const byDay = new Map();
  for (const r of meaningful) {
    const key = (r.date || "").trim() || "__";
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(r);
  }
  const days = [...byDay.entries()].sort(([a],[b]) => {
    const da = a === "__" ? 999 : (dayMap[a] ?? 999);
    const db = b === "__" ? 999 : (dayMap[b] ?? 999);
    return da - db;
  });

  const totalDays = Object.keys(dayMap).length || 1;

  return (
    <div style={{ background:"white", minHeight:"100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"22px 32px 18px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", borderBottom:`1px solid ${B}` }}>
        {/* Brand */}
        <div>
          <div style={{ fontSize:"22px", fontWeight:700, color:N, letterSpacing:"-0.3px", lineHeight:1 }}>Backpackervun</div>
          <div style={{ fontSize:"10px", fontWeight:600, color:IM, letterSpacing:"0.22em", textTransform:"uppercase", marginTop:"3px" }}>Travel Planner</div>
        </div>
        {/* Totals */}
        <div style={{ textAlign:"right" }}>
          {!isIDR && (
            <div style={{ marginBottom:"6px" }}>
              <div style={{ fontSize:"9px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.15em", color:IM }}>TOTAL · {curr.code}</div>
              <div style={{ fontSize:"20px", fontWeight:700, color:I, lineHeight:1.1 }}>{fmtC(totalLocal, curr)}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize:"9px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.15em", color:N }}>TOTAL · IDR</div>
            <div style={{ fontSize: isIDR ? "20px" : "15px", fontWeight:700, color:N, lineHeight:1.1 }}>{fmtIDR(totalIDR)}</div>
          </div>
        </div>
      </div>

      {/* ── TRIP INFO ── */}
      <div style={{ padding:"24px 32px 20px", borderBottom:`1px solid ${B}` }}>
        {tripInfo?.clientName && <>
          <div style={{ fontSize:"9px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.2em", color:IM }}>PREPARED FOR CLIENT</div>
          <div style={{ fontSize:"34px", fontWeight:700, color:I, lineHeight:1.1, margin:"4px 0 20px" }}>{tripInfo.clientName}</div>
        </>}
        {[
          ["DURATION",     tripInfo?.duration || "—"],
          ["DESTINATIONS", tripInfo?.destinations || "—"],
          ["TRAVEL DATES", tripInfo?.travelDates || (tripInfo?.startDate && tripInfo?.endDate ? `${tripInfo.startDate} – ${tripInfo.endDate}` : "—")],
          ["REGION",       region ? `${FLAGS[region]||"🌍"} ${region}` : "—"],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"flex-start", padding:"4px 0" }}>
            <div style={{ width:"130px", flexShrink:0, fontSize:"9px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.15em", color:IM, paddingTop:"2px" }}>{lbl}</div>
            <div style={{ fontSize:"13px", fontWeight:500, color:I }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── ITINERARY ── */}
      <div style={{ padding:"22px 32px 8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", fontSize:"20px", fontWeight:700, color:I }}>
          <div style={{ width:"24px", height:"2px", background:N, flexShrink:0 }} />
          Itinerary
        </div>
      </div>

      <div style={{ padding:"4px 32px 8px" }}>
        {days.length === 0
          ? <div style={{ padding:"40px", textAlign:"center", color:IM }}>No itinerary entries.</div>
          : days.map(([dateKey, dayRows]) => {
            const dn     = dateKey !== "__" ? (dayMap[dateKey] ?? null) : null;
            const city   = dayRows[0]?.city || "";
            const dStr   = dateKey !== "__" ? fmtDate(dateKey) : "";
            return (
              <div key={dateKey} className="day-block" style={{ marginBottom:"20px", border:`1px solid ${B}`, borderRadius:"12px", overflow:"hidden" }}>
                {/* Day header */}
                <div style={{ background:N, padding:"12px 20px", display:"flex", alignItems:"center", gap:"14px" }}>
                  {dn !== null && (
                    <div style={{ background:"white", color:N, borderRadius:"50%", width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:"14px", flexShrink:0 }}>
                      {dn}
                    </div>
                  )}
                  <div>
                    <div style={{ color:"white", fontSize:"16px", fontWeight:700 }}>Day {dn ?? "—"}{city ? ` — ${city}` : ""}</div>
                    {dStr && <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"11px", marginTop:"1px" }}>{dStr}</div>}
                  </div>
                </div>
                {/* Row items */}
                {dayRows.map((row, i) => <RowItem key={row.id ?? i} row={row} curr={curr} isIDR={isIDR} last={i === dayRows.length - 1} />)}
              </div>
            );
          })}
      </div>

      {/* ── TRIP SUMMARY ── */}
      <div style={{ padding:"16px 32px 8px" }}>
        <div style={{ fontSize:"20px", fontWeight:700, color:I, marginBottom:"16px" }}>Trip Summary</div>
        <div style={{ border:`1px solid ${B}`, borderRadius:"10px", overflow:"hidden" }}>
          {[
            { label:"Total stops",      val: meaningful.length,                                     bold:false, accent:false },
            { label:"Total days",       val: totalDays,                                              bold:false, accent:false },
            { label:"Conversion rate",  val: isIDR ? "1:1" : `1 ${curr.code} = ${rate} IDR`,        bold:false, accent:false },
            ...(!isIDR ? [{ label:`TOTAL · ${curr.code}`, val: fmtC(totalLocal, curr), bold:true, accent:false }] : []),
            { label:"TOTAL · IDR",      val: fmtIDR(totalIDR),                                      bold:true,  accent:true  },
          ].map(({ label, val, bold, accent }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", borderBottom:`1px solid ${B}`, background:"white" }}>
              <span style={{ fontSize:"13px", color: bold ? I : IM, fontWeight: bold ? 600 : 400 }}>{label}</span>
              <span style={{ fontSize:"13px", color: accent ? N : I, fontWeight: bold ? 700 : 400 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ margin:"24px 32px 0", padding:"16px 0", borderTop:`1px solid ${B}`, textAlign:"center", fontSize:"10px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.2em", color:IM }}>
        PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM
      </div>

      {/* Screen-only: reprint button */}
      <div className="print-hide" style={{ padding:"16px 32px 32px", textAlign:"center" }}>
        <button onClick={() => window.print()} style={{ padding:"10px 24px", background:N, color:"white", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
          ↓ Print / Save as PDF again
        </button>
      </div>

    </div>
  );
}

// ── Row item ──────────────────────────────────────────────────────────────────

function RowItem({ row, curr, isIDR, last }) {
  const budget    = Number(row.budgetLocal) || 0;
  const budgetIDR = Number(row.budgetIDR) || 0;
  const hasBudget = budget > 0 || budgetIDR > 0;
  const cat       = row.category ? (CATEGORY[row.category] ?? null) : null;
  const tIcon     = row.transport ? (TICONS[row.transport] ?? "") : "";
  const enc       = encodeURIComponent;

  // Build Google links
  const destQ    = enc([row.destination, row.city, row.to].filter(Boolean).join(" ") || "");
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${destQ}`;
  const routeUrl = row.from && row.to ? `https://www.google.com/maps/dir/${enc(row.from)}/${enc(row.to)}` : null;
  const isFlt    = (row.transport || "").toLowerCase().includes("flight");
  const fltUrl   = isFlt && row.from && row.to ? `https://www.google.com/flights?q=Flights+from+${enc(row.from)}+to+${enc(row.to)}` : null;

  return (
    <div className="row-item" style={{ display:"flex", alignItems:"flex-start", gap:"16px", padding:"16px 20px", borderBottom: last ? "none" : `1px solid ${B}`, background:"white" }}>
      {/* Time */}
      <div style={{ flexShrink:0, width:"64px", textAlign:"right", fontSize:"11px", fontWeight:600, color:IM, paddingTop:"2px", fontVariantNumeric:"tabular-nums" }}>
        {fmtTime(row.time) || "—"}
      </div>

      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        {cat && (
          <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:cat.bg, color:cat.color, padding:"2px 8px", borderRadius:"4px", fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"6px" }}>
            <span>{cat.icon}</span> {row.category?.toUpperCase()}
          </div>
        )}
        <div style={{ fontSize:"15px", fontWeight:700, color:I, lineHeight:1.3, marginBottom:"4px" }}>
          {row.destination || row.city || "—"}
        </div>
        {(row.transport || row.from || row.to) && (
          <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:IM, flexWrap:"wrap", marginBottom:"4px" }}>
            {tIcon && <span>{tIcon}</span>}
            {row.transport && <span style={{ fontWeight:600, color:IS }}>{row.transport}</span>}
            {row.transport && (row.from || row.to) && <span style={{ color:"#CBD5E1" }}>·</span>}
            {row.from && <span>{row.from}</span>}
            {row.from && row.to && <span style={{ color:"#94A3B8" }}>→</span>}
            {row.to && <span>{row.to}</span>}
          </div>
        )}
        {row.notes && <div style={{ fontSize:"11px", color:IM, fontStyle:"italic", marginBottom:"6px" }}>{row.notes}</div>}

        {/* ✅ Real <a href> links — browser preserves these on ALL PDF pages natively */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0", marginTop:"6px" }}>
          <a href={mapUrl}   target="_blank" rel="noopener noreferrer" style={{ fontSize:"11px", fontWeight:500, color:N, marginRight:"16px", display:"inline-flex", alignItems:"center", gap:"3px" }}>📍 View in Google Maps</a>
          {routeUrl && <a href={routeUrl}  target="_blank" rel="noopener noreferrer" style={{ fontSize:"11px", fontWeight:500, color:N, marginRight:"16px", display:"inline-flex", alignItems:"center", gap:"3px" }}>🗺 Open Route</a>}
          {fltUrl   && <a href={fltUrl}    target="_blank" rel="noopener noreferrer" style={{ fontSize:"11px", fontWeight:500, color:N, marginRight:"16px", display:"inline-flex", alignItems:"center", gap:"3px" }}>✈️ View Flights</a>}
        </div>
      </div>

      {/* Budget */}
      <div style={{ flexShrink:0, textAlign:"right", minWidth:"60px" }}>
        {hasBudget ? <>
          {!isIDR && budget > 0 && <div style={{ fontSize:"13px", fontWeight:700, color:I }}>{fmtC(budget, curr)}</div>}
          {budgetIDR > 0 && <div style={{ fontSize:"11px", color: isIDR ? I : IM, fontWeight: isIDR ? 700 : 400 }}>{fmtIDR(budgetIDR)}</div>}
        </> : (
          <div style={{ fontSize:"13px", color:"#CBD5E1" }}>—</div>
        )}
      </div>
    </div>
  );
}
