"use client";

/**
 * /pdf-render — Backpackervun PDF Renderer (patch-v4)
 *
 * Fixes:
 * 1. PAGE BREAKS: smarter break-inside + break-before/after rules
 *    so cards never get cut in the middle, sections start clean
 * 2. iOS LINKS: clearer "Create PDF" instructions — the only iOS method
 *    that preserves clickable hyperlinks in the output file
 * 3. Minor spacing tweaks for cleaner multi-page layout
 */

import { useEffect, useMemo, useState } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const N  = "#0B3C5D";
const I  = "#1E293B";
const IS = "#475569";
const IM = "#94A3B8";
const B  = "#E8EDF3";

const CATEGORY = {
  Transport:  { icon:"🚌", bg:"#EFF6FF", color:"#1D4ED8", bar:"#3B82F6" },
  Hotel:      { icon:"🏨", bg:"#F0FDF4", color:"#15803D", bar:"#22C55E" },
  Food:       { icon:"🍽️", bg:"#FFF7ED", color:"#C2410C", bar:"#F97316" },
  Attraction: { icon:"🎡", bg:"#FDF4FF", color:"#7E22CE", bar:"#A855F7" },
  Activity:   { icon:"🏃", bg:"#ECFDF5", color:"#065F46", bar:"#10B981" },
};

const TICONS = {
  Flight:"✈️",Shinkansen:"🚅",Train:"🚆",KTX:"🚄","High-Speed Rail":"🚄",
  Bus:"🚌",FlixBus:"🚌",Car:"🚗",Ferry:"⛴️",Walk:"🚶",Taxi:"🚕",
  MRT:"🚇",LRT:"🚇",Subway:"🚇",Tram:"🚊",BTS:"🚊",Eurostar:"🚄",
  Ojek:"🛵",Motorbike:"🛵","Tuk-Tuk":"🛺",Grab:"🚗",Uber:"🚗",Amtrak:"🚆",
};

const FLAGS = {
  Japan:"🇯🇵","South Korea":"🇰🇷",Thailand:"🇹🇭",Singapore:"🇸🇬",
  Malaysia:"🇲🇾",Europe:"🇪🇺",Australia:"🇦🇺",Indonesia:"🇮🇩",
  Vietnam:"🇻🇳",China:"🇨🇳",USA:"🇺🇸",
};

const CURRENCIES = {
  Japan:        {code:"JPY", symbol:"¥",  locale:"ja-JP"},
  "South Korea":{code:"KRW", symbol:"₩",  locale:"ko-KR"},
  Thailand:     {code:"THB", symbol:"฿",  locale:"th-TH"},
  Singapore:    {code:"SGD", symbol:"S$", locale:"en-SG"},
  Malaysia:     {code:"MYR", symbol:"RM", locale:"ms-MY"},
  Europe:       {code:"EUR", symbol:"€",  locale:"de-DE"},
  Australia:    {code:"AUD", symbol:"A$", locale:"en-AU"},
  Indonesia:    {code:"IDR", symbol:"Rp", locale:"id-ID"},
  Vietnam:      {code:"VND", symbol:"₫",  locale:"vi-VN"},
  China:        {code:"CNY", symbol:"¥",  locale:"zh-CN"},
  USA:          {code:"USD", symbol:"$",  locale:"en-US"},
};

function getCurr(r){return CURRENCIES[r]??{code:"IDR",symbol:"Rp",locale:"id-ID"};}

function fmtC(amount,curr){
  if(!amount&&amount!==0)return`${curr.symbol}0`;
  try{return new Intl.NumberFormat(curr.locale,{style:"currency",currency:curr.code,maximumFractionDigits:["IDR","VND","KRW"].includes(curr.code)?0:2}).format(Number(amount));}
  catch{return`${curr.symbol}${Number(amount).toLocaleString()}`;}
}

function fmtIDR(a){
  if(!a&&a!==0)return"Rp 0";
  try{return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(a));}
  catch{return`Rp ${Number(a).toLocaleString("id-ID")}`;}
}

