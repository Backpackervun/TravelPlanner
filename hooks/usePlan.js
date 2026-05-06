"use client";

import { useAuth } from "@/context/AuthProvider";
import { PLAN_LIMITS, canCreateTrip, canAddDays } from "@/lib/plans";

/**
 * usePlan — convenient access to the current user's plan limits.
 *
 * Returns:
 *   plan          — "FREE" | "LITE" | "PRO"
 *   limits        — PLAN_LIMITS[plan]
 *   canSave       — boolean
 *   canExportPDF  — boolean
 *   checkTrip(count) — returns { allowed, reason }
 *   checkDays(days)  — returns { allowed, reason }
 *   isLocked      — true when plan is FREE
 */
export function usePlan() {
  const { activePlan } = useAuth();
  const limits = PLAN_LIMITS[activePlan] ?? PLAN_LIMITS.FREE;

  const checkTrip = (currentCount) => {
    const allowed = canCreateTrip(activePlan, currentCount);
    return {
      allowed,
      reason: allowed ? null : `Your ${activePlan} plan allows max ${limits.maxItineraries} saved trips. Upgrade to Pro for unlimited.`,
    };
  };

  const checkDays = (dayCount) => {
    const allowed = canAddDays(activePlan, dayCount);
    return {
      allowed,
      reason: allowed ? null : `Your plan allows max ${limits.maxDays} trip days. Upgrade to Pro for unlimited.`,
    };
  };

  return {
    plan:        activePlan,
    limits,
    canSave:     limits.save,
    canExportPDF: limits.pdfExport,
    checkTrip,
    checkDays,
    isLocked:    activePlan === "FREE",
  };
}
