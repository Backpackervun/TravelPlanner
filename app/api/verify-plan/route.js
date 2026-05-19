/**
 * app/api/verify-plan/route.js
 *
 * Server-side plan verification endpoint.
 * Called before sensitive actions (PDF export, .bvntrip export).
 * Uses Firebase Admin SDK — cannot be spoofed from the browser console.
 */

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { uid, requiredPlan } = await request.json();

    if (!uid || !requiredPlan) {
      return NextResponse.json({ allowed: false, reason: "Missing parameters." }, { status: 400 });
    }

    // ── Read plan directly from Firestore server-side ─────────────────────
    const snap = await adminDb.collection("users").doc(uid).get();

    if (!snap.exists) {
      return NextResponse.json({ allowed: false, reason: "User not found." }, { status: 404 });
    }

    const data = snap.data();
    const rawPlan = (data.plan || "FREE").toUpperCase();

    // ── Check expiry server-side ──────────────────────────────────────────
    let resolvedPlan = rawPlan;
    if (data.expiresAt) {
      const expiry = data.expiresAt?.toDate
        ? data.expiresAt.toDate()
        : new Date(data.expiresAt);

      if (rawPlan === "LITE" || rawPlan === "PRO") {
        if (new Date() > expiry) resolvedPlan = "FREE";
      }
      // FREE + unexpired = LITE trial
      if (rawPlan === "FREE" && new Date() <= expiry) {
        resolvedPlan = "LITE";
      }
    }

    // ── Check if resolved plan meets requirement ───────────────────────────
    const PLAN_RANK = { FREE: 0, LITE: 1, PRO: 2 };
    const userRank     = PLAN_RANK[resolvedPlan]  ?? 0;
    const requiredRank = PLAN_RANK[requiredPlan.toUpperCase()] ?? 2;

    const allowed = userRank >= requiredRank;

    return NextResponse.json({
      allowed,
      plan: resolvedPlan,
      reason: allowed ? null : `This feature requires ${requiredPlan} plan.`,
    });

  } catch (err) {
    console.error("[verify-plan]", err);
    return NextResponse.json({ allowed: false, reason: "Verification failed." }, { status: 500 });
  }
}
