"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header         from "@/components/Header";
import HelpModal      from "@/components/HelpModal";
import PreviewModal   from "@/components/PreviewModal";
import ProjectsModal  from "@/components/ProjectsModal";
import ImportModal    from "@/components/ImportModal";
import SetupScreen    from "@/components/SetupScreen";
import TripInfoPanel  from "@/components/TripInfoPanel";
import ItineraryTable from "@/components/ItineraryTable";
import ChartsPanel    from "@/components/ChartsPanel";
import { CTACard, CTAFab } from "@/components/CTACard";
import ContactModal   from "@/components/ContactModal";
import Footer         from "@/components/Footer";
import RedeemModal    from "@/components/RedeemModal";
import UpgradeModal   from "@/components/UpgradeModal";

import { useAuth }                        from "@/context/AuthProvider";
import { useT }                           from "@/context/TranslationContext";
import { usePlan }                        from "@/hooks/usePlan";
import { saveProject, countUserTrips }    from "@/lib/firestore";
import { fetchRateToIDR, invalidateRate } from "@/lib/exchangeRates";
import { DEFAULT_RATE, generateId, getCurrency } from "@/lib/utils";
import { exportBvntrip }                  from "@/lib/itinerary-file";

const STORAGE_KEY = "backpackervun-v9";
const BLANK_TRIP  = { clientName:"", duration:"", destinations:"", travelDates:"", startDate:"", endDate:"" };

