/**
 * lib/plans.js
 *
 * Single source of truth for plan definitions.
 * Import this everywhere you need plan limits or labels.
 */

// ── Plan IDs ──────────────────────────────────────────────────────────────────

export const PLANS = {
  FREE:  "FREE",
  LITE:  "LITE",
  PRO:   "PRO",
};

// ── Plan limits ───────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    maxItineraries: 0,   // cannot create new trips
    maxDays:        0,
    pdfExport:      false,
    save:           false,
  },
  LITE: {
    maxItineraries: 3,   // max 3 saved trips
    maxDays:        7,   // max 7 trip days
    pdfExport:      true,
    save:           true,
  },
  PRO: {
    maxItineraries: Infinity,
    maxDays:        Infinity,
    pdfExport:      true,
    save:           true,
  },
};

// ── Redeem code effects ───────────────────────────────────────────────────────

export const CODE_EFFECTS = {
  TRIAL: { plan: PLANS.LITE,  durationDays: 3   },
  LITE:  { plan: PLANS.LITE,  durationDays: 30  },
  PRO:   { plan: PLANS.PRO,   durationDays: 365 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve the active plan from a Firestore user document.
 * Handles expiry automatically.
 */
export function resolveActivePlan(userDoc) {
  if (!userDoc) return PLANS.FREE;
  const { plan, expiresAt } = userDoc;
  if (!plan || plan === PLANS.FREE) return PLANS.FREE;

  // If there's an expiry, check it
  if (expiresAt) {
    const expiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    if (new Date() > expiry) return PLANS.FREE; // expired → locked
  }

  return plan;
}

/** Check if a plan allows creating a new trip given current count. */
export function canCreateTrip(plan, currentCount) {
  const limit = PLAN_LIMITS[plan]?.maxItineraries ?? 0;
  return currentCount < limit;
}

/** Check if a trip's day count is within the plan limit. */
export function canAddDays(plan, dayCount) {
  const limit = PLAN_LIMITS[plan]?.maxDays ?? 0;
  if (limit === Infinity) return true;
  return dayCount <= limit;
}

/** Human-readable plan label. */
export function planLabel(plan) {
  return { FREE: "Free", LITE: "Lite", PRO: "Pro" }[plan] ?? "Free";
}

/** Plan badge colour classes. */
export function planBadgeClass(plan) {
  return {
    FREE: "bg-gray-100 text-gray-600",
    LITE: "bg-blue-100 text-blue-700",
    PRO:  "bg-violet-100 text-violet-700",
  }[plan] ?? "bg-gray-100 text-gray-500";
}
