"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import HelpModal from "@/components/HelpModal";
import PrintHeader from "@/components/PrintHeader";
import PrintLayout from "@/components/PrintLayout";
import SetupScreen from "@/components/SetupScreen";
import TripInfoPanel from "@/components/TripInfoPanel";
import ItineraryTable from "@/components/ItineraryTable";
import ChartsPanel from "@/components/ChartsPanel";

import { INITIAL_ROWS, INITIAL_TRIP_INFO } from "@/lib/sample-data";
import { DEFAULT_RATE, generateId } from "@/lib/utils";

// Storage key — bumped to v6: v2.2 adds a top-level `setupComplete` flag,
// renames "Korea" → "South Korea", and adds UK/US regions.
const STORAGE_KEY = "backpackervun-travel-planner:v6";

// ============================================
// Row helpers
// ============================================

/** Recompute IDR from local using the given rate. */
function syncIDR(row, rate) {
  return {
    ...row,
    budgetIDR: Math.round((Number(row.budgetLocal) || 0) * (Number(rate) || 0)),
  };
}

/**
 * Migrate a row loaded from storage. Handles two compat cases:
 *   1. v1-v4 rows used `budgetJPY` — rename to `budgetLocal`.
 *   2. v1-v4 rows had estimate fields — strip them (no-op behaviorally,
 *      but keeps the row shape clean).
 *   3. Backfill missing budgetIDR from local + rate.
 */
function normalizeRow(row, rate) {
  let next = { ...row };
  if (next.budgetJPY !== undefined && next.budgetLocal === undefined) {
    next.budgetLocal = next.budgetJPY;
  }
  delete next.budgetJPY;
  delete next.durationMin;
  delete next.durationMax;
  delete next.costMin;
  delete next.costMax;
  if (typeof next.budgetIDR !== "number") next = syncIDR(next, rate);
  return next;
}

/**
 * Build a blank row, optionally inheriting context from a sibling
 * (e.g. when inserting next to an existing row, copy the date/city
 * so the new row visually belongs to the same day).
 */
function makeBlankRow(siblingRow) {
  return {
    id: generateId(),
    date: siblingRow ? siblingRow.date : "",
    time: "",
    city: siblingRow ? siblingRow.city : "",
    destination: "",
    from: "",
    to: "",
    transport: "",
    notes: "",
    category: "",
    budgetLocal: 0,
    budgetIDR: 0,
  };
}

/**
 * Build a date → day-number map. Day numbers run 1..N over the *chronological
 * order of unique non-empty dates*. Rows with empty dates get day = null.
 *
 * This makes Day a fully derived field — the user only ever edits Date.
 */
function buildDayMap(rows) {
  const dates = Array.from(
    new Set(rows.map((r) => (r.date || "").trim()).filter(Boolean))
  );
  dates.sort(); // ISO yyyy-mm-dd sorts chronologically as strings
  const map = {};
  dates.forEach((d, i) => {
    map[d] = i + 1;
  });
  return map;
}

// ============================================
// Page
// ============================================

