import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizePlan } from "./plans";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Ensure a user document exists in Firestore.
 *
 * TRIAL FLOW:
 *   New user → LITE plan (7-day trial) → expires → FREE plan (permanent, no lock)
 *   FREE plan is never locked — user can always use the app with limits.
 */
export async function ensureUserDoc(uid, email = null) {
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

  if (!snap.exists()) {
    // ✅ Brand new user — start with LITE trial (7 days)
    await setDoc(ref, {
      uid,
      email:      email ?? null,
      plan:       "LITE",          // ✅ LITE trial, not FREE
      planStatus: "trial",
      expiresAt:  new Date(Date.now() + TRIAL_MS).toISOString(),
      createdAt:  serverTimestamp(),
    }, { merge: true });
  } else {
    // ✅ Existing user — backfill expiresAt if FREE and missing
    const data = snap.data();
    const plan = (data.plan || "FREE").toUpperCase();

    if (!data.expiresAt && (plan === "FREE" || !data.plan)) {
      let baseDate;
      try {
        baseDate = data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt ? new Date(data.createdAt) : new Date();
      } catch { baseDate = new Date(); }

      await updateDoc(ref, {
        plan:       "FREE",
        planStatus: "free",
        expiresAt:  new Date(baseDate.getTime() + TRIAL_MS).toISOString(),
      });
    }
  }

  return (await getDoc(ref)).data();
}

/**
 * REMOVED: grantFreeTrial() was giving users a LITE plan for 7 days.
 * Per spec: new users get FREE plan (not LITE), with a 7-day trial window.
 * The 7-day window is now set in ensureUserDoc() above.
 *
 * If you previously called grantFreeTrial() on signup, replace it with
 * ensureUserDoc(uid, email) — that handles everything.
 */

/**
 * grantFreeTrial — kept for signup page compatibility.
 * Ensures user doc exists with FREE plan + 7-day trial window.
 * Same as ensureUserDoc() but always callable on signup.
 */
export async function grantFreeTrial(uid, email = null) {
  return ensureUserDoc(uid, email);
}

// ── Redeem code ────────────────────────────────────────────────────────────────

/**
 * Redeem a code for a user.
 *
 * Firestore redeemCodes/{code} structure:
 *   { code, type: "lite"|"pro"|"LITE"|"PRO",
 *     durationDays: number, active: true, used: false,
 *     usedBy: null, usedAt: null, createdAt }
 *
 * Returns: { plan: "LITE"|"PRO", planStatus: "active", expiresAt: string }
 */
export async function redeemCode(uid, email, rawCode) {
  if (!uid || !rawCode) throw new Error("Missing uid or code.");

  const codeId   = rawCode.trim().toUpperCase();
  const codeRef  = doc(db, "redeemCodes", codeId);
  const codeSnap = await getDoc(codeRef);

  // ── Validation ────────────────────────────────────────────────────────────

  if (!codeSnap.exists()) {
    throw new Error("Invalid or expired code. Check for typos.");
  }

  const codeData = codeSnap.data();

  if (codeData.active === false) {
    throw new Error("This code has been deactivated.");
  }

  if (codeData.used === true) {
    throw new Error("This code has already been used.");
  }

  // ✅ Normalize plan type regardless of how admin stored it ("lite"/"LITE"/"Lite")
  const rawType  = codeData.type ?? codeData.planType ?? codeData.plan ?? "";
  const planType = normalizePlan(rawType); // → "LITE" | "PRO"

  if (planType === "FREE") {
    throw new Error("Invalid code type. Please contact support.");
  }

  const durationDays = Number(codeData.durationDays ?? codeData.duration ?? 0);
  if (!durationDays || durationDays < 1) {
    throw new Error("Invalid code duration. Please contact support.");
  }

  // ── Apply plan ────────────────────────────────────────────────────────────

  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await ensureUserDoc(uid, email);

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    plan:       planType,              // ✅ ALWAYS uppercase ("LITE" | "PRO")
    planStatus: "active",
    expiresAt:  expiresAt.toISOString(),
  });

  // Mark code as used
  await updateDoc(codeRef, {
    used:   true,
    usedBy: uid,
    usedAt: new Date().toISOString(),
    active: false,
  });

  return {
    plan:       planType,             // "LITE" | "PRO"
    planStatus: "active",
    expiresAt:  expiresAt.toISOString(),
  };
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// ── Trips / Projects ──────────────────────────────────────────────────────────

export const loadProjects  = getUserTrips;
export const deleteProject = deleteTrip;

export async function saveProject(uid, existingId, { tripInfo, rows, region, rate }) {
  const data = {
    userId:    uid,
    tripInfo,
    rows,
    region,
    rate,
    updatedAt: serverTimestamp(),
  };
  if (existingId) {
    await updateDoc(doc(db, "trips", existingId), data);
    return existingId;
  } else {
    data.createdAt = serverTimestamp();
    const ref = await addDoc(collection(db, "trips"), data);
    return ref.id;
  }
}

export async function getUserTrips(uid) {
  const snap = await getDocs(
    query(collection(db, "trips"), where("userId", "==", uid), orderBy("updatedAt", "desc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteTrip(tripId) {
  await deleteDoc(doc(db, "trips", tripId));
}

export async function countUserTrips(uid) {
  const snap = await getCountFromServer(
    query(collection(db, "trips"), where("userId", "==", uid))
  );
  return snap.data().count;
}

// ── Admin functions ───────────────────────────────────────────────────────────

/**
 * Set a user's plan back to FREE (admin action).
 * Clears expiresAt so there's no lingering paid plan.
 */
export async function adminSetUserFree(uid) {
  await updateDoc(doc(db, "users", uid), {
    plan:       "FREE",
    planStatus: "free",
    expiresAt:  null,
  });
}

/**
 * Delete all of a user's trips and their user document from Firestore.
 * Note: this does NOT delete the Firebase Auth account — do that separately
 * from the Firebase console or via Firebase Admin SDK on the server.
 */
export async function adminDeleteUser(uid) {
  // Delete all trips belonging to this user
  const tripsSnap = await getDocs(
    query(collection(db, "trips"), where("userId", "==", uid))
  );
  const deletions = tripsSnap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletions);

  // Delete the user document
  await deleteDoc(doc(db, "users", uid));
}
