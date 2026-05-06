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

import { useAuth }        from "@/context/AuthProvider";
import { saveProject }    from "@/lib/firestore";
import { loadRates, getRate } from "@/lib/exchangeRates";
import { INITIAL_ROWS, INITIAL_TRIP_INFO } from "@/lib/sample-data";
import { DEFAULT_RATE, generateId, getCurrency } from "@/lib/utils";

const STORAGE_KEY = "backpackervun-travel-planner:v6";

// ── Row helpers ───────────────────────────────────────────────────────────────

function syncIDR(row, rate) {
  return {
    ...row,
    budgetIDR: Math.round((Number(row.budgetLocal) || 0) * (Number(rate) || 0)),
  };
}

function normalizeRow(row, rate) {
  let next = { ...row };
  if (next.budgetJPY !== undefined && next.budgetLocal === undefined) {
    next.budgetLocal = next.budgetJPY;
  }
  delete next.budgetJPY;
  delete next.durationMin; delete next.durationMax;
  delete next.costMin;     delete next.costMax;
  if (typeof next.budgetIDR !== "number") next = syncIDR(next, rate);
  return next;
}

function makeBlankRow(siblingRow) {
  return {
    id: generateId(),
    date: siblingRow?.date ?? "",
    time: "",
    city: siblingRow?.city ?? "",
    destination: "", from: "", to: "",
    transport: "", notes: "", category: "",
    budgetLocal: 0, budgetIDR: 0,
  };
}