function syncIDR(row, rate) {
  return { ...row, budgetIDR: Math.round((Number(row.budgetLocal)||0) * (Number(rate)||0)) };
}
function normalizeRow(row, rate) {
  const r = { ...row };
  if (r.budgetJPY !== undefined && r.budgetLocal === undefined) r.budgetLocal = r.budgetJPY;
  delete r.budgetJPY;
  if (typeof r.budgetIDR !== "number") return syncIDR(r, rate);
  return r;
}
function blankRow(s) {
  return {
    id: generateId(), date: s?.date ?? "", time: "", timeEnd: "", city: s?.city ?? "",
    destination:"", from:"", to:"", transport:"", notes:"", category:"",
    budgetLocal:0, budgetIDR:0, _lastEdited:"local",
  };
}
function buildDayMap(rows) {
  const dates = [...new Set(rows.map(r=>(r.date||"").trim()).filter(Boolean))].sort();
  const m = {};
  dates.forEach((d,i) => { m[d]=i+1; });
  return m;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshPlan } = useAuth();
  const { plan, canSave, canExportPDF, checkTrip, isLocked, features, trialDaysLeft } = usePlan();
  const { t } = useT();

  const [hydrated, setHydrated]         = useState(false);
  const [view, setView]                 = useState("setup");
  const [previewOpen, setPreviewOpen]   = useState(false);
  const [importOpen, setImportOpen]     = useState(false);
  const [rows, setRows]                 = useState([]);
  const [tripInfo, setTripInfo]         = useState(BLANK_TRIP);
  const [rate, setRate]                 = useState(DEFAULT_RATE);
  const [rateSource, setRateSource]     = useState("manual");
  const [rateUpdatedAt, setRateUA]      = useState(null);
  const [region, setRegion]             = useState(null);
  const [projectId, setProjectId]       = useState(null);
  const [saveStatus, setSaveStatus]     = useState("idle");
  const [hasUnsaved, setHasUnsaved]     = useState(false);
  const [currencyMode, setCurrencyMode] = useState("local");
  const [helpOpen, setHelpOpen]         = useState(false);
  const [helpTab, setHelpTab]           = useState("how");
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [redeemOpen, setRedeemOpen]     = useState(false);
  const [upgradeOpen, setUpgradeOpen]   = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [contactOpen, setContactOpen]   = useState(false);

  const ratesFetched  = useRef(false);
  const initialChange = useRef(true);

  // ── Auth guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // ── Upgrade modal helper — single function used everywhere ────────────────
  // ✅ ADDED: central handler so Header, PreviewModal, etc. can show UpgradeModal

  const handleUpgradeNeeded = (reason) => {
    setUpgradeReason(reason ?? "Upgrade your plan to unlock this feature.");
    setUpgradeOpen(true);
  };

  // ── Exchange rate ─────────────────────────────────────────────────────────

  const applyLiveRate = useCallback(async (regionId) => {
    if (!regionId) return;
    const currency = getCurrency(regionId);
    if (currency.code === "IDR") {
      setRate(1); setRateSource("live"); setRateUA(new Date().toISOString());
      setRows(prev => prev.map(r => syncIDR(r, 1)));
      return;
    }
    try {
      const { rate: lr, updatedAt } = await fetchRateToIDR(currency.code);
      setRate(lr); setRateSource("live"); setRateUA(updatedAt);
      setRows(prev => prev.map(r => r._lastEdited === "idr" ? r : syncIDR(r, lr)));
    } catch { setRateSource("error"); }
  }, []);

  // ── LocalStorage hydration ────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const r = typeof p.rate === "number" && p.rate > 0 ? p.rate : DEFAULT_RATE;
        if (Array.isArray(p.rows))            setRows(p.rows.map(row => normalizeRow(row, r)));
        if (p.tripInfo)                       setTripInfo({ ...BLANK_TRIP, ...p.tripInfo });
        if (typeof p.region === "string")     setRegion(p.region === "Korea" ? "South Korea" : p.region);
        if (p.currencyMode)                   setCurrencyMode(p.currencyMode);
        if (p.projectId)                      setProjectId(p.projectId);
        setRate(r);
        if (p.view === "planner" || p.setupComplete === true) setView("planner");
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !region || ratesFetched.current) return;
    ratesFetched.current = true;
    applyLiveRate(region);
  }, [hydrated, region, applyLiveRate]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(
        { rows, rate, tripInfo, region, view, projectId, currencyMode }
      ));
    } catch { /* quota */ }
  }, [rows, rate, tripInfo, region, view, projectId, hydrated, currencyMode]);

  useEffect(() => {
    if (!hydrated) return;
    if (initialChange.current) { initialChange.current = false; return; }
    setHasUnsaved(true);
  }, [rows, tripInfo, rate, region]); // eslint-disable-line

  // ── Derived values ────────────────────────────────────────────────────────

  const totalIDR   = useMemo(() => rows.reduce((s,r) => s+(Number(r.budgetIDR)||0),   0), [rows]);
  const totalLocal = useMemo(() => rows.reduce((s,r) => s+(Number(r.budgetLocal)||0), 0), [rows]);
  const dayMap     = useMemo(() => buildDayMap(rows), [rows]);
  const currency   = useMemo(() => getCurrency(region), [region]);

  // ── Row operations ────────────────────────────────────────────────────────

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, [field]: value };
      const rn = Number(rate) || 1;
      if (field === "budgetLocal") { next.budgetIDR = Math.round((Number(value)||0)*rn); next._lastEdited="local"; }
      if (field === "budgetIDR")   { next.budgetLocal = Math.round((Number(value)||0)/rn); next._lastEdited="idr"; }
      if ((field==="from"||field==="to") && !next.category) {
        if ((next.from||"").trim() && (next.to||"").trim()) next.category="Transport";
      }
      return next;
    }));
  };

  const handleRateChange = (v) => {
    const n = Number(v)||0;
    setRate(n); setRateSource("manual");
    setRows(prev => prev.map(r => r._lastEdited==="idr" ? r : syncIDR(r, n)));
  };

  // ── Row operations ────────────────────────────────────────────────────────

  const addRow = () => {
    if (Number.isFinite(features.maxRows) && rows.length >= features.maxRows) {
      const planName = plan === "FREE" ? "Free trial" : "LITE";
      handleUpgradeNeeded(`${planName} plan is limited to ${features.maxRows} rows per trip. Upgrade to Pro for unlimited rows.`);
      return;
    }
    setRows(prev => [...prev, blankRow(prev[prev.length-1])]);
  };
  const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const insertAt  = (refId, pos) => {
    setRows(prev => {
      const i = prev.findIndex(r => r.id === refId);
      if (i === -1) return prev;
      const n = [...prev]; n.splice(pos==="above"?i:i+1, 0, blankRow(prev[i]));
      return n;
    });
  };

  const moveRow = (id, dir) => {
    setRows(prev => {
      const i = prev.findIndex(r => r.id === id);
      if (dir === "up"   && i > 0)               { const n=[...prev]; [n[i-1],n[i]]=[n[i],n[i-1]]; return n; }
      if (dir === "down" && i < prev.length - 1) { const n=[...prev]; [n[i],n[i+1]]=[n[i+1],n[i]]; return n; }
      return prev;
    });
  };

  // ── Export .bvntrip ───────────────────────────────────────────────────────

  const handleExportBvntrip = () => {
    exportBvntrip({ tripInfo, rows, region, rate });
  };

  // ── Import .bvntrip ───────────────────────────────────────────────────────

  const handleImport = (data) => {
    const lr = data.rate ?? DEFAULT_RATE;
    setRows((data.rows ?? []).map(r => normalizeRow(r, lr)));
    setTripInfo({ ...BLANK_TRIP, ...(data.tripInfo ?? {}) });
    setRate(lr); setRateSource("manual");
    setRegion(data.region ?? null);
    setProjectId(null);
    setView("planner");
    setHasUnsaved(true);
    ratesFetched.current  = false;
    initialChange.current = true;
    if (data.region) {
      invalidateRate(getCurrency(data.region).code);
      applyLiveRate(data.region);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    if (!window.confirm(t("resetConfirm"))) return;
    setRows([]); setTripInfo(BLANK_TRIP); setRate(DEFAULT_RATE); setRateSource("manual");
    setRegion(null); setView("setup"); setProjectId(null); setHasUnsaved(false);
    ratesFetched.current=false; initialChange.current=true;
  };

  // ── Region change ─────────────────────────────────────────────────────────

  const handleRegionChange = (r) => {
    setRegion(r); invalidateRate(getCurrency(r).code); ratesFetched.current=false;
    if (r === "Indonesia") {
      setRate(1); setRateSource("live"); setRateUA(new Date().toISOString());
      setRows(prev => prev.map(row => syncIDR(row, 1)));
    } else { applyLiveRate(r); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user) return;
    if (!canSave) { handleUpgradeNeeded(t("lockedBody")); return; }
    try {
      const count = projectId ? 0 : await countUserTrips(user.uid);
      const { allowed, reason } = checkTrip(count);
      if (!allowed) { handleUpgradeNeeded(reason); return; }
    } catch { /* proceed */ }
    setSaveStatus("saving");
    try {
      const id = await saveProject(user.uid, projectId, { tripInfo, rows, region, rate });
      if (!projectId) setProjectId(id);
      setSaveStatus("saved"); setHasUnsaved(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch(e) {
      console.error("[save]", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // ── Load project ──────────────────────────────────────────────────────────

  const handleLoadProject = (p) => {
    const lr = p.rate ?? DEFAULT_RATE;
    setRows((p.rows??[]).map(r => normalizeRow(r, lr)));
    setTripInfo({ ...BLANK_TRIP, ...(p.tripInfo??{}) });
    setRate(lr); setRateSource("manual");
    setRegion(p.region??null); setProjectId(p.id);
    // ✅ Always go to planner after load — bypasses region selection requirement
    setView("planner"); setHasUnsaved(false);
    ratesFetched.current=false; initialChange.current=true;
    if (p.region) { invalidateRate(getCurrency(p.region).code); applyLiveRate(p.region); }
  };

  // ── Open ProjectsModal — gated by canLoad ────────────────────────────────
  // Called from BOTH setup screen and header menu.

  const handleOpenProjects = () => {
    if (!features.canLoad) {
      handleUpgradeNeeded("Loading saved trips requires a Lite or Pro plan.");
      return;
    }
    setProjectsOpen(true);
  };

  // ── Preview ───────────────────────────────────────────────────────────────

  const handlePreview = () => {
    if (isLocked) { handleUpgradeNeeded(t("lockedBody")); return; }
    setPreviewOpen(true);
  };

  // ── Loading state ─────────────────────────────────────────────────────────

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

  // ── SETUP VIEW ────────────────────────────────────────────────────────────

  if (view === "setup") {
    return (
      <div className="paper-bg min-h-screen flex flex-col">
        <header className="border-b border-paper-line bg-white sticky top-0 z-30">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
              <span className="hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:block">
                {t("appName")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setHelpTab("how"); setHelpOpen(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200">
                ❓ {t("help")}
              </button>
              <button onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 active:scale-95">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
                <span className="text-xl">🔒</span>
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
            onLoadOpen={handleOpenProjects}
            onStart={() => {
              if (isLocked) { setRedeemOpen(true); return; }
              setView("planner");
              initialChange.current = true;
            }}
          />
        </div>

        <HelpModal   open={helpOpen}   initialTab={helpTab} onClose={() => setHelpOpen(false)} />
        <RedeemModal open={redeemOpen} onClose={() => setRedeemOpen(false)} onSuccess={refreshPlan} />
        <ProjectsModal
          open={projectsOpen}
          userId={user?.uid}
          onClose={() => setProjectsOpen(false)}
          onLoad={handleLoadProject}
        />
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          reason={upgradeReason}
        />
      </div>
    );
  }

  // ── PLANNER VIEW ──────────────────────────────────────────────────────────

  return (
    <div className="paper-bg min-h-screen flex flex-col">

      <Header
        rate={rate}              onRateChange={handleRateChange}
        onReset={handleReset}    onPreview={handlePreview}
        onHelp={() => { setHelpTab("how"); setHelpOpen(true); }}
        onSave={handleSave}      onLoadOpen={handleOpenProjects}
        saveStatus={saveStatus}  hasUnsavedChanges={hasUnsaved}
        totalLocal={totalLocal}  totalIDR={totalIDR}
        region={region}          onRegionChange={handleRegionChange}
        rateSource={rateSource}  rateUpdatedAt={rateUpdatedAt}
        onRedeemOpen={() => setRedeemOpen(true)}
        plan={plan}
        currencyMode={currencyMode}
        onCurrencyModeChange={setCurrencyMode}
        onExportBvntrip={handleExportBvntrip}
        onImportOpen={() => setImportOpen(true)}
        onUpgradeNeeded={handleUpgradeNeeded}
      />

      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 lg:py-8">

        {/* FREE trial expiry banner */}
        {plan === "FREE" && trialDaysLeft !== null && trialDaysLeft <= 3 && !isLocked && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-sm text-amber-800">
              ⏳ Free trial expires in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>.
              Upgrade to keep full access.
            </span>
            <button onClick={() => setRedeemOpen(true)}
              className="flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
              Upgrade Now
            </button>
          </div>
        )}

        <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />

        <div className="mt-6 grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
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
                  <button onClick={() => setContactOpen(true)}
                    className="rounded-xl border border-paper-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-dim">
                    {t("chatWA")}
                  </button>
                </div>
              </div>
            ) : (
              <ItineraryTable
                rows={rows} dayMap={dayMap} region={region}
                onUpdate={updateRow} onAdd={addRow} onDelete={deleteRow}
                onInsertAbove={id => insertAt(id, "above")}
                onInsertBelow={id => insertAt(id, "below")}
                onMoveUp={id => moveRow(id, "up")}
                onMoveDown={id => moveRow(id, "down")}
                currencyMode={currencyMode}
              />
            )}
          </div>

          <aside className="min-w-0 flex flex-col gap-4 lg:self-start lg:sticky lg:top-[56px]">
            <ChartsPanel rows={rows} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} currency={currency} />
            <div className="hidden md:block">
              <CTACard tripInfo={tripInfo} totalLocal={totalLocal} currency={currency} totalIDR={totalIDR}
                onContact={() => setContactOpen(true)} />
            </div>
          </aside>
        </div>
      </main>

      <div className="md:hidden">
        <CTAFab tripInfo={tripInfo} totalLocal={totalLocal} currency={currency} totalIDR={totalIDR} />
      </div>
      <Footer />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

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
        onUpgradeNeeded={(reason) => {
          setPreviewOpen(false);
          handleUpgradeNeeded(reason);
        }}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <HelpModal
        open={helpOpen}
        initialTab={helpTab}
        onClose={() => setHelpOpen(false)}
      />

      <ProjectsModal
        open={projectsOpen}
        userId={user?.uid}
        onClose={() => setProjectsOpen(false)}
        onLoad={handleLoadProject}
      />

      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        onSuccess={refreshPlan}
      />

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
      />

    </div>
  );
}
