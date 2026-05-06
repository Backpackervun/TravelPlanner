"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header         from "@/components/Header";
import HelpModal      from "@/components/HelpModal";
import PrintHeader    from "@/components/PrintHeader";
import PrintLayout    from "@/components/PrintLayout";
import ProjectsModal  from "@/components/ProjectsModal";
import SetupScreen    from "@/components/SetupScreen";
import TripInfoPanel  from "@/components/TripInfoPanel";
import ItineraryTable from "@/components/ItineraryTable";
import ChartsPanel    from "@/components/ChartsPanel";
import CTACard        from "@/components/CTACard";
import Footer         from "@/components/Footer";
import RedeemModal    from "@/components/RedeemModal";
import UpgradeModal   from "@/components/UpgradeModal";

import { useAuth }                       from "@/context/AuthProvider";
import { usePlan }                       from "@/hooks/usePlan";
import { useLanguage }                   from "@/hooks/useLanguage";
import { saveProject, countUserTrips }   from "@/lib/firestore";
import { fetchRateToIDR, invalidateRate } from "@/lib/exchangeRates";
import { DEFAULT_RATE, generateId, getCurrency } from "@/lib/utils";

const STORAGE_KEY = "backpackervun-v6";
const BLANK_TRIP  = { clientName:"", duration:"", destinations:"", travelDates:"", startDate:"", endDate:"" };

// ── Row helpers ───────────────────────────────────────────────────────────────

function syncIDR(row, rate) {
  return { ...row, budgetIDR: Math.round((Number(row.budgetLocal) || 0) * (Number(rate) || 0)) };
}
function syncLocal(row, rate) {
  const safeRate = Number(rate) || 1;
  return { ...row, budgetLocal: Math.round((Number(row.budgetIDR) || 0) / safeRate) };
}