export default function Page() {
const router = useRouter();

const handleLogout = () => {
  document.cookie = "token=; Max-Age=0; path=/";
  router.push("/login");
};
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState("edit"); // "edit" | "preview"

  const [rows, setRows] = useState(INITIAL_ROWS);
  const [tripInfo, setTripInfo] = useState(INITIAL_TRIP_INFO);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [region, setRegion] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Help modal state (which tab to open initially)
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState("how"); // "how" | "contact"

  // ---- Load from localStorage on mount ----
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const nextRate =
          typeof parsed.rate === "number" && parsed.rate > 0
            ? parsed.rate
            : DEFAULT_RATE;
        if (Array.isArray(parsed.rows)) {
          setRows(parsed.rows.map((r) => normalizeRow(r, nextRate)));
        }
        if (parsed.tripInfo && typeof parsed.tripInfo === "object") {
          setTripInfo({ ...INITIAL_TRIP_INFO, ...parsed.tripInfo });
        }
        if (typeof parsed.region === "string") {
          // v2.2 region rename migration: "Korea" → "South Korea"
          const r = parsed.region === "Korea" ? "South Korea" : parsed.region;
          setRegion(r);
        }
        if (typeof parsed.setupComplete === "boolean") {
          setSetupComplete(parsed.setupComplete);
        } else if (parsed.region) {
          // Pre-v6 saves had a region but no setupComplete flag — if the
          // user has a region they're past setup, so default to true.
          setSetupComplete(true);
        }
        setRate(nextRate);
      }
    } catch {
      /* malformed storage — fall back to defaults */
    }
    setHydrated(true);
  }, []);

  // ---- Persist on change ----
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rows, rate, tripInfo, region, setupComplete })
      );
    } catch {
      /* quota or private mode — silently ignore */
    }
  }, [rows, rate, tripInfo, region, setupComplete, hydrated]);

  // ---- Derived ----
  const totalLocal = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.budgetLocal) || 0), 0),
    [rows]
  );
  const totalIDR = useMemo(
    () => Math.round(totalLocal * (Number(rate) || 0)),
    [totalLocal, rate]
  );
  const dayMap = useMemo(() => buildDayMap(rows), [rows]);

  // ---- Mutations ----

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, [field]: value };
        const r_n = Number(rate) || 1;
        if (field === "budgetLocal") {
          next.budgetIDR = Math.round((Number(value) || 0) * r_n);
        } else if (field === "budgetIDR") {
          next.budgetLocal = Math.round((Number(value) || 0) / r_n);
        }
        // Smart suggestion: when both From and To are non-empty AND
        // category is currently blank, auto-pick "Transport". User can
        // override afterwards. We only fire this on from/to edits to
        // avoid stomping a manually-cleared category on unrelated edits.
        if ((field === "from" || field === "to") && !next.category) {
          const fromFilled = (next.from || "").trim().length > 0;
          const toFilled = (next.to || "").trim().length > 0;
          if (fromFilled && toFilled) {
            next.category = "Transport";
          }
        }
        return next;
      })
    );
  };

  const handleRateChange = (newRate) => {
    const safeRate = Number(newRate) || 0;
    setRate(safeRate);
    setRows((prev) => prev.map((r) => syncIDR(r, safeRate)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeBlankRow(prev[prev.length - 1])]);
  };

  const deleteRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  /**
   * Insert a blank row at a specific index. The new row inherits date+city
   * from the reference row so it slots into the same day visually.
   */
  const insertRowAt = (refId, position /* "above" | "below" */) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === refId);
      if (idx === -1) return prev;
      const insertAt = position === "above" ? idx : idx + 1;
      const newRow = makeBlankRow(prev[idx]);
      const next = [...prev];
      next.splice(insertAt, 0, newRow);
      return next;
    });
  };

  const handleReset = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Clear everything and start over? Your current entries, trip info, and region will be cleared."
      )
    ) {
      setRows([]);
      setTripInfo(INITIAL_TRIP_INFO);
      setRate(DEFAULT_RATE);
      setRegion(null);
      setSetupComplete(false);
      setMode("edit");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleHelp = () => {
    setHelpTab("how");
    setHelpOpen(true);
  };

  /**
   * Region change wrapper. When a user picks Indonesia, the local currency
   * IS IDR — so we force the conversion rate to 1 (and re-sync all rows)
   * so the hidden IDR column stays consistent with the local column. If
   * the user later switches away from Indonesia we leave the rate alone;
   * they're expected to set it for the new currency.
   */
  const handleRegionChange = (nextRegion) => {
    setRegion(nextRegion);
    if (nextRegion === "Indonesia" && rate !== 1) {
      setRate(1);
      setRows((prev) => prev.map((r) => syncIDR(r, 1)));
    }
  };

  const handleStartPlanning = () => {
    setSetupComplete(true);
  };

  const inPreview = mode === "preview";
  const showSetup = hydrated && !setupComplete;

  return (
    <div className={`paper-bg min-h-screen ${inPreview ? "preview-mode" : ""}`}>
      {/* ============================================================
          SETUP — first-run intake
          ============================================================ */}
      {showSetup && (
        <div className="screen-layout">
          {/* Mini header — logo + Help only, no totals/region pill */}
          <header className="border-b border-paper-line bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Backpackervun"
                  width="180"
                  height="22"
                  className="h-7 w-auto sm:h-8"
                />
                <span className="ml-3 hidden border-l border-paper-line pl-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted sm:inline-block">
                  Travel Planner
                </span>
              </div>
              <button
                type="button"
                onClick={handleHelp}
                className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Help
              </button>
            </div>
          </header>

          <SetupScreen
            tripInfo={tripInfo}
            region={region}
            onTripInfoChange={setTripInfo}
            onRegionChange={handleRegionChange}
            onStart={handleStartPlanning}
          />
        </div>
      )}

      {/* ============================================================
          PLANNER — interactive dashboard
          (Hidden in @media print AND when mode === "preview")
          ============================================================ */}
      {!showSetup && (
        <div className="screen-layout">
          <Header
            rate={rate}
<div style={{ padding: "10px" }}>
  <button onClick={handleLogout}>
    Logout
  </button>
</div>
            onRateChange={handleRateChange}
            onReset={handleReset}
            onPrint={handlePrint}
            onHelp={handleHelp}
            totalLocal={totalLocal}
            totalIDR={totalIDR}
            mode={mode}
            onModeChange={setMode}
            region={region}
            onRegionChange={handleRegionChange}
          />

          <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {hydrated ? (
              <TripInfoPanel tripInfo={tripInfo} onChange={setTripInfo} />
            ) : (
              <TripInfoSkeleton />
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                {hydrated ? (
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
                ) : (
                  <TableSkeleton />
                )}
              </div>

              <div className="min-w-0">
                {hydrated ? (
                  <ChartsPanel
                    rows={rows}
                    rate={rate}
                    totalLocal={totalLocal}
                    totalIDR={totalIDR}
                  />
                ) : (
                  <PanelSkeleton />
                )}
              </div>
            </div>

            <footer className="mt-10 border-t border-paper-line pt-5 pb-2 text-center text-[11px] text-ink-muted">
              Backpackervun Travel Planner · No accounts, no tracking · Your trip is saved in your browser ·{" "}
              <button
                type="button"
                onClick={() => {
                  setHelpTab("contact");
                  setHelpOpen(true);
                }}
                className="font-medium text-navy-500 underline-offset-2 hover:underline"
              >
                Contact us
              </button>
            </footer>
          </main>
        </div>
      )}

      {/* ============================================================
          PRINT / PREVIEW — dedicated vertical document
          (Visible when mode === "preview" OR when printing)
          Also gated on setupComplete so a Cmd+P during setup doesn't
          render an empty document.
          ============================================================ */}
      {!showSetup && (
        <div className="print-layout">
          {/* Preview-mode-only "Back to edit" bar */}
          {inPreview && (
            <div className="no-print sticky top-0 z-30 border-b border-paper-line bg-white/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-500">
                    Preview
                  </span>
                  <p className="text-xs text-ink-soft">
                    This is what the PDF will look like.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-paper-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-soft transition hover:border-navy-200 hover:text-navy-500"
                  >
                    ← Back to edit
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9V2h12v7" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 14h12v8H6z" />
                    </svg>
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* On-screen preview gets a paper-style frame; on print it's flat */}
          <div className={inPreview ? "preview-frame" : ""}>
            <PrintHeader totalLocal={totalLocal} totalIDR={totalIDR} region={region} />
            {hydrated && (
              <PrintLayout
                tripInfo={tripInfo}
                rows={rows}
                dayMap={dayMap}
                region={region}
                rate={rate}
                totalLocal={totalLocal}
                totalIDR={totalIDR}
              />
            )}
          </div>
        </div>
      )}

      {/* HelpModal — opens from the Help button or Contact link in footer */}
      <HelpModal
        open={helpOpen}
        initialTab={helpTab}
        onClose={() => setHelpOpen(false)}
      />
    </div>
  );
}

// ============================================
// Skeletons
// ============================================
function TripInfoSkeleton() {
  return (
    <div className="rounded-2xl border border-paper-line bg-white p-7 shadow-soft">
      <div className="h-3 w-24 rounded bg-paper-dim" />
      <div className="mt-3 h-9 w-72 rounded bg-paper-dim" />
      <div className="my-5 h-px w-full bg-paper-line" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-12 rounded bg-paper-dim/60" />
        <div className="h-12 rounded bg-paper-dim/60" />
        <div className="h-12 rounded bg-paper-dim/60" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft">
      <div className="mb-4 h-6 w-32 rounded bg-paper-dim" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 rounded bg-paper-dim/60" />
        ))}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 rounded-2xl border border-paper-line bg-white shadow-soft" />
      <div className="h-48 rounded-2xl border border-paper-line bg-white shadow-soft" />
      <div className="h-56 rounded-2xl border border-paper-line bg-white shadow-soft" />
    </div>
  );
}
