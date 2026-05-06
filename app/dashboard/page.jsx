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

import { useAuth }                     from "@/context/AuthProvider";
import { saveProject }                 from "@/lib/firestore";
import { fetchRateToIDR, invalidateRate } from "@/lib/exchangeRates";
import { DEFAULT_RATE, generateId, getCurrency } from "@/lib/utils";

const STORAGE_KEY = "backpackervun-v4";

const BLANK_TRIP = {
  clientName: "", duration: "", destinations: "",
  travelDates: "", startDate: "", endDate: "",
};

// ── Row helpers ───────────────────────────────────────────────────────────────

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
    destination: "", from: "", to: "", transport: "", notes: "", category: "",
    budgetLocal: 0, budgetIDR: 0,
  };
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
  const { user, loading: authLoading } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const [hydrated, setHydrated]         = useState(false);
  const [mode, setMode]                 = useState("edit");
  const [rows, setRows]                 = useState([]);
  const [tripInfo, setTripInfo]         = useState(BLANK_TRIP);
  const [rate, setRate]                 = useState(DEFAULT_RATE);
  const [rateSource, setRateSource]     = useState("manual"); // "live" | "error" | "manual"
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);
  const [region, setRegion]             = useState(null);
  const [setupComplete, setSetup]       = useState(false);
  const [projectId, setProjectId]       = useState(null);
  const [saveStatus, setSaveStatus]     = useState("idle");
  const [hasUnsaved, setHasUnsaved]     = useState(false);
  const [helpOpen, setHelpOpen]         = useState(false);
  const [helpTab, setHelpTab]           = useState("how");
  const [projectsOpen, setProjectsOpen] = useState(false);

  const ratesFetched  = useRef(false);
  const initialChange = useRef(true);

  // ── CORRECT live rate fetch: fetch with source currency as base ────────────
  const applyLiveRate = useCallback(async (regionId) => {
    if (!regionId) return;
    const currency = getCurrency(regionId);
    if (currency.code === "IDR") {
      setRate(1); setRateSource("live"); setRateUpdatedAt(new Date().toISOString());
      setRows(prev => prev.map(r => syncIDR(r, 1)));
      return;
    }
    try {
      const { rate: liveRate, updatedAt } = await fetchRateToIDR(currency.code);
      setRate(liveRate);
      setRateSource("live");
      setRateUpdatedAt(updatedAt);
      setRows(prev => prev.map(r => syncIDR(r, liveRate)));
    } catch (err) {
      console.warn("[rates] fetch failed:", err.message);
      setRateSource("error");
      // Don't overwrite the current rate — keep last known value
    }
  }, []);

  // ── localStorage load ─────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const r = typeof p.rate === "number" && p.rate > 0 ? p.rate : DEFAULT_RATE;
        if (Array.isArray(p.rows))   setRows(p.rows.map(row => normalizeRow(row, r)));
        if (p.tripInfo)              setTripInfo({ ...BLANK_TRIP, ...p.tripInfo });
        if (typeof p.region === "string") {
          setRegion(p.region === "Korea" ? "South Korea" : p.region);
        }
        if (typeof p.setupComplete === "boolean") setSetup(p.setupComplete);
        else if (p.region)           setSetup(true);
        if (p.projectId)             setProjectId(p.projectId);
        setRate(r);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Fetch live rate after first hydration
  useEffect(() => {
    if (!hydrated || !region || ratesFetched.current) return;
    ratesFetched.current = true;
    applyLiveRate(region);
  }, [hydrated, region, applyLiveRate]);

  // ── localStorage save (instant, no Firestore) ─────────────────────────────

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(
        { rows, rate, tripInfo, region, setupComplete, projectId }
      ));
    } catch { /* quota */ }
  }, [rows, rate, tripInfo, region, setupComplete, projectId, hydrated]);

  // ── Unsaved changes tracker ────────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;
    if (initialChange.current) { initialChange.current = false; return; }
    setHasUnsaved(true);
  }, [rows, tripInfo, rate, region]); // eslint-disable-line

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalLocal = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.budgetLocal) || 0), 0), [rows]
  );
  const totalIDR = useMemo(
    () => Math.round(totalLocal * (Number(rate) || 0)), [totalLocal, rate]
  );
  const dayMap = useMemo(() => buildDayMap(rows), [rows]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, [field]: value };
      const rn   = Number(rate) || 1;
      if (field === "budgetLocal") next.budgetIDR   = Math.round((Number(value) || 0) * rn);
      if (field === "budgetIDR")   next.budgetLocal = Math.round((Number(value) || 0) / rn);
      if ((field === "from" || field === "to") && !next.category) {
        if ((next.from || "").trim() && (next.to || "").trim()) next.category = "Transport";
      }
      return next;
    }));
  };

  const handleRateChange = (v) => {
    const n = Number(v) || 0;
    setRate(n); setRateSource("manual");
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
    if (!window.confirm("Clear everything and start over?")) return;
    setRows([]); setTripInfo(BLANK_TRIP); setRate(DEFAULT_RATE);
    setRateSource("manual"); setRegion(null); setSetup(false);
    setProjectId(null); setMode("edit"); setHasUnsaved(false);
    ratesFetched.current = false; initialChange.current = true;
  };

  const handleRegionChange = (r) => {
    setRegion(r);
    invalidateRate(getCurrency(r).code); // force re-fetch for new region
    ratesFetched.current = false;
    if (r === "Indonesia") {
      setRate(1); setRateSource("live");
      setRateUpdatedAt(new Date().toISOString());
      setRows(prev => prev.map(row => syncIDR(row, 1)));
    } else {
      applyLiveRate(r);
    }
  };

  // ── MANUAL SAVE ONLY — NO AUTO-SAVE ───────────────────────────────────────

  const handleSave = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const id = await saveProject(user.uid, projectId, { tripInfo, rows, region, rate });
      if (!projectId) setProjectId(id);
      setSaveStatus("saved");
      setHasUnsaved(false);
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
    <div className={`paper-bg min-h-screen ${inPreview ? "preview-mode" : ""}`}>

      {/* ── SETUP ─── */}
      {showSetup && (
        <div className="screen-layout">
          <header className="border-b border-paper-line bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
                <span className="hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:block">
                  Travel Planner
                </span>
              </div>
              <button onClick={() => { setHelpTab("how"); setHelpOpen(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:border-navy-200 hover:text-navy-500">
                ❓ Help
              </button>
            </div>
          </header>
          <SetupScreen
            tripInfo={tripInfo} region={region}
            onTripInfoChange={setTripInfo}
            onRegionChange={handleRegionChange}
            onStart={() => { setSetup(true); initialChange.current = true; }}
          />
        </div>
      )}

      {/* ── PLANNER ─── */}
      {!showSetup && (
        <div className="screen-layout">
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
          />

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <ItineraryTable
                  rows={rows} dayMap={dayMap} region={region}
                  onUpdate={updateRow} onAdd={addRow} onDelete={deleteRow}
                  onInsertAbove={id => insertAt(id, "above")}
                  onInsertBelow={id => insertAt(id, "below")}
                />
              </div>
              <div className="min-w-0">
                <ChartsPanel rows={rows} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
              </div>
            </div>

            <footer className="mt-10 border-t border-paper-line pb-2 pt-5 text-center text-[11px] text-ink-muted">
              Backpackervun Travel Planner ·{" "}
              <button onClick={() => { setHelpTab("contact"); setHelpOpen(true); }} className="font-medium text-navy-500 hover:underline underline-offset-2">Contact</button>
            </footer>
          </main>
        </div>
      )}

      {/* ── PRINT / PREVIEW ─── */}
      {!showSetup && (
        <div className="print-layout">
          {inPreview && (
            <div className="no-print sticky top-0 z-30 border-b border-paper-line bg-white/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-500">Preview</span>
                  <p className="text-xs text-ink-soft">This is what the PDF will look like.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setMode("edit")} className="rounded-lg border border-paper-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500">← Back</button>
                  <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-navy-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>
                    </svg>
                    Export PDF
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

      <HelpModal open={helpOpen} initialTab={helpTab} onClose={() => setHelpOpen(false)} />
      <ProjectsModal open={projectsOpen} userId={user?.uid} onClose={() => setProjectsOpen(false)} onLoad={handleLoadProject} />
    </div>
  );
}