function buildDayMap(rows) {
  const dates = Array.from(
    new Set(rows.map((r) => (r.date || "").trim()).filter(Boolean))
  ).sort();
  const map = {};
  dates.forEach((d, i) => { map[d] = i + 1; });
  return map;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // App state
  const [hydrated, setHydrated]             = useState(false);
  const [mode, setMode]                     = useState("edit");
  const [rows, setRows]                     = useState(INITIAL_ROWS);
  const [tripInfo, setTripInfo]             = useState(INITIAL_TRIP_INFO);
  const [rate, setRate]                     = useState(DEFAULT_RATE);
  const [rateSource, setRateSource]         = useState("manual"); // "live" | "fallback" | "manual"
  const [region, setRegion]                 = useState(null);
  const [setupComplete, setSetupComplete]   = useState(false);
  const [projectId, setProjectId]           = useState(null);
  const [saveStatus, setSaveStatus]         = useState("idle");
  const [hasUnsavedChanges, setUnsaved]     = useState(false);
  const [helpOpen, setHelpOpen]             = useState(false);
  const [helpTab, setHelpTab]               = useState("how");
  const [projectsOpen, setProjectsOpen]     = useState(false);

  // ── Load rates on mount (once) ─────────────────────────────────────────────
  const ratesLoaded = useRef(false);

  const applyLiveRate = useCallback(async (regionId) => {
    if (!regionId) return;
    const currency = getCurrency(regionId);
    if (currency.code === "IDR") return; // no conversion needed

    try {
      const rates = await loadRates();
      const liveRate = Math.round(rates[currency.code] ?? 0);
      if (liveRate > 0) {
        setRate(liveRate);
        setRateSource("live");
        // Re-sync all row IDR values
        setRows((prev) => prev.map((r) => syncIDR(r, liveRate)));
      } else {
        // Rate not in live data — use fallback
        const fallback = getRate(currency.code);
        setRate(fallback);
        setRateSource("fallback");
        setRows((prev) => prev.map((r) => syncIDR(r, fallback)));
      }
    } catch {
      // API unavailable, use built-in fallback
      const fallback = getRate(currency.code);
      setRate(fallback);
      setRateSource("fallback");
      setRows((prev) => prev.map((r) => syncIDR(r, fallback)));
    }
  }, []);

  // ── Load from localStorage ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const nextRate = typeof parsed.rate === "number" && parsed.rate > 0
          ? parsed.rate : DEFAULT_RATE;

        if (Array.isArray(parsed.rows)) {
          setRows(parsed.rows.map((r) => normalizeRow(r, nextRate)));
        }
        if (parsed.tripInfo) {
          setTripInfo({ ...INITIAL_TRIP_INFO, ...parsed.tripInfo });
        }
        if (typeof parsed.region === "string") {
          const r = parsed.region === "Korea" ? "South Korea" : parsed.region;
          setRegion(r);
        }
        if (typeof parsed.setupComplete === "boolean") {
          setSetupComplete(parsed.setupComplete);
        } else if (parsed.region) {
          setSetupComplete(true);
        }
        if (parsed.projectId) setProjectId(parsed.projectId);

        // Use saved rate initially; live rate will overwrite on fetch
        setRate(nextRate);
        setRateSource("manual");
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Once hydrated + region known, fetch live rates
  useEffect(() => {
    if (!hydrated || !region || ratesLoaded.current) return;
    ratesLoaded.current = true;
    applyLiveRate(region);
  }, [hydrated, region, applyLiveRate]);

  // ── Persist to localStorage ────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rows, rate, tripInfo, region, setupComplete, projectId })
      );
    } catch { /* quota */ }
  }, [rows, rate, tripInfo, region, setupComplete, projectId, hydrated]);

  // ── Track unsaved changes ──────────────────────────────────────────────────
  // We mark as "unsaved" whenever rows / tripInfo / rate / region change.
  // We clear it when a save succeeds.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setUnsaved(true);
  }, [rows, tripInfo, rate, region]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalLocal = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.budgetLocal) || 0), 0),
    [rows]
  );
  const totalIDR = useMemo(
    () => Math.round(totalLocal * (Number(rate) || 0)),
    [totalLocal, rate]
  );
  const dayMap = useMemo(() => buildDayMap(rows), [rows]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: value };
        const rn = Number(rate) || 1;
        if (field === "budgetLocal") next.budgetIDR   = Math.round((Number(value) || 0) * rn);
        if (field === "budgetIDR")   next.budgetLocal = Math.round((Number(value) || 0) / rn);
        if ((field === "from" || field === "to") && !next.category) {
          if ((next.from || "").trim() && (next.to || "").trim()) next.category = "Transport";
        }
        return next;
      })
    );
  };

  const handleRateChange = (newRate) => {
    const safe = Number(newRate) || 0;
    setRate(safe);
    setRateSource("manual");
    setRows((prev) => prev.map((r) => syncIDR(r, safe)));
  };

  const addRow    = () => setRows((prev) => [...prev, makeBlankRow(prev[prev.length - 1])]);
  const deleteRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const insertRowAt = (refId, position) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === refId);
      if (idx === -1) return prev;
      const newRow = makeBlankRow(prev[idx]);
      const next = [...prev];
      next.splice(position === "above" ? idx : idx + 1, 0, newRow);
      return next;
    });
  };

  const handleReset = () => {
    if (!window.confirm("Clear everything and start over?")) return;
    setRows([]);
    setTripInfo(INITIAL_TRIP_INFO);
    setRate(DEFAULT_RATE);
    setRateSource("manual");
    setRegion(null);
    setSetupComplete(false);
    setProjectId(null);
    setMode("edit");
    setUnsaved(false);
    ratesLoaded.current = false;
  };

  const handlePrint = () => window.print();
  const handleHelp  = () => { setHelpTab("how"); setHelpOpen(true); };

  const handleRegionChange = (nextRegion) => {
    setRegion(nextRegion);
    ratesLoaded.current = false; // re-fetch for new region
    if (nextRegion === "Indonesia") {
      setRate(1);
      setRateSource("live");
      setRows((prev) => prev.map((r) => syncIDR(r, 1)));
    } else {
      // Fetch live rate for the new region
      applyLiveRate(nextRegion);
    }
  };

  // ── Manual Save (NO auto-save) ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const newId = await saveProject(user.uid, projectId, {
        tripInfo, rows, region, rate,
      });
      if (!projectId) setProjectId(newId);
      setSaveStatus("saved");
      setUnsaved(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleLoadProject = (project) => {
    const loadedRate = project.rate ?? DEFAULT_RATE;
    setRows((project.rows ?? []).map((r) => normalizeRow(r, loadedRate)));
    setTripInfo({ ...INITIAL_TRIP_INFO, ...(project.tripInfo ?? {}) });
    setRate(loadedRate);
    setRateSource("manual");
    setRegion(project.region ?? null);
    setProjectId(project.id);
    setSetupComplete(true);
    setMode("edit");
    setUnsaved(false);
    ratesLoaded.current = false;
    // Fetch live rate for the loaded project's region
    if (project.region) applyLiveRate(project.region);
  };

  const inPreview = mode === "preview";
  const showSetup = hydrated && !setupComplete;

  // Loading screen while auth resolves
  if (authLoading || !hydrated) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`paper-bg min-h-screen ${inPreview ? "preview-mode" : ""}`}>

      {/* ── SETUP ─── */}
      {showSetup && (
        <div className="screen-layout">
          <header className="border-b border-paper-line bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto sm:h-8" />
                <span className="ml-3 hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
                  Travel Planner
                </span>
              </div>
              <button onClick={handleHelp} className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500">
                Help
              </button>
            </div>
          </header>
          <SetupScreen
            tripInfo={tripInfo}
            region={region}
            onTripInfoChange={setTripInfo}
            onRegionChange={handleRegionChange}
            onStart={() => setSetupComplete(true)}
          />
        </div>
      )}

      {/* ── PLANNER ─── */}
      {!showSetup && (
        <div className="screen-layout">
          <Header
            rate={rate}
            onRateChange={handleRateChange}
            onReset={handleReset}
            onPrint={handlePrint}
            onHelp={handleHelp}
            onSave={handleSave}
            onLoadOpen={() => setProjectsOpen(true)}
            saveStatus={saveStatus}
            hasUnsavedChanges={hasUnsavedChanges}
            totalLocal={totalLocal}
            totalIDR={totalIDR}
            mode={mode}
            onModeChange={setMode}
            region={region}
            onRegionChange={handleRegionChange}
            rateSource={rateSource}
          />

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <ItineraryTable
                  rows={rows}
                  dayMap={dayMap}
                  region={region}
                  onUpdate={updateRow}
                  onAdd={addRow}
                  onDelete={deleteRow}
                  onInsertAbove={(id) => insertRowAt(id, "above")}
                  onInsertBelow={(id) => insertRowAt(id, "below")}
                />
              </div>
              <div className="min-w-0">
                <ChartsPanel rows={rows} rate={rate} totalLocal={totalLocal} totalIDR={totalIDR} />
              </div>
            </div>

            <footer className="mt-10 border-t border-paper-line pt-5 pb-2 text-center text-[11px] text-ink-muted">
              Backpackervun Travel Planner ·{" "}
              <button onClick={() => { setHelpTab("contact"); setHelpOpen(true); }} className="font-medium text-navy-500 hover:underline underline-offset-2">
                Contact
              </button>
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
                <div className="flex items-center gap-2">
                  <button onClick={() => setMode("edit")} className="rounded-lg border border-paper-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-soft hover:border-navy-200 hover:text-navy-500">
                    ← Back to edit
                  </button>
                  <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] hover:bg-navy-600">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" />
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

      {/* ── MODALS ─── */}
      <HelpModal open={helpOpen} initialTab={helpTab} onClose={() => setHelpOpen(false)} />
      <ProjectsModal open={projectsOpen} userId={user?.uid} onClose={() => setProjectsOpen(false)} onLoad={handleLoadProject} />
    </div>
  );
}
