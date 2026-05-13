/**
 * lib/itinerary-file.js
 *
 * Pure utility functions for .bvntrip file export and import.
 * No external dependencies — uses only Web APIs (Blob, FileReader, URL).
 *
 * .bvntrip is a JSON file with a known schema and version field.
 * Extension signals to the user it's a Backpackervun itinerary file.
 */

// ── Schema version — bump this if the format changes in breaking ways ─────────
export const BVNTRIP_VERSION = 1;

// ── Filename helpers ──────────────────────────────────────────────────────────

/**
 * Generate a safe filename from trip info.
 * e.g. "tokyo-ervan-2026-05-11.bvntrip"
 */
export function generateFilename(tripInfo) {
  const parts = [
    tripInfo?.destinations || "itinerary",
    tripInfo?.clientName   || "",
    tripInfo?.startDate    || "",
  ]
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean);

  return (parts.join("-") || "backpackervun-itinerary") + ".bvntrip";
}

// ── EXPORT ────────────────────────────────────────────────────────────────────

/**
 * Export the current itinerary state as a .bvntrip file download.
 * Triggers browser file download — no server needed.
 *
 * @param {object} payload  - { tripInfo, rows, region, rate }
 * @param {string} filename - optional override
 */
export function exportBvntrip(payload, filename) {
  const file = {
    version:   BVNTRIP_VERSION,
    app:       "backpackervun-travel-planner",
    createdAt: new Date().toISOString(),
    tripInfo:  payload.tripInfo  ?? {},
    rows:      payload.rows      ?? [],
    region:    payload.region    ?? null,
    rate:      payload.rate      ?? null,
  };

  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href     = url;
  a.download = filename || generateFilename(payload.tripInfo);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up after short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── IMPORT ────────────────────────────────────────────────────────────────────

/**
 * Parse and validate a .bvntrip file from a File object.
 * Returns { ok: true, data } or { ok: false, error: string }.
 *
 * @param {File} file
 * @returns {Promise<{ ok: boolean, data?: object, error?: string }>}
 */
export function parseBvntrip(file) {
  return new Promise((resolve) => {
    if (!file) {
      return resolve({ ok: false, error: "No file selected." });
    }

    // Accept .bvntrip or .json (for backwards compat)
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "bvntrip" && ext !== "json") {
      return resolve({ ok: false, error: `Invalid file type ".${ext}". Please select a .bvntrip file.` });
    }

    // Max 5MB safety check
    if (file.size > 5 * 1024 * 1024) {
      return resolve({ ok: false, error: "File too large (max 5 MB)." });
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const validated = validateSchema(parsed);
        if (!validated.ok) return resolve(validated);
        resolve({ ok: true, data: validated.data });
      } catch {
        resolve({ ok: false, error: "Could not parse file. The file may be corrupted." });
      }
    };

    reader.onerror = () => {
      resolve({ ok: false, error: "Could not read the file." });
    };

    reader.readAsText(file);
  });
}

// ── Schema validation ─────────────────────────────────────────────────────────

function validateSchema(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "File is not a valid itinerary." };
  }

  // Version check — warn but don't block for future versions
  if (raw.version && raw.version > BVNTRIP_VERSION) {
    console.warn(`[bvntrip] File version ${raw.version} is newer than supported (${BVNTRIP_VERSION}). Attempting to load.`);
  }

  // Ensure rows is an array
  const rows = Array.isArray(raw.rows) ? raw.rows : [];

  // Sanitize each row — fill missing fields with defaults
  const sanitizedRows = rows.map(row => ({
    id:          row.id          || generateId(),
    date:        row.date        || "",
    time:        row.time        || "",
    city:        row.city        || "",
    destination: row.destination || "",
    from:        row.from        || "",
    to:          row.to          || "",
    transport:   row.transport   || "",
    category:    row.category    || "",
    notes:       row.notes       || "",
    budgetLocal: Number(row.budgetLocal || row.budgetJPY || 0),
    budgetIDR:   Number(row.budgetIDR   || 0),
    _lastEdited: row._lastEdited || "local",
  }));

  // Sanitize tripInfo
  const tripInfo = {
    clientName:   raw.tripInfo?.clientName   || "",
    destinations: raw.tripInfo?.destinations || "",
    startDate:    raw.tripInfo?.startDate    || "",
    endDate:      raw.tripInfo?.endDate      || "",
    duration:     raw.tripInfo?.duration     || "",
    travelDates:  raw.tripInfo?.travelDates  || "",
  };

  return {
    ok: true,
    data: {
      tripInfo,
      rows:   sanitizedRows,
      region: typeof raw.region === "string" ? raw.region : null,
      rate:   typeof raw.rate   === "number" ? raw.rate   : null,
    },
  };
}

// ── ID generator (fallback) ───────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