function normalizeRow(row, rate) {
  const r = { ...row };
  if (r.budgetJPY !== undefined && r.budgetLocal === undefined) r.budgetLocal = r.budgetJPY;
  delete r.budgetJPY; delete r.durationMin; delete r.durationMax; delete r.costMin; delete r.costMax;
  if (typeof r.budgetIDR !== "number") return syncIDR(r, rate);
  return r;
}
function blankRow(sibling) {
  return { id: generateId(), date: sibling?.date ?? "", time: "", city: sibling?.city ?? "", destination:"", from:"", to:"", transport:"", notes:"", category:"", budgetLocal:0, budgetIDR:0 };
}
function buildDayMap(rows) {
  const dates = [...new Set(rows.map(r => (r.date || "").trim()).filter(Boolean))].sort();
  const m = {};
  dates.forEach((d, i) => { m[d] = i + 1; });
  return m;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshPlan } = useAuth();
  const { plan, canSave, canExportPDF, checkTrip, isLocked } = usePlan();
  const { lang, setLang, t }  = useLanguage();

  const [hydrated, setHydrated]     = useState(false);
  const [mode, setMode]             = useState("edit");
  const [rows, setRows]             = useState([]);
  const [tripInfo, setTripInfo]     = useState(BLANK_TRIP);
  const [rate, setRate]             = useState(DEFAULT_RATE);
  const [rateSource, setRateSource] = useState("manual");
  const [rateUpdatedAt, setRateUA]  = useState(null);
  const [region, setRegion]         = useState(null);
  const [setupComplete, setSetup]   = useState(false);
  const [projectId, setProjectId]   = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [helpOpen, setHelpOpen]     = useState(false);
  const [helpTab, setHelpTab]       = useState("how");
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [redeemOpen, setRedeemOpen]     = useState(false);
  const [upgradeOpen, setUpgradeOpen]   = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const ratesFetched  = useRef(false);
  const initialChange = useRef(true);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Live rate fetch
  const applyLiveRate = useCallback(async (regionId) => {
    if (!regionId) return;
    const currency = getCurrency(regionId);
    if (currency.code === "IDR") {
      setRate(1); setRateSource("live"); setRateUA(new Date().toISOString());
      setRows(prev => prev.map(r => syncIDR(r, 1))); return;
    }
    try {
      const { rate: lr, updatedAt } = await fetchRateToIDR(currency.code);
      setRate(lr); setRateSource("live"); setRateUA(updatedAt);
      setRows(prev => prev.map(r => syncIDR(r, lr)));
    } catch {
      setRateSource("error");
    }
  }, []);

  // localStorage load
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const r = typeof p.rate === "number" && p.rate > 0 ? p.rate : DEFAULT_RATE;
        if (Array.isArray(p.rows)) setRows(p.rows.map(row => normalizeRow(row, r)));
        if (p.tripInfo) setTripInfo({ ...BLANK_TRIP, ...p.tripInfo });
        if (typeof p.region === "string") setRegion(p.region === "Korea" ? "South Korea" : p.region);
        if (typeof p.setupComplete === "boolean") setSetup(p.setupComplete);
        else if (p.region) setSetup(true);
        if (p.projectId) setProjectId(p.projectId);
        setRate(r);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !region || ratesFetched.current) return;
    ratesFetched.current = true;
    applyLiveRate(region);
  }, [hydrated, region, applyLiveRate]);

  // Persist to localStorage (fast, local)
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows, rate, tripInfo, region, setupComplete, projectId })); }
    catch { /* quota */ }
  }, [rows, rate, tripInfo, region, setupComplete, projectId, hydrated]);

  // Unsaved tracker
  useEffect(() => {
    if (!hydrated) return;
    if (initialChange.current) { initialChange.current = false; return; }
    setHasUnsaved(true);
  }, [rows, tripInfo, rate, region]); // eslint-disable-line

  const totalLocal = useMemo(() => rows.reduce((s, r) => s + (Number(r.budgetLocal) || 0), 0), [rows]);
  const totalIDR   = useMemo(() => Math.round(totalLocal * (Number(rate) || 0)), [totalLocal, rate]);
  const dayMap     = useMemo(() => buildDayMap(rows), [rows]);

  // ── DIRECTIONAL CURRENCY SYNC ──────────────────────────────────────────────
  // lastEditedField prevents recursive recalculation:
  //   if user edits LOCAL → IDR is derived
  //   if user edits IDR → LOCAL is derived
  //   the EDITED field is NEVER overwritten.
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, [field]: value };
      const rn = Number(rate) || 1;

      if (field === "budgetLocal") {
        // User edited local → recalculate IDR only
        next.budgetIDR   = Math.round((Number(value) || 0) * rn);
      } else if (field === "budgetIDR") {
        // User edited IDR → recalculate local only (IDR stays exact)
        next.budgetLocal = Math.round((Number(value) || 0) / rn);
      }

      // Auto-suggest Transport category
      if ((field === "from" || field === "to") && !next.category) {
        if ((next.from || "").trim() && (next.to || "").trim()) next.category = "Transport";
      }
      return next;
    }));
  };

  const handleRateChange = (v) => {
    const n = Number(v) || 0;
    setRate(n); setRateSource("manual");
    // When rate changes, update IDR from local (local is source of truth for rate-change recalcs)
    setRows(prev => prev.map(r => syncIDR(r, n)));
  };

  const addRow    = () => setRows(prev => [...prev, blankRow(prev[prev.length - 1])]);
  const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const insertAt  = (refId, pos) => {
    setRows(prev => {
      const i = prev.findIndex(r => r.id === refId);
      if (i === -1) return prev;
      const n = [...prev]; n.splice(pos === "above" ? i : i + 1, 0, blankRow(prev[i]));
      return n;
    });
  };

  const handleReset = () => {
    if (!window.confirm("Clear everything and start over?")) return;
    setRows([]); setTripInfo(BLANK_TRIP); setRate(DEFAULT_RATE); setRateSource("manual");
    setRegion(null); setSetup(false); setProjectId(null); setMode("edit");
    setHasUnsaved(false); ratesFetched.current = false; initialChange.current = true;
  };

  const handleRegionChange = (r) => {
    setRegion(r);
    invalidateRate(getCurrency(r).code);
    ratesFetched.current = false;
    if (r === "Indonesia") {
      setRate(1); setRateSource("live"); setRateUA(new Date().toISOString());
      setRows(prev => prev.map(row => syncIDR(row, 1)));
    } else { applyLiveRate(r); }
  };

  // ── PLAN-GATED SAVE ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    if (!canSave) {
      setUpgradeReason("Your plan doesn't allow saving trips. Enter a redeem code to unlock.");
      setUpgradeOpen(true); return;
    }
    // Check trip count limit
    try {
      const count = projectId ? 0 : await countUserTrips(user.uid); // 0 means updating existing
      const { allowed, reason } = checkTrip(count);
      if (!allowed) { setUpgradeReason(reason); setUpgradeOpen(true); return; }
    } catch { /* proceed */ }

    setSaveStatus("saving");
    try {
      const id = await saveProject(user.uid, projectId, { tripInfo, rows, region, rate });
      if (!projectId) setProjectId(id);
      setSaveStatus("saved"); setHasUnsaved(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      console.error("[save]", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleLoadProject = (p) => {
    const lr = p.rate ?? DEFAULT_RATE;
    setRows((p.rows ?? []).map(r => normalizeRow(r, lr)));
    setTripInfo({ ...BLANK_TRIP, ...(p.tripInfo ?? {}) });
    setRate(lr); setRateSource("manual");
    setRegion(p.region ?? null); setProjectId(p.id);
    setSetup(true); setMode("edit"); setHasUnsaved(false);
    ratesFetched.current = false; initialChange.current = true;
    if (p.region) { invalidateRate(getCurrency(p.region).code); applyLiveRate(p.region); }
  };

  const inPreview = mode === "preview";
  const showSetup = hydrated && !setupComplete;
  const currency  = getCurrency(region);

  if (authLoading || !hydrated) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-navy-500 border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`paper-bg min-h-screen flex flex-col ${inPreview ? "preview-mode" : ""}`}>

      {/* ── SETUP ── */}
      {showSetup && (
        <>
          <header className="border-b border-paper-line bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
                <span className="hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:block">Travel Planner</span>
              </div>
              <button onClick={() => { setHelpTab("how"); setHelpOpen(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200">
                ❓ {t("help")}
              </button>
            </div>
          </header>
          <div className="flex-1">
            {/* FREE LOCKED gate on setup — user can still browse but can't start planning */}
            {isLocked && (
              <div className="mx-auto max-w-3xl px-4 pt-8">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🔒</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-amber-900 text-sm">Access Required</p>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">Enter a redeem code or upgrade your plan to start creating itineraries.</p>
                  </div>
                  <button onClick={() => setRedeemOpen(true)}
                    className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                    Enter Code
                  </button>
                </div>
              </div>
            )}
            <SetupScreen
              tripInfo={tripInfo} region={region}
              onTripInfoChange={setTripInfo}
              onRegionChange={handleRegionChange}
              onStart={() => {
                if (isLocked) { setRedeemOpen(true); return; }
                setSetup(true); initialChange.current = true;
              }}
            />
          </div>
        </>
      )}

      {/* ── PLANNER ── */}
      {!showSetup && (
        <>
          <Header
            rate={rate}              onRateChange={handleRateChange}
            onReset={handleReset}    onPrint={() => window.print()}
            onHelp={() => { setHelpTab("how"); setHelpOpen(true); }}
            onSave={handleSave}      onLoadOpen={() => setProjectsOpen(true)}
            saveStatus={saveStatus}  hasUnsavedChanges={hasUnsaved}
            totalLocal={totalLocal}  totalIDR={totalIDR}
            mode={mode}              onModeChange={setMode}
            region={region}          onRegionChange={handleRegionChange}
            rateSource={rateSource}  rateUpdatedAt={rateUpdatedAt}
            lang={lang}              setLang={setLang}
            onRedeemOpen={() => setRedeemOpen(true)}
            plan={plan}
          />

          {/*
            SIDEBAR LAYOUT FIX:
            - flex-1 on main ensures footer stays at bottom
            - grid uses align-items: start (items-start) so sidebar doesn't stretch full height
            - sidebar has self-start + sticky, grid parent must NOT have overflow:hidden
          */}
          <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />

            {/* Grid — items-start is critical for sticky sidebar */}
            <div className="mt-8 grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                {/* Plan-locked overlay on itinerary */}
                {isLocked ? (
                  <div className="rounded-2xl border border-paper-line bg-white p-10 text-center shadow-soft">
                    <span className="text-4xl">🔒</span>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{t("lockedTitle")}</h3>
                    <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">{t("lockedBody")}</p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                      <button onClick={() => setRedeemOpen(true)} className="rounded-xl bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600">
                        🎟️ {t("redeemCode")}
                      </button>
                      <a href="https://wa.me/6281298053826" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-paper-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-dim">
                        {t("chatWA")}
                      </a>
                    </div>
                  </div>
                ) : (
                  <ItineraryTable
                    rows={rows} dayMap={dayMap} region={region}
                    onUpdate={updateRow} onAdd={addRow} onDelete={deleteRow}
                    onInsertAbove={id => insertAt(id, "above")}
                    onInsertBelow={id => insertAt(id, "below")}
                  />
                )}
              </div>

              {/* Sidebar — self-start + sticky keeps it anchored at the top */}
              <aside className="min-w-0 space-y-4 lg:self-start lg:sticky lg:top-[72px]">
                <ChartsPanel rows={rows} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
                <CTACard tripInfo={tripInfo} totalLocal={totalLocal} currency={currency} totalIDR={totalIDR} />
              </aside>
            </div>
          </main>

          <Footer />
        </>
      )}

      {/* ── PRINT / PREVIEW ── */}
      {!showSetup && (
        <div className="print-layout">
          {inPreview && (
            <div className="no-print sticky top-0 z-30 border-b border-paper-line bg-white/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
                <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-500">Preview</span>
                <div className="flex gap-2">
                  <button onClick={() => setMode("edit")} className="rounded-lg border border-paper-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-soft hover:border-navy-200">← {t("backToEdit")}</button>
                  <button onClick={() => {
                    if (!canExportPDF) { setUpgradeReason("PDF export requires a paid plan."); setUpgradeOpen(true); return; }
                    window.print();
                  }} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-navy-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>
                    </svg>
                    {t("exportPDF")}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className={inPreview ? "preview-frame" : ""}>
            <PrintHeader totalLocal={totalLocal} totalIDR={totalIDR} region={region} />
            <PrintLayout tripInfo={tripInfo} rows={rows} dayMap={dayMap} region={region} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
          </div>
        </div>
      )}

      {/* Modals */}
      <HelpModal     open={helpOpen}     initialTab={helpTab}   onClose={() => setHelpOpen(false)} />
      <ProjectsModal open={projectsOpen} userId={user?.uid}     onClose={() => setProjectsOpen(false)} onLoad={handleLoadProject} />
      <RedeemModal   open={redeemOpen}   onClose={() => setRedeemOpen(false)} onSuccess={() => refreshPlan()} />
      <UpgradeModal  open={upgradeOpen}  onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />
    </div>
  );
}