function fmtTime(t){
  if(!t)return"";
  const[h,m]=t.split(":").map(Number);
  if(isNaN(h))return t;
  return`${h>12?h-12:h===0?12:h}:${String(m||0).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}

function fmtDateReadable(s){
  if(!s||typeof s!=="string")return s||"";
  s=s.trim();
  try{
    let d;
    if(/^\d{4}-\d{2}-\d{2}/.test(s))d=new Date(s+"T12:00:00");
    else{const p=s.split(/[\/\-]/);d=p.length===3?new Date(`${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}T12:00:00`):new Date(s);}
    return isNaN(d)?s:d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  }catch{return s;}
}

function fmtTravelDates(td,startDate,endDate){
  if(startDate&&endDate)return`${fmtDateReadable(startDate)} – ${fmtDateReadable(endDate)}`;
  if(!td)return"—";
  const sep=td.includes("–")?"–":td.includes(" - ")?" - ":null;
  if(sep){const[s,e]=td.split(sep).map(x=>x.trim());return`${fmtDateReadable(s)} – ${fmtDateReadable(e)}`;}
  return fmtDateReadable(td)||td;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRINT CSS — Key strategy for clean page breaks:
//
// 1. .day-block  → break-inside:avoid — never cut a day card mid-content
//    But allow a break BEFORE a day block if needed (break-before: auto)
// 2. .row-item   → break-inside:avoid — never cut a row item
// 3. .no-break   → break-inside:avoid — for section headers + first item
// 4. .analytics-block → break-inside:avoid
// 5. Widows/orphans = 3 — prevents single lines dangling on new page
// 6. Generous page margins so content never feels cramped at edges
// ══════════════════════════════════════════════════════════════════════════════
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

@page {
  size: A4 portrait;
  margin: 14mm 14mm 18mm 14mm;
  /* More bottom margin — browser adds URL/date footer, this prevents overlap */
}

*, *::before, *::after {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

html, body {
  margin: 0;
  padding: 0;
  background: white;
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1E293B;
  font-size: 13px;
  line-height: 1.5;
  widows: 3;
  orphans: 3;
}

a { color: #0B3C5D; text-decoration: none; }

/* ─── PAGE BREAK RULES ─────────────────────────────────────────────────────
   Core strategy:
   - Day cards never split in the middle
   - Individual row items never split
   - Analytics section stays together
   - Section headings always stay with their first item
   ─────────────────────────────────────────────────────────────────────── */

/* Each day card: avoid splitting internally */
.day-block {
  break-inside: avoid;
  page-break-inside: avoid;
  /* Don't force break-before — let browser decide */
  margin-bottom: 20px;
}

/* Row item within a day card: never split */
.row-item {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Section heading + first item must stay together */
.section-group {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Analytics block: keep whole section together if fits */
.analytics-block {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Stats cards row */
.stats-row {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Category bars table */
.cat-table {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Transport chips row */
.transport-row {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Trip summary section */
.summary-section {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* ─── SCREEN ONLY ─────────────────────────────────────────────────────────── */
@media screen {
  body { max-width: 794px; margin: 0 auto; }
  .screen-only { display: block; }
}

@media print {
  .screen-only { display: none !important; }
}
`;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PDFRenderPage(){
  const[data,setData]=useState(null);
  const[ready,setReady]=useState(false);

  const isIOS = typeof navigator!=="undefined"&&/iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem("bpv-pdf-render")||sessionStorage.getItem("bpv-pdf-render");
      if(raw){
        setData(JSON.parse(raw));
        setTimeout(()=>{
          try{localStorage.removeItem("bpv-pdf-render");}catch{}
          try{sessionStorage.removeItem("bpv-pdf-render");}catch{}
        },15000);
      }
    }catch(e){console.error("PDF data error:",e);}
    setReady(true);
  },[]);

  useEffect(()=>{
    if(!data||!ready||isIOS)return;
    const go=()=>window.print();
    if(document.fonts?.ready){document.fonts.ready.then(()=>setTimeout(go,300));}
    else{setTimeout(go,800);}
  },[data,ready]); // eslint-disable-line

  if(!ready)return<Splash text="Loading…"/>;
  if(!data) return<Splash text="No data found. Please export from the Travel Planner." link="/dashboard"/>;

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:PRINT_CSS}}/>

      {/* ── iOS instructions ── */}
      {isIOS&&(
        <div className="screen-only" style={{background:N,padding:"14px 20px",fontFamily:"Montserrat,sans-serif"}}>
          <div style={{color:"white",fontSize:"14px",fontWeight:700,marginBottom:"10px"}}>
            Backpackervun — Save Itinerary as PDF
          </div>

          {/* PRIMARY METHOD — preserves clickable links */}
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:"10px",padding:"12px 14px",marginBottom:"10px",border:"1px solid rgba(255,255,255,0.25)"}}>
            <div style={{color:"#86EFAC",fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>
              ✅ Recommended — Links stay clickable
            </div>
            <div style={{color:"white",fontSize:"13px",fontWeight:600,marginBottom:"4px"}}>
              Share → "Create PDF"
            </div>
            <div style={{color:"rgba(255,255,255,0.75)",fontSize:"12px",lineHeight:1.7}}>
              1. Tap <strong style={{color:"white"}}>□↑</strong> Share (bottom of Safari)<br/>
              2. Scroll the share sheet → tap <strong style={{color:"white"}}>"Create PDF"</strong><br/>
              3. Tap the <strong style={{color:"white"}}>□↑</strong> Share icon in top-right<br/>
              4. Tap <strong style={{color:"white"}}>"Save to Files"</strong> → Done
            </div>
          </div>

          {/* FALLBACK — print dialog, links may not be clickable */}
          <div style={{background:"rgba(255,255,255,0.07)",borderRadius:"10px",padding:"10px 14px"}}>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",fontWeight:600,marginBottom:"4px"}}>
              Alternative (links may not work in output)
            </div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:"12px",lineHeight:1.6}}>
              Share → Print → pinch-zoom on preview → □↑ Share → Save to Files
            </div>
            <button
              onClick={()=>window.print()}
              style={{marginTop:"8px",background:"rgba(255,255,255,0.15)",color:"white",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"7px",padding:"7px 14px",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}
            >
              Open Print Dialog
            </button>
          </div>
        </div>
      )}

      {/* Desktop re-print */}
      {!isIOS&&(
        <div className="screen-only" style={{padding:"8px 16px",textAlign:"right",background:"#F8FAFC",borderBottom:`1px solid ${B}`,fontFamily:"Montserrat,sans-serif"}}>
          <button onClick={()=>window.print()} style={{background:N,color:"white",border:"none",borderRadius:"6px",padding:"6px 14px",fontSize:"11px",fontWeight:600,cursor:"pointer"}}>
            Print / Save as PDF again
          </button>
        </div>
      )}

      <Document {...data}/>
    </>
  );
}

