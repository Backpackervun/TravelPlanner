/**
 * app/api/export-pdf/route.js — Puppeteer PDF (optional)
 *
 * PRIMARY export is now browser-native via /pdf-render (no timeout risk).
 *
 * This Puppeteer route is for future use (Vercel Pro plan, maxDuration 60s).
 * On Vercel Hobby (10s timeout), this will likely timeout on cold start.
 *
 * To use: POST { tripInfo, rows, dayMap, region, rate, totalLocal, totalIDR }
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Same helpers as pdf-render/page.jsx (self-contained, no utils import)
const CURRENCIES = {
  Japan:        { code:"JPY",  symbol:"¥",   locale:"ja-JP" },
  "South Korea":{ code:"KRW",  symbol:"₩",   locale:"ko-KR" },
  Thailand:     { code:"THB",  symbol:"฿",   locale:"th-TH" },
  Singapore:    { code:"SGD",  symbol:"S$",  locale:"en-SG" },
  Malaysia:     { code:"MYR",  symbol:"RM",  locale:"ms-MY" },
  Europe:       { code:"EUR",  symbol:"€",   locale:"de-DE" },
  Australia:    { code:"AUD",  symbol:"A$",  locale:"en-AU" },
  Indonesia:    { code:"IDR",  symbol:"Rp",  locale:"id-ID" },
  Vietnam:      { code:"VND",  symbol:"₫",   locale:"vi-VN" },
  China:        { code:"CNY",  symbol:"¥",   locale:"zh-CN" },
  USA:          { code:"USD",  symbol:"$",   locale:"en-US" },
};

function getCurr(r) { return CURRENCIES[r] ?? { code:"IDR",symbol:"Rp",locale:"id-ID" }; }
function fmtC(a,c) { try { return new Intl.NumberFormat(c.locale,{style:"currency",currency:c.code,maximumFractionDigits:["IDR","VND","KRW"].includes(c.code)?0:2}).format(Number(a)); } catch { return `${c.symbol}${a}`; }}
function fmtIDR(a) { try { return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(a)); } catch { return `Rp ${a}`; }}
function fmtTime(t) { if(!t)return""; const[h,m]=t.split(":").map(Number); if(isNaN(h))return t; return `${h>12?h-12:h===0?12:h}:${String(m||0).padStart(2,"0")} ${h>=12?"PM":"AM"}`; }
function fmtDate(s) { if(!s)return""; try{ const d=/^\d{4}-\d{2}-\d{2}/.test(s)?new Date(s+"T12:00:00"):new Date(s); return isNaN(d)?s:d.toLocaleDateString("en-US",{weekday:"short",day:"numeric",month:"short",year:"numeric"}); }catch{return s;}}
const FLAGS={Japan:"🇯🇵","South Korea":"🇰🇷",Thailand:"🇹🇭",Singapore:"🇸🇬",Malaysia:"🇲🇾",Europe:"🇪🇺",Australia:"🇦🇺",Indonesia:"🇮🇩",Vietnam:"🇻🇳",China:"🇨🇳",USA:"🇺🇸"};
const CAT={Transport:{icon:"🚌",bg:"#EFF6FF",color:"#1D4ED8"},Hotel:{icon:"🏨",bg:"#F0FDF4",color:"#15803D"},Food:{icon:"🍽️",bg:"#FFF7ED",color:"#C2410C"},Attraction:{icon:"🎡",bg:"#FDF4FF",color:"#7E22CE"},Activity:{icon:"🏃",bg:"#ECFDF5",color:"#065F46"}};
const TICO={Flight:"✈️",Shinkansen:"🚅",Train:"🚆",KTX:"🚄",Bus:"🚌",Car:"🚗",Ferry:"⛴️",Walk:"🚶",Taxi:"🚕",MRT:"🚇",Subway:"🚇",Tram:"🚊",BTS:"🚊",Eurostar:"🚄",Amtrak:"🚆","Tuk-Tuk":"🛺"};
const N="#0B3C5D",I="#1E293B",IS="#475569",IM="#94A3B8",B="#E8EDF3";
const enc=encodeURIComponent;

function buildHTML({tripInfo,rows,dayMap,region,rate,totalLocal,totalIDR}){
  const curr=getCurr(region); const isIDR=curr.code==="IDR";
  const meaningful=rows.filter(r=>r.destination||r.city||r.notes||r.from||r.to||Number(r.budgetLocal)>0||Number(r.budgetIDR)>0);
  const byDay=new Map();
  for(const r of meaningful){const k=(r.date||"").trim()||"__";if(!byDay.has(k))byDay.set(k,[]);byDay.get(k).push(r);}
  const days=[...byDay.entries()].sort(([a],[b])=>{const da=a==="__"?999:(dayMap[a]??999);const db=b==="__"?999:(dayMap[b]??999);return da-db;});
  const totalDays=Object.keys(dayMap).length||1;

  const rowHTML=(row,last)=>{
    const budget=Number(row.budgetLocal)||0; const budgetIDR=Number(row.budgetIDR)||0; const hasBudget=budget>0||budgetIDR>0;
    const cat=row.category?(CAT[row.category]??null):null; const ti=row.transport?(TICO[row.transport]??""):"";
    const destQ=enc([row.destination,row.city,row.to].filter(Boolean).join(" ")||"");
    const mapUrl=`https://www.google.com/maps/search/?api=1&query=${destQ}`;
    const routeUrl=row.from&&row.to?`https://www.google.com/maps/dir/${enc(row.from)}/${enc(row.to)}`:null;
    const isFlt=(row.transport||"").toLowerCase().includes("flight");
    const fltUrl=isFlt&&row.from&&row.to?`https://www.google.com/flights?q=Flights+from+${enc(row.from)}+to+${enc(row.to)}`:null;
    return `<div style="display:flex;align-items:flex-start;gap:16px;padding:16px 20px;border-bottom:${last?"none":`1px solid ${B}`};background:white;">
      <div style="flex-shrink:0;width:64px;text-align:right;font-size:11px;font-weight:600;color:${IM};padding-top:2px;">${fmtTime(row.time)||"—"}</div>
      <div style="flex:1;min-width:0;">
        ${cat?`<div style="display:inline-flex;align-items:center;gap:4px;background:${cat.bg};color:${cat.color};padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">${cat.icon} ${row.category}</div>`:""}
        <div style="font-size:15px;font-weight:700;color:${I};line-height:1.3;margin-bottom:4px;">${row.destination||row.city||"—"}</div>
        ${(row.transport||row.from||row.to)?`<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:${IM};flex-wrap:wrap;margin-bottom:4px;">${ti?`<span>${ti}</span>`:""}${row.transport?`<span style="font-weight:600;color:${IS};">${row.transport}</span>`:""}${row.transport&&(row.from||row.to)?`<span style="color:#CBD5E1;">·</span>`:""}${row.from?`<span>${row.from}</span>`:""}${row.from&&row.to?`<span style="color:#94A3B8;">→</span>`:""}${row.to?`<span>${row.to}</span>`:""}</div>`:""}
        ${row.notes?`<div style="font-size:11px;color:${IM};font-style:italic;margin-bottom:6px;">${row.notes}</div>`:""}
        <div style="display:flex;flex-wrap:wrap;margin-top:6px;">
          <a href="${mapUrl}" style="font-size:11px;font-weight:500;color:${N};margin-right:16px;text-decoration:none;">📍 View in Google Maps</a>
          ${routeUrl?`<a href="${routeUrl}" style="font-size:11px;font-weight:500;color:${N};margin-right:16px;text-decoration:none;">🗺 Open Route</a>`:""}
          ${fltUrl?`<a href="${fltUrl}" style="font-size:11px;font-weight:500;color:${N};margin-right:16px;text-decoration:none;">✈️ View Flights</a>`:""}
        </div>
      </div>
      <div style="flex-shrink:0;text-align:right;min-width:60px;">
        ${hasBudget?`${!isIDR&&budget>0?`<div style="font-size:13px;font-weight:700;color:${I};">${fmtC(budget,curr)}</div>`:""}${budgetIDR>0?`<div style="font-size:11px;color:${isIDR?I:IM};font-weight:${isIDR?700:400};">${fmtIDR(budgetIDR)}</div>`:""}`:`<div style="color:#CBD5E1;">—</div>`}
      </div>
    </div>`;
  };

  const daysHTML=days.map(([dk,dRows])=>{
    const dn=dk!=="__"?(dayMap[dk]??null):null; const city=dRows[0]?.city||""; const ds=dk!=="__"?fmtDate(dk):"";
    return `<div class="day-block" style="margin-bottom:20px;border:1px solid ${B};border-radius:12px;overflow:hidden;">
      <div style="background:${N};padding:12px 20px;display:flex;align-items:center;gap:14px;">
        ${dn!==null?`<div style="background:white;color:${N};border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">${dn}</div>`:""}
        <div><div style="color:white;font-size:16px;font-weight:700;">Day ${dn??"—"}${city?` — ${city}`:""}</div>${ds?`<div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:1px;">${ds}</div>`:""}</div>
      </div>
      ${dRows.map((r,i)=>rowHTML(r,i===dRows.length-1)).join("")}
    </div>`;
  }).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>Backpackervun — Travel Itinerary</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page{size:A4 portrait;margin:10mm 12mm;}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    html,body{margin:0;padding:0;background:white;font-family:'Montserrat',sans-serif;color:${I};font-size:13px;line-height:1.5;}
    a{color:${N};text-decoration:none;}
    .day-block{break-inside:avoid;page-break-inside:avoid;}
  </style></head><body>
  <div style="padding:22px 32px 18px;display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid ${B};">
    <div><div style="font-size:22px;font-weight:700;color:${N};">Backpackervun</div><div style="font-size:10px;font-weight:600;color:${IM};letter-spacing:0.22em;text-transform:uppercase;margin-top:3px;">Travel Planner</div></div>
    <div style="text-align:right;">${!isIDR?`<div style="margin-bottom:6px;"><div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:${IM};">TOTAL · ${curr.code}</div><div style="font-size:20px;font-weight:700;color:${I};">${fmtC(totalLocal,curr)}</div></div>`:""}<div><div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:${N};">TOTAL · IDR</div><div style="font-size:${isIDR?"20px":"15px"};font-weight:700;color:${N};">${fmtIDR(totalIDR)}</div></div></div>
  </div>
  <div style="padding:24px 32px 20px;border-bottom:1px solid ${B};">
    ${tripInfo?.clientName?`<div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.2em;color:${IM};">PREPARED FOR CLIENT</div><div style="font-size:34px;font-weight:700;color:${I};line-height:1.1;margin:4px 0 20px;">${tripInfo.clientName}</div>`:""}
    ${[["DURATION",tripInfo?.duration||"—"],["DESTINATIONS",tripInfo?.destinations||"—"],["TRAVEL DATES",tripInfo?.travelDates||(tripInfo?.startDate&&tripInfo?.endDate?`${tripInfo.startDate} – ${tripInfo.endDate}`:"—")],["REGION",region?`${FLAGS[region]||"🌍"} ${region}`:"—"]].map(([l,v])=>`<div style="display:flex;padding:4px 0;"><div style="width:130px;flex-shrink:0;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;color:${IM};padding-top:2px;">${l}</div><div style="font-size:13px;font-weight:500;color:${I};">${v}</div></div>`).join("")}
  </div>
  <div style="padding:22px 32px 8px;"><div style="display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;color:${I};"><div style="width:24px;height:2px;background:${N};flex-shrink:0;"></div>Itinerary</div></div>
  <div style="padding:4px 32px 8px;">${meaningful.length===0?`<div style="padding:40px;text-align:center;color:${IM};">No itinerary entries.</div>`:daysHTML}</div>
  <div style="padding:16px 32px 8px;">
    <div style="font-size:20px;font-weight:700;color:${I};margin-bottom:16px;">Trip Summary</div>
    <div style="border:1px solid ${B};border-radius:10px;overflow:hidden;">
      ${[{l:"Total stops",v:meaningful.length,b:false,a:false},{l:"Total days",v:totalDays,b:false,a:false},{l:"Conversion rate",v:isIDR?"1:1":`1 ${curr.code} = ${rate} IDR`,b:false,a:false},...(!isIDR?[{l:`TOTAL · ${curr.code}`,v:fmtC(totalLocal,curr),b:true,a:false}]:[]),{l:"TOTAL · IDR",v:fmtIDR(totalIDR),b:true,a:true}].map(({l,v,b,a})=>`<div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid ${B};background:white;"><span style="font-size:13px;color:${b?I:IM};font-weight:${b?600:400};">${l}</span><span style="font-size:13px;color:${a?N:I};font-weight:${b?700:400};">${v}</span></div>`).join("")}
    </div>
  </div>
  <div style="margin:24px 32px 0;padding:16px 0;border-top:1px solid ${B};text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.2em;color:${IM};">PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM</div>
  </body></html>`;
}

export async function POST(request) {
  let browser;
  try {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    const data = await request.json();
    const html = buildHTML(data);

    browser = await puppeteer.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => document.fonts?.ready);

    const pdf = await page.pdf({ format:"A4", printBackground:true, preferCSSPageSize:true });
    await browser.close();

    const name = data.tripInfo?.clientName?.replace(/[^a-z0-9]/gi,"-").toLowerCase() || "itinerary";
    return new NextResponse(pdf, {
      headers: { "Content-Type":"application/pdf", "Content-Disposition":`attachment; filename="backpackervun-${name}.pdf"`, "Cache-Control":"no-store" }
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error("[export-pdf]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
