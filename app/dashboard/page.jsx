"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header        from "@/components/Header";
import HelpModal     from "@/components/HelpModal";
import PreviewModal  from "@/components/PreviewModal";   // THE ONLY preview system
import ProjectsModal from "@/components/ProjectsModal";
import SetupScreen   from "@/components/SetupScreen";
import TripInfoPanel from "@/components/TripInfoPanel";
import ItineraryTable from "@/components/ItineraryTable";
import ChartsPanel   from "@/components/ChartsPanel";
import { CTACard, CTAFab } from "@/components/CTACard";
import Footer        from "@/components/Footer";
import RedeemModal   from "@/components/RedeemModal";
import UpgradeModal  from "@/components/UpgradeModal";

import { useAuth }                          from "@/context/AuthProvider";
import { useT }                             from "@/context/TranslationContext";
import { usePlan }                          from "@/hooks/usePlan";
import { saveProject, countUserTrips }      from "@/lib/firestore";
import { fetchRateToIDR, invalidateRate }   from "@/lib/exchangeRates";
import { DEFAULT_RATE, generateId, getCurrency } from "@/lib/utils";

const STORAGE_KEY = "backpackervun-v7";
const BLANK_TRIP  = { clientName:"", duration:"", destinations:"", travelDates:"", startDate:"", endDate:"" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Re-compute IDR from local (local is source of truth) */
function syncIDR(row, rate) {
  return { ...row, budgetIDR: Math.round((Number(row.budgetLocal) || 0) * (Number(rate) || 0)) };
}

function normalizeRow(row, rate) {
  const r = { ...row };
  if (r.budgetJPY !== undefined && r.budgetLocal === undefined) r.budgetLocal = r.budgetJPY;
  delete r.budgetJPY; delete r.durationMin; delete r.durationMax; delete r.costMin; delete r.costMax;
  if (typeof r.budgetIDR !== "number") return syncIDR(r, rate);
  return r;
}

function blankRow(sibling) {
  return {
    id: generateId(), date: sibling?.date ?? "", time: "", city: sibling?.city ?? "",
    destination:"", from:"", to:"", transport:"", notes:"", category:"",
    budgetLocal:0, budgetIDR:0,
  };
}

function buildDayMap(rows) {
  const dates = [...new Set(rows.map(r => (r.date||"").trim()).filter(Boolean))].sort();
  const m = {};
  dates.forEach((d, i) => { m[d] = i + 1; });
  return m;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshPlan } = useAuth();
  const { plan, canSave, canExportPDF, checkTrip, isLocked } = usePlan();
  const { t } = useT();

  // Core state — no "mode" string, preview is its own boolean
  const [hydrated, setHydrated]         = useState(false);
  const [previewOpen, setPreviewOpen]   = useState(false);
  const [rows, setRows]                 = useState([]);
  const [tripInfo, setTripInfo]         = useState(BLANK_TRIP);
  const [rate, setRate]                 = useState(DEFAULT_RATE);
  const [rateSource, setRateSource]     = useState("manual");
  const [rateUpdatedAt, setRateUA]      = useState(null);
  const [region, setRegion]             = useState(null);
  const [setupComplete, setSetup]       = useState(false);
  const [projectId, setProjectId]       = useState(null);
  const [saveStatus, setSaveStatus]     = useState("idle");
  const [hasUnsaved, setHasUnsaved]     = useState(false);
  const [helpOpen, setHelpOpen]         = useState(false);
  const [helpTab, setHelpTab]           = useState("how");
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
    } catch { setRateSource("error"); }
  }, []);

  // Load localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const r = typeof p.rate === "number" && p.rate > 0 ? p.rate : DEFAULT_RATE;
        if (Array.isArray(p.rows))   setRows(p.rows.map(row => normalizeRow(row, r)));
        if (p.tripInfo)              setTripInfo({ ...BLANK_TRIP, ...p.tripInfo });
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

  // Save to localStorage (instant, offline)
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows, rate, tripInfo, region, setupComplete, projectId })); }
    catch { /* quota */ }
  }, [rows, rate, tripInfo, region, setupComplete, projectId, hydrated]);

  // Track unsaved
  useEffect(() => {
    if (!hydrated) return;
    if (initialChange.current) { initialChange.current = false; return; }
    setHasUnsaved(true);
  }, [rows, tripInfo, rate, region]); // eslint-disable-line

  const totalLocal = useMemo(() => rows.reduce((s, r) => s + (Number(r.budgetLocal) || 0), 0), [rows]);
  const totalIDR   = useMemo(() => Math.round(totalLocal * (Number(rate) || 0)), [totalLocal, rate]);
  const dayMap     = useMemo(() => buildDayMap(rows), [rows]);
  const currency   = useMemo(() => getCurrency(region), [region]);

  // ── DIRECTIONAL currency: edited field is NEVER mutated ──────────────────
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, [field]: value };
      const rn   = Number(rate) || 1;

      // ONLY update the other field — never touch the one the user typed
      if (field === "budgetLocal") {
        next.budgetIDR = Math.round((Number(value) || 0) * rn);
        // budgetLocal stays exactly as user typed
      } else if (field === "budgetIDR") {
        next.budgetLocal = Math.round((Number(value) || 0) / rn);
        // budgetIDR stays exactly as user typed
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
    // When rate changes externally, recalc IDR from local
    setRows(prev => prev.map(r => syncIDR(r, n)));
  };

  const addRow    = () => setRows(prev => [...prev, blankRow(prev[prev.length - 1])]);
  const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const insertAt  = (refId, pos) => {
    setRows(prev => {
      const i = prev.findIndex(r => r.id === refId);
      if (i === -1) return prev;
      const n = [...prev];
      n.splice(pos === "above" ? i : i + 1, 0, blankRow(prev[i]));
      return n;
    });
  };

  const handleReset = () => {
    if (!window.confirm(t("resetConfirm"))) return;
    setRows([]); setTripInfo(BLANK_TRIP); setRate(DEFAULT_RATE); setRateSource("manual");
    setRegion(null); setSetup(false); setProjectId(null); setHasUnsaved(false);
    ratesFetched.current = false; initialChange.current = true;
  };

  const handleRegionChange = (r) => {
    setRegion(r);
    invalidateRate(getCurrency(r).code);
    ratesFetched.current = false;
    if (r === "Indonesia") {
      setRate(1); setRateSource("live"); setRateUA(new Date().toISOString());
      setRows(prev => prev.map(row => syncIDR(row, 1)));
    } else {
      applyLiveRate(r);
    }
  };

  // Plan-gated save
  const handleSave = async () => {
    if (!user) return;
    if (!canSave) { setUpgradeReason(t("lockedBody")); setUpgradeOpen(true); return; }
    try {
      const count = projectId ? 0 : await countUserTrips(user.uid);
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
    setSetup(true); setHasUnsaved(false);
    ratesFetched.current = false; initialChange.current = true;
    if (p.region) { invalidateRate(getCurrency(p.region).code); applyLiveRate(p.region); }
  };

  const handlePreview = () => {
    if (isLocked) { setUpgradeReason(t("lockedBody")); setUpgradeOpen(true); return; }
    setPreviewOpen(true);
  };

  const handleExportPDF = () => {
    if (!canExportPDF) { setUpgradeReason("PDF export requires a Lite or Pro plan."); setUpgradeOpen(true); return; }
    window.print();
  };

  const showSetup = hydrated && !setupComplete;

  if (authLoading || !hydrated) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-navy-500 border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-bg min-h-screen flex flex-col">

      {/* ── SETUP SCREEN ── */}
      {showSetup && (
        <>
          <header className="border-b border-paper-line bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
                <span className="hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:block">
                  {t("travelPlanner")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setHelpTab("how"); setHelpOpen(true); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200"
                >
                  ❓ {t("help")}
                </button>
                {/* LOGOUT on setup page */}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1">
            {isLocked && (
              <div className="mx-auto max-w-3xl px-4 pt-8">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🔒</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-900 text-sm">{t("lockedTitle")}</p>
                    <p className="mt-0.5 text-xs text-amber-800">{t("lockedBody")}</p>
                  </div>
                  <button onClick={() => setRedeemOpen(true)}
                    className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                    {t("enterCode")}
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
            onReset={handleReset}    onPreview={handlePreview}
            onHelp={() => { setHelpTab("how"); setHelpOpen(true); }}
            onSave={handleSave}      onLoadOpen={() => setProjectsOpen(true)}
            saveStatus={saveStatus}  hasUnsavedChanges={hasUnsaved}
            totalLocal={totalLocal}  totalIDR={totalIDR}
            region={region}          onRegionChange={handleRegionChange}
            rateSource={rateSource}  rateUpdatedAt={rateUpdatedAt}
            onRedeemOpen={() => setRedeemOpen(true)}
            plan={plan}
          />

          {/*
            SIDEBAR LAYOUT:
            - flex-1 so footer is pinned
            - grid with items-start so sidebar doesn't stretch
            - sidebar: self-start + sticky (no overflow-hidden anywhere)
          */}
          <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />

            <div className="mt-8 grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* Left: itinerary */}
              <div className="min-w-0">
                {isLocked ? (
                  <div className="rounded-2xl border border-paper-line bg-white p-10 text-center shadow-soft">
                    <span className="text-4xl">🔒</span>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{t("lockedTitle")}</h3>
                    <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto">{t("lockedBody")}</p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                      <button onClick={() => setRedeemOpen(true)}
                        className="rounded-xl bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600">
                        🎟️ {t("redeemCode")}
                      </button>
                      <a href="https://wa.me/6281298053826" target="_blank" rel="noopener noreferrer"
                        className="rounded-xl border border-paper-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-dim">
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

              {/* Right: sticky sidebar — self-start prevents stretch */}
              <aside className="min-w-0 flex flex-col gap-4 lg:self-start lg:sticky lg:top-[64px]">
                <ChartsPanel rows={rows} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
                {/* CTA card: desktop only — FAB handles mobile */}
                <div className="hidden md:block">
                  <CTACard tripInfo={tripInfo} totalLocal={totalLocal} currency={currency} totalIDR={totalIDR} />
                </div>
              </aside>
            </div>
          </main>

          {/* Mobile FAB */}
          <div className="md:hidden">
            <CTAFab tripInfo={tripInfo} totalLocal={totalLocal} currency={currency} totalIDR={totalIDR} />
          </div>

          <Footer />
        </>
      )}

      {/* ── PREVIEW MODAL (fullscreen, THE ONLY preview system) ── */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        tripInfo={tripInfo}
        rows={rows}
        dayMap={dayMap}
        region={region}
        rate={rate}
        totalLocal={totalLocal}
        totalIDR={totalIDR}
        canExportPDF={canExportPDF}
        onUpgradeNeeded={(reason) => { setPreviewOpen(false); setUpgradeReason(reason); setUpgradeOpen(true); }}
      />

      {/* Modals */}
      <HelpModal     open={helpOpen}     initialTab={helpTab}  onClose={() => setHelpOpen(false)} />
      <ProjectsModal open={projectsOpen} userId={user?.uid}    onClose={() => setProjectsOpen(false)} onLoad={handleLoadProject} />
      <RedeemModal   open={redeemOpen}   onClose={() => setRedeemOpen(false)} onSuccess={() => refreshPlan()} />
      <UpgradeModal  open={upgradeOpen}  onClose={() => setUpgradeOpen(false)} reason={upgradeReason} />
    </div>
  );
}
