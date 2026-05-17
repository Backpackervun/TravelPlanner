/**
 * lib/plans.js — Complete rewrite (plan-gate-v4)
 *
 * NEW PLAN STRUCTURE:
 * ┌──────────────────────────┬──────┬──────┬─────┐
 * │ Feature                  │ FREE │ LITE │ PRO │
 * ├──────────────────────────┼──────┼──────┼─────┤
 * │ Save itinerary           │  ✓   │  ✓   │  ✓  │
 * │ Preview mode             │  ✓   │  ✓   │  ✓  │
 * │ Max rows per trip        │  15  │  25  │  ∞  │
 * │ Load saved trips         │  ✗   │  ✓   │  ✓  │
 * │ Export PDF               │  ✗   │  ✗   │  ✓  │
 * │ Export .bvntrip          │  ✗   │  ✗   │  ✓  │
 * │ Import .bvntrip          │  ✗   │  ✗   │  ✓  │
 * │ Expiry / Lock            │  ✗   │  7d  │  ✗  │
 * └──────────────────────────┴──────┴──────┴─────┘
 *
 * TRIAL FLOW:
 *   New user → LITE plan (7 days) → expires → FREE plan (permanent, no lock)
 *   FREE plan is never locked — user can always use the app with limits.
 */

// ── Canonical plan IDs ────────────────────────────────────────────────────────

export const PLAN_FREE = "FREE";
export const PLAN_LITE = "LITE";
export const PLAN_PRO  = "PRO";

// Legacy alias (some imports may use PLANS.FREE etc.)
export const PLANS = { FREE: PLAN_FREE, LITE: PLAN_LITE, PRO: PLAN_PRO };

// ── Normalize ─────────────────────────────────────────────────────────────────

/**
 * Normalize ANY plan string to canonical uppercase.
 * Firestore stores lowercase ("lite","pro") — this fixes the case mismatch.
 *
 * @param {string|null|undefined} raw
 * @returns {"FREE"|"LITE"|"PRO"}
 */
export function normalizePlan(raw) {
  if (!raw) return PLAN_FREE;
  const up = String(raw).toUpperCase().trim();
  if (up === "PRO")  return PLAN_PRO;
  if (up === "LITE") return PLAN_LITE;
  return PLAN_FREE;
}

// ── Feature flags ─────────────────────────────────────────────────────────────

/**
 * Returns all feature flags for a given plan.
 * Accepts both "PRO" and "pro" — normalized internally.
 *
 * @param {string} plan
 */
export function getPlanFeatures(plan) {
  const p = normalizePlan(plan);
  const isPro  = p === PLAN_PRO;
  const isLite = p === PLAN_LITE;

  return {
    canSave:          true,           // all plans
    canPreview:       true,           // all plans
    canViewCharts:    true,           // all plans
    canLoad:          isPro || isLite, // Lite+
    canExportPDF:     isPro,           // Pro only
    canExportBvntrip: isPro,           // Pro only
    canImportBvntrip: isPro,           // Pro only

    // Row & trip limits
    maxRows:  isPro ? Infinity : isLite ? 25 : 15,
    maxTrips: isPro ? Infinity : isLite ? 3  : Infinity,

    // ✅ FREE is NEVER locked — permanent plan with limited features
    // ✅ LITE trial expires → user drops to FREE automatically
    hasExpiry:  false,
    expiryDays: null,
  };
}

/** Quick single-feature check. */
export function canUseFeature(plan, feature) {
  return getPlanFeatures(plan)[feature] === true;
}

// ── Upgrade reasons ───────────────────────────────────────────────────────────

export const UPGRADE_REASONS = {
  canLoad:          "Loading saved trips requires a Lite or Pro plan.",
  canExportPDF:     "PDF export requires a Pro plan.",
  canExportBvntrip: "Exporting .bvntrip files requires a Pro plan.",
  canImportBvntrip: "Importing .bvntrip files requires a Pro plan.",
  maxRows:          "You've reached the row limit for your plan. Upgrade to add more rows.",
  maxTrips:         "LITE plan is limited to 3 saved trips. Upgrade to Pro for unlimited trips.",
};

export const PLAN_LIMITS = {
  FREE: { maxItineraries: Infinity, maxRows: 15,       pdfExport: false, save: true  },
  LITE: { maxItineraries: 3,        maxRows: 25,       pdfExport: false, save: true  },
  PRO:  { maxItineraries: Infinity, maxRows: Infinity, pdfExport: true,  save: true  },
};

// ── Redeem code effects ───────────────────────────────────────────────────────

/** Check if a plan allows creating a new trip given current count. */
export function canCreateTrip(plan, currentCount) {
  const p = normalizePlan(plan);
  const limit = PLAN_LIMITS[p]?.maxItineraries ?? Infinity;
  if (limit === Infinity) return true;
  return currentCount < limit;
}

export const CODE_EFFECTS = {
  TRIAL: { plan: PLAN_LITE, durationDays: 3   },
  LITE:  { plan: PLAN_LITE, durationDays: 30  },
  PRO:   { plan: PLAN_PRO,  durationDays: 365 },
};

// ── resolveActivePlan ─────────────────────────────────────────────────────────

/**
 * Resolve the active plan from a Firestore user document.
 * Normalizes plan case AND checks expiry.
 *
 * @param {object|null} userDoc
 * @returns {"FREE"|"LITE"|"PRO"}
 */
export function resolveActivePlan(userDoc) {
  if (!userDoc) return PLAN_FREE;

  const normalized = normalizePlan(userDoc.plan);

  // Check expiry for LITE and PRO plans
  if (normalized === PLAN_LITE || normalized === PLAN_PRO) {
    if (userDoc.expiresAt) {
      try {
        const expiry = userDoc.expiresAt.toDate
          ? userDoc.expiresAt.toDate()
          : new Date(userDoc.expiresAt);
        // Expired → downgrade to FREE (permanent, never locked)
        if (new Date() > expiry) return PLAN_FREE;
      } catch { /* bad date — allow access */ }
    }
    return normalized;
  }

  // ✅ FREE plan with unexpired expiresAt = user is on LITE trial
  // This handles existing users who were backfilled with plan:"FREE" + expiresAt
  if (normalized === PLAN_FREE && userDoc.expiresAt) {
    try {
      const expiry = userDoc.expiresAt.toDate
        ? userDoc.expiresAt.toDate()
        : new Date(userDoc.expiresAt);
      // Trial still active → give LITE features
      if (new Date() <= expiry) return PLAN_LITE;
    } catch { /* bad date */ }
  }

  // FREE with no expiresAt, or expired trial → permanent FREE
  return PLAN_FREE;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function planLabel(plan) {
  return { FREE: "Free", LITE: "Lite", PRO: "Pro" }[normalizePlan(plan)] ?? "Free";
}

export function planBadgeClass(plan) {
  return {
    PRO:  "bg-violet-100 text-violet-700 border border-violet-200",
    LITE: "bg-blue-100 text-blue-700 border border-blue-200",
    FREE: "bg-gray-100 text-gray-500 border border-gray-200",
  }[normalizePlan(plan)] ?? "bg-gray-100 text-gray-500 border border-gray-200";
}
