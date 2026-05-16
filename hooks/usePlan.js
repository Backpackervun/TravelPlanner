"use client";

import { useAuth } from "@/context/AuthProvider";
import { PLAN_LIMITS, getPlanFeatures, canCreateTrip } from "@/lib/plans";

/**
 * usePlan — convenient access to the current user's plan limits.
 *
 * Returns:
 *   plan          — "FREE" | "LITE" | "PRO"
 *   limits        — PLAN_LIMITS[plan]
 *   features      — getPlanFeatures(plan) — full feature flags incl. maxRows
 *   canSave       — boolean
 *   canExportPDF  — boolean
 *   checkTrip(count) — returns { allowed, reason }
 *   isLocked      — true ONLY when FREE plan AND trial has expired
 *   trialDaysLeft — number | null (days remaining for FREE trial)
 */
export function usePlan() {
  const { activePlan, userProfile } = useAuth();
  const limits   = PLAN_LIMITS[activePlan] ?? PLAN_LIMITS.FREE;
  const features = getPlanFeatures(activePlan);

  // ── FREE trial expiry check ──────────────────────────────────────────────
  // FREE users get 7 days of full access from account creation.
  // isLocked = true only when FREE AND trial window has ended.

  let trialDaysLeft = null;
  let isTrialExpired = false;

  if (activePlan === "FREE" && userProfile?.expiresAt) {
    try {
      const expiry = userProfile.expiresAt?.toDate
        ? userProfile.expiresAt.toDate()
        : new Date(userProfile.expiresAt);
      const msLeft = expiry.getTime() - Date.now();
      isTrialExpired = msLeft <= 0;
      trialDaysLeft  = isTrialExpired ? 0 : Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    } catch {
      isTrialExpired = false;
    }
  } else if (activePlan === "FREE" && !userProfile?.expiresAt) {
    // No expiry set → brand new user, trial not started yet, allow access
    isTrialExpired = false;
  }

  // isLocked: FREE AND trial expired (or never had trial)
  const isLocked = activePlan === "FREE" && isTrialExpired;

  // ── Trip count check ─────────────────────────────────────────────────────

  const checkTrip = (currentCount) => {
    // FREE trial: unlimited saves during trial
    if (activePlan === "FREE" && !isTrialExpired) return { allowed: true, reason: null };

    const allowed = canCreateTrip(activePlan, currentCount);
    return {
      allowed,
      reason: allowed ? null :
        activePlan === "LITE"
          ? `LITE plan is limited to ${limits.maxItineraries} saved trips. Upgrade to Pro for unlimited.`
          : `Upgrade your plan to save trips.`,
    };
  };

  return {
    plan:          activePlan,
    limits,
    features,
    canSave:       limits.save,
    canExportPDF:  limits.pdfExport,
    checkTrip,
    isLocked,
    trialDaysLeft,
    isTrialExpired,
  };
}
