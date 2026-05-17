"use client";

import { useAuth } from "@/context/AuthProvider";
import { PLAN_LIMITS, getPlanFeatures, canCreateTrip } from "@/lib/plans";

/**
 * usePlan — convenient access to the current user's plan limits.
 *
 * PLAN FLOW:
 *   New user → LITE (7d trial) → expires → FREE (permanent, never locked)
 *   FREE = always accessible, just limited (15 rows, no load, no export)
 *
 * Returns:
 *   plan           — "FREE" | "LITE" | "PRO"
 *   features       — full feature flags from getPlanFeatures(plan)
 *   canSave        — boolean
 *   canExportPDF   — boolean
 *   checkTrip(n)   — { allowed, reason }
 *   isLocked       — always false (FREE is never locked)
 *   liteDaysLeft   — number | null (only for LITE plan, shows trial days left)
 */
export function usePlan() {
  const { activePlan, userProfile } = useAuth();
  const limits   = PLAN_LIMITS[activePlan] ?? PLAN_LIMITS.FREE;
  const features = getPlanFeatures(activePlan);

  // ── LITE trial countdown ──────────────────────────────────────────────────
  // Show how many days are left in the LITE trial so user knows to upgrade.

  let liteDaysLeft = null;
  if (activePlan === "LITE" && userProfile?.expiresAt) {
    try {
      const expiry = userProfile.expiresAt?.toDate
        ? userProfile.expiresAt.toDate()
        : new Date(userProfile.expiresAt);
      const msLeft = expiry.getTime() - Date.now();
      liteDaysLeft = msLeft > 0 ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;
    } catch { liteDaysLeft = null; }
  }

  // ── Trip count check ──────────────────────────────────────────────────────

  const checkTrip = (currentCount) => {
    const allowed = canCreateTrip(activePlan, currentCount);
    return {
      allowed,
      reason: allowed ? null :
        `LITE plan is limited to ${limits.maxItineraries} saved trips. Upgrade to Pro for unlimited.`,
    };
  };

  return {
    plan:          activePlan,
    limits,
    features,
    canSave:       limits.save,
    canExportPDF:  limits.pdfExport,
    checkTrip,
    isLocked:      false,        // ✅ FREE is NEVER locked
    liteDaysLeft,                // null unless on LITE trial
  };
}