function Splash({text,link}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0f172a",fontFamily:"Montserrat,sans-serif",color:"white"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"14px",color:"rgba(255,255,255,0.7)",marginBottom:"12px"}}>{text}</div>
        {link&&<a href={link} style={{fontSize:"12px",color:"rgba(255,255,255,0.4)",textDecoration:"underline"}}>← Back to Dashboard</a>}
      </div>
    </div>
  );
}

// ── Document ──────────────────────────────────────────────────────────────────

function Document({tripInfo,rows,dayMap,region,rate,totalLocal,totalIDR}){
  const curr=getCurr(region);
  const isIDR=curr.code==="IDR";

  const meaningful=rows.filter(r=>
    r.destination||r.city||r.notes||r.from||r.to||
    Number(r.budgetLocal)>0||Number(r.budgetIDR)>0
  );

  const byDay=new Map();
  for(const r of meaningful){
    const key=(r.date||"").trim()||"__";
    if(!byDay.has(key))byDay.set(key,[]);
    byDay.get(key).push(r);
  }
  const days=[...byDay.entries()].sort(([a],[b])=>{
    return(a==="__"?999:(dayMap[a]??999))-(b==="__"?999:(dayMap[b]??999));
  });

  const catTotals=useMemo(()=>{
    const m={};
    for(const r of rows){if(r.category)m[r.category]=(m[r.category]??0)+(Number(r.budgetLocal)||0);}
    return m;
  },[rows]);

  const tCounts=useMemo(()=>{
    const m={};
    for(const r of rows){if(r.transport)m[r.transport]=(m[r.transport]??0)+1;}
    return m;
  },[rows]);

  const totalDays=Object.keys(dayMap).length||1;
  const travelDatesFormatted=fmtTravelDates(tripInfo?.travelDates,tripInfo?.startDate,tripInfo?.endDate);

  return(
    <div style={{background:"white"}}>

      {/* ── HEADER — no break-before (starts page 1) ── */}
      <div style={{padding:"20px 32px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",borderBottom:`1px solid ${B}`}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:700,color:N,lineHeight:1}}>Backpackervun</div>
          <div style={{fontSize:"10px",fontWeight:600,color:IM,letterSpacing:"0.22em",textTransform:"uppercase",marginTop:"3px"}}>Travel Planner</div>
        </div>
        <div style={{textAlign:"right"}}>
          {!isIDR&&<div style={{marginBottom:"6px"}}>
            <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.15em",color:IM}}>TOTAL · {curr.code}</div>
            <div style={{fontSize:"20px",fontWeight:700,color:I,lineHeight:1.1}}>{fmtC(totalLocal,curr)}</div>
          </div>}
          <div>
            <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.15em",color:N}}>TOTAL · IDR</div>
            <div style={{fontSize:isIDR?"20px":"15px",fontWeight:700,color:N,lineHeight:1.1}}>{fmtIDR(totalIDR)}</div>
          </div>
        </div>
      </div>

      {/* ── TRIP INFO ── */}
      <div style={{padding:"20px 32px 18px",borderBottom:`1px solid ${B}`}}>
        {tripInfo?.clientName&&<>
          <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.2em",color:IM}}>PREPARED FOR CLIENT</div>
          <div style={{fontSize:"30px",fontWeight:700,color:I,lineHeight:1.1,margin:"4px 0 18px"}}>{tripInfo.clientName}</div>
        </>}
        {[
          ["DURATION",    tripInfo?.duration||"—"],
          ["DESTINATIONS",tripInfo?.destinations||"—"],
          ["TRAVEL DATES",travelDatesFormatted],
          ["REGION",      region?`${FLAGS[region]||"🌍"} ${region}`:"—"],
        ].map(([lbl,val])=>(
          <div key={lbl} style={{display:"flex",alignItems:"flex-start",padding:"3px 0"}}>
            <div style={{width:"130px",flexShrink:0,fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.15em",color:IM,paddingTop:"2px"}}>{lbl}</div>
            <div style={{fontSize:"13px",fontWeight:500,color:I}}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── ITINERARY HEADING (keeps with first day card) ── */}
      <div style={{padding:"18px 32px 6px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",fontSize:"20px",fontWeight:700,color:I}}>
          <div style={{width:"24px",height:"2px",background:N,flexShrink:0}}/>
          Itinerary
        </div>
      </div>

      {/* ── DAY BLOCKS — each is a self-contained card with break-inside:avoid ── */}
      <div style={{padding:"4px 32px 0"}}>
        {days.length===0?(
          <div style={{padding:"40px",textAlign:"center",color:IM}}>No itinerary entries.</div>
        ):days.map(([dateKey,dayRows])=>{
          const dn=dateKey!=="__"?(dayMap[dateKey]??null):null;
          const city=dayRows[0]?.city||"";
          const dStr=dateKey!=="__"?fmtDateReadable(dateKey):"";
          return(
            // .day-block = break-inside:avoid so entire card stays on one page
            // If the card is too tall for remaining space, browser pushes it to next page cleanly
            <div key={dateKey} className="day-block" style={{border:`1px solid ${B}`,borderRadius:"12px",overflow:"hidden"}}>
              <div style={{background:N,padding:"11px 20px",display:"flex",alignItems:"center",gap:"14px"}}>
                {dn!==null&&(
                  <div style={{background:"white",color:N,borderRadius:"50%",width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"14px",flexShrink:0}}>{dn}</div>
                )}
                <div>
                  <div style={{color:"white",fontSize:"15px",fontWeight:700}}>Day {dn??"—"}{city?` — ${city}`:""}</div>
                  {dStr&&<div style={{color:"rgba(255,255,255,0.7)",fontSize:"11px",marginTop:"1px"}}>{dStr}</div>}
                </div>
              </div>
              {dayRows.map((row,i)=>(
                <RowItem key={row.id??i} row={row} curr={curr} isIDR={isIDR} last={i===dayRows.length-1}/>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── BUDGET AT A GLANCE ── */}
      <div style={{padding:"20px 32px 0"}}>
        <div className="section-group">
          <div style={{display:"flex",alignItems:"center",gap:"12px",fontSize:"20px",fontWeight:700,color:I,marginBottom:"12px"}}>
            <div style={{width:"24px",height:"2px",background:N,flexShrink:0}}/>
            Budget at a Glance
          </div>

          {/* Stats row */}
          <div className="stats-row" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"10px",marginBottom:"10px"}}>
            <div style={{borderRadius:"10px",border:`1px solid ${B}`,background:"#F8FAFC",padding:"14px"}}>
              <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:IM,marginBottom:"4px"}}>TOTAL BUDGET</div>
              <div style={{fontSize:"22px",fontWeight:700,color:N,lineHeight:1.1}}>{fmtIDR(totalIDR)}</div>
              {!isIDR&&<div style={{fontSize:"11px",color:IS,marginTop:"4px"}}>≈ {fmtC(totalLocal,curr)} · 1 {curr.code} = {rate} IDR</div>}
            </div>
            <div style={{borderRadius:"10px",border:`1px solid ${B}`,background:"white",padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:IM,marginBottom:"4px"}}>TOTAL STOPS</div>
              <div style={{fontSize:"30px",fontWeight:700,color:I}}>{meaningful.length}</div>
            </div>
            <div style={{borderRadius:"10px",border:`1px solid ${B}`,background:"white",padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:"9px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:IM,marginBottom:"4px"}}>TOTAL DAYS</div>
              <div style={{fontSize:"30px",fontWeight:700,color:I}}>{totalDays}</div>
            </div>
          </div>
        </div>

        {/* Budget per category */}
        {Object.keys(catTotals).length>0&&(
          <div className="cat-table" style={{borderRadius:"10px",border:`1px solid ${B}`,overflow:"hidden",marginBottom:"10px"}}>
            <div style={{background:"#F8FAFC",borderBottom:`1px solid ${B}`,padding:"10px 16px",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:IM}}>
              BUDGET PER CATEGORY
            </div>
            {Object.entries(catTotals).map(([cat,val])=>{
              const pct=totalLocal>0?Math.round((val/totalLocal)*100):0;
              const c=CATEGORY[cat]??{icon:"📌",bar:"#6B7280"};
              return(
                <div key={cat} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 16px",background:"white",borderBottom:`1px solid ${B}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",width:"108px",flexShrink:0}}>
                    <span style={{fontSize:"14px",lineHeight:1}}>{c.icon}</span>
                    <span style={{fontSize:"12px",fontWeight:500,color:IS}}>{cat}</span>
                  </div>
                  <div style={{flex:1,height:"8px",borderRadius:"4px",background:"#E8EDF3",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:c.bar,borderRadius:"4px"}}/>
                  </div>
                  <span style={{fontSize:"10px",fontWeight:600,color:IM,width:"32px",textAlign:"right"}}>{pct}%</span>
                  <span style={{fontSize:"12px",fontWeight:600,color:I,width:"80px",textAlign:"right"}}>{fmtC(val,curr)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Transport usage */}
        {Object.keys(tCounts).length>0&&(
          <div className="transport-row" style={{borderRadius:"10px",border:`1px solid ${B}`,overflow:"hidden",marginBottom:"10px"}}>
            <div style={{background:"#F8FAFC",borderBottom:`1px solid ${B}`,padding:"10px 16px",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.18em",color:IM}}>
              TRANSPORT USAGE
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"10px",padding:"12px 16px",background:"white"}}>
              {Object.entries(tCounts).map(([t,cnt])=>{
                const icon=TICONS[t]??"🚌";
                const total=Object.values(tCounts).reduce((a,b)=>a+b,0);
                const pct=Math.round((cnt/total)*100);
                return(
                  <div key={t} style={{display:"flex",alignItems:"center",gap:"8px",border:`1px solid ${B}`,borderRadius:"10px",padding:"10px 14px",background:"white"}}>
                    <span style={{fontSize:"20px",lineHeight:1}}>{icon}</span>
                    <div>
                      <div style={{fontSize:"12px",fontWeight:600,color:I}}>{t}</div>
                      <div style={{fontSize:"10px",color:IM}}>{cnt} leg{cnt>1?"s":""} · {pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── TRIP SUMMARY ── */}
      <div className="summary-section" style={{padding:"0 32px 20px"}}>
        <div style={{fontSize:"20px",fontWeight:700,color:I,marginBottom:"14px",paddingTop:"10px"}}>Trip Summary</div>
        <div style={{border:`1px solid ${B}`,borderRadius:"10px",overflow:"hidden"}}>
          {[
            {label:"Total stops",    val:meaningful.length,                                    bold:false,accent:false},
            {label:"Total days",     val:totalDays,                                             bold:false,accent:false},
            {label:"Conversion rate",val:isIDR?"1:1":`1 ${curr.code} = ${rate} IDR`,           bold:false,accent:false},
            ...(!isIDR?[{label:`TOTAL · ${curr.code}`,val:fmtC(totalLocal,curr),bold:true,accent:false}]:[]),
            {label:"TOTAL · IDR",    val:fmtIDR(totalIDR),                                     bold:true, accent:true },
          ].map(({label,val,bold,accent})=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:`1px solid ${B}`,background:"white"}}>
              <span style={{fontSize:"13px",color:bold?I:IM,fontWeight:bold?600:400}}>{label}</span>
              <span style={{fontSize:"13px",color:accent?N:I,fontWeight:bold?700:400}}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{margin:"0 32px 0",padding:"14px 0",borderTop:`1px solid ${B}`,textAlign:"center",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.2em",color:IM}}>
        PREPARED WITH BACKPACKERVUN · BACKPACKERVUN.COM
      </div>

    </div>
  );
}

// ── Row item ──────────────────────────────────────────────────────────────────

function RowItem({row,curr,isIDR,last}){
  const budget=Number(row.budgetLocal)||0;
  const budgetIDR=Number(row.budgetIDR)||0;
  const hasBudget=budget>0||budgetIDR>0;
  const cat=row.category?(CATEGORY[row.category]??null):null;
  const tIcon=row.transport?(TICONS[row.transport]??""):"";
  const enc=encodeURIComponent;

  const destQ=enc([row.destination,row.city,row.to].filter(Boolean).join(" ")||"");
  const mapUrl=`https://www.google.com/maps/search/?api=1&query=${destQ}`;
  const routeUrl=row.from&&row.to?`https://www.google.com/maps/dir/${enc(row.from)}/${enc(row.to)}`:null;
  const isFlt=(row.transport||"").toLowerCase().includes("flight");
  const fltUrl=isFlt&&row.from&&row.to?`https://www.google.com/flights?q=Flights+from+${enc(row.from)}+to+${enc(row.to)}`:null;

  return(
    <div className="row-item" style={{display:"flex",alignItems:"flex-start",gap:"14px",padding:"14px 20px",borderBottom:last?"none":`1px solid ${B}`,background:"white"}}>
      <div style={{flexShrink:0,width:"58px",textAlign:"right",fontSize:"11px",fontWeight:600,color:IM,paddingTop:"2px",fontVariantNumeric:"tabular-nums"}}>
        {fmtTime(row.time)||"—"}
      </div>
      <div style={{flex:1,minWidth:0}}>
        {cat&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:"4px",background:cat.bg,color:cat.color,padding:"2px 8px",borderRadius:"4px",fontSize:"9px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"5px"}}>
            <span>{cat.icon}</span>{row.category?.toUpperCase()}
          </div>
        )}
        <div style={{fontSize:"14px",fontWeight:700,color:I,lineHeight:1.3,marginBottom:"3px"}}>{row.destination||row.city||"—"}</div>
        {(row.transport||row.from||row.to)&&(
          <div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"11px",color:IM,flexWrap:"wrap",marginBottom:"3px"}}>
            {tIcon&&<span>{tIcon}</span>}
            {row.transport&&<span style={{fontWeight:600,color:IS}}>{row.transport}</span>}
            {row.transport&&(row.from||row.to)&&<span style={{color:"#CBD5E1"}}>·</span>}
            {row.from&&<span>{row.from}</span>}
            {row.from&&row.to&&<span style={{color:"#94A3B8"}}>→</span>}
            {row.to&&<span>{row.to}</span>}
          </div>
        )}
        {row.notes&&<div style={{fontSize:"11px",color:IM,fontStyle:"italic",marginBottom:"5px"}}>{row.notes}</div>}
        <div style={{marginTop:"5px",lineHeight:"1.9"}}>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",fontWeight:500,color:N,marginRight:"14px",display:"inline",whiteSpace:"nowrap"}}>📍 View in Google Maps</a>
          {routeUrl&&<a href={routeUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",fontWeight:500,color:N,marginRight:"14px",display:"inline",whiteSpace:"nowrap"}}>🗺 Open Route</a>}
          {fltUrl&&<a href={fltUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:"11px",fontWeight:500,color:N,marginRight:"14px",display:"inline",whiteSpace:"nowrap"}}>✈️ View Flights</a>}
        </div>
      </div>
      <div style={{flexShrink:0,textAlign:"right",minWidth:"62px"}}>
        {hasBudget?(
          <>
            {!isIDR&&budget>0&&<div style={{fontSize:"13px",fontWeight:700,color:I}}>{fmtC(budget,curr)}</div>}
            {budgetIDR>0&&<div style={{fontSize:"11px",color:isIDR?I:IM,fontWeight:isIDR?700:400}}>{fmtIDR(budgetIDR)}</div>}
          </>
        ):(
          <div style={{fontSize:"13px",color:"#CBD5E1"}}>—</div>
        )}
      </div>
    </div>
  );
}
