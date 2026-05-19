/**
 * lib/verifyPlanServer.js
 *
 * Call this before any PRO-gated action (PDF export, .bvntrip export/import).
 * Verifies plan server-side — cannot be bypassed via browser console.
 *
 * Usage:
 *   const ok = await verifyPlanServer(user.uid, "PRO");
 *   if (!ok) { handleUpgradeNeeded("..."); return; }
 *   // proceed with action
 */

export async function verifyPlanServer(uid, requiredPlan = "PRO") {
  try {
    const res = await fetch("/api/verify-plan", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ uid, requiredPlan }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.allowed === true;

  } catch (err) {
    console.error("[verifyPlanServer]", err);
    // Fail closed — if verification fails, deny access
    return false;
  }
}
