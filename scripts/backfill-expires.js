/**
 * MIGRATION SCRIPT — Backfill expiresAt for existing FREE users
 * ==============================================================
 * File: scripts/backfill-expires.js
 *
 * Run ONCE from terminal:
 *   node scripts/backfill-expires.js
 *
 * Requirements:
 *   - Firebase Admin SDK initialized (uses service account)
 *   - .env.local with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * What it does:
 *   - Finds all users with plan "FREE" or no plan, AND no expiresAt
 *   - Sets expiresAt = createdAt + 7 days
 *   - If no createdAt either, sets expiresAt = now + 7 days
 *   - Skips users who already have expiresAt (safe to re-run)
 *   - Skips LITE and PRO users (they have their own expiry)
 *   - Prints a summary of what was changed
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ── Init Firebase Admin ────────────────────────────────────────────────────

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

const db = getFirestore(app);

// ── Main ───────────────────────────────────────────────────────────────────

const TRIAL_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function run() {
  console.log("🔍 Fetching all users from Firestore...\n");

  const snap = await db.collection("users").get();
  const users = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  console.log(`Found ${users.length} total users.\n`);

  let skipped  = 0;
  let updated  = 0;
  let errors   = 0;

  for (const u of users) {
    const plan = (u.plan || "FREE").toUpperCase();

    // Skip LITE and PRO — they have their own expiry set by redeemCode()
    if (plan === "LITE" || plan === "PRO") {
      console.log(`  ⏭  Skip  ${u.email || u.id} — ${plan} plan`);
      skipped++;
      continue;
    }

    // Skip if already has expiresAt
    if (u.expiresAt) {
      console.log(`  ✓  OK    ${u.email || u.id} — already has expiresAt`);
      skipped++;
      continue;
    }

    // Compute expiresAt from createdAt + 7 days (or now + 7 days as fallback)
    let baseDate;
    try {
      baseDate = u.createdAt?.toDate
        ? u.createdAt.toDate()
        : u.createdAt
        ? new Date(u.createdAt)
        : new Date(); // fallback: now
    } catch {
      baseDate = new Date();
    }

    const expiresAt = new Date(baseDate.getTime() + TRIAL_DAYS * MS_PER_DAY);
    const isExpired = new Date() > expiresAt;

    // If trial still active → set LITE, else → FREE permanently
    const newPlan   = isExpired ? "FREE" : "LITE";
    const newStatus = isExpired ? "free"  : "trial";

    try {
      await u.ref.update({
        plan:       newPlan,
        planStatus: newStatus,
        expiresAt:  expiresAt.toISOString(),
      });

      const status = isExpired ? "⚠️  (ALREADY EXPIRED → FREE)" : "(LITE trial active)";
      console.log(`  ✅  Set   ${u.email || u.id} → ${newPlan} expires ${expiresAt.toLocaleDateString("en-GB")} ${status}`);
      updated++;
    } catch (err) {
      console.error(`  ❌  Error ${u.email || u.id}:`, err.message);
      errors++;
    }
  }

  console.log("\n──────────────────────────────────────────");
  console.log(`✅  Updated : ${updated} users`);
  console.log(`⏭  Skipped : ${skipped} users`);
  console.log(`❌  Errors  : ${errors}`);
  console.log("──────────────────────────────────────────");
  console.log("\nDone! Refresh /admin to see changes.");

  process.exit(0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
