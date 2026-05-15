import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Ensure a user document exists in Firestore.
 * Creates it with default "free" plan if missing.
 */
export async function ensureUserDoc(uid, email = null) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email: email ?? null,
      plan:       "free",
      planStatus: "free",
      expiresAt:  null,
      createdAt:  serverTimestamp(),
    }, { merge: true });
  }
  return (await getDoc(ref)).data();
}

/**
 * Grant a 7-day Lite trial to a new user automatically on signup.
 * Safe to call multiple times — only applies if plan is still "free".
 */
export async function grantFreeTrial(uid, email = null) {
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);

  // Only grant trial to brand-new / free users
  const existing = snap.exists() ? snap.data() : null;
  if (existing?.plan && existing.plan !== "free") return; // already has a plan

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

  await setDoc(ref, {
    uid,
    email: email ?? existing?.email ?? null,
    plan:       "lite",
    planStatus: "trial",
    expiresAt:  expiresAt.toISOString(),
    createdAt:  existing?.createdAt ?? serverTimestamp(),
    trialGrantedAt: new Date().toISOString(),
  }, { merge: true });

  return { plan: "lite", planStatus: "trial", expiresAt: expiresAt.toISOString() };
}

// ── Redeem code ────────────────────────────────────────────────────────────────

/**
 * Redeem a code for a user.
 *
 * Firestore structure (redeemCodes/{code}):
 *   { code, type: "lite"|"pro", durationDays: number,
 *     active: true, used: false, usedBy: null, usedAt: null, createdAt }
 *
 * Returns: { plan, planStatus, expiresAt }
 */
export async function redeemCode(uid, email, rawCode) {
  if (!uid || !rawCode) throw new Error("Missing uid or code.");

  const codeId  = rawCode.trim().toUpperCase();
  const codeRef = doc(db, "redeemCodes", codeId);
  const codeSnap = await getDoc(codeRef);

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!codeSnap.exists()) {
    throw new Error("Invalid or expired code. Check for typos.");
  }

  const codeData = codeSnap.data();

  // 1. Must be active (not disabled by admin)
  if (codeData.active === false) {
    throw new Error("This code has been deactivated.");
  }

  // 2. Must not already be used
  if (codeData.used === true) {
    throw new Error("This code has already been used.");
  }

  // 3. Validate plan type — MUST be lowercase "lite" or "pro"
  //    Admin generate codes writes: type: "lite" | "pro"  (always lowercase)
  const rawType   = codeData.type ?? codeData.planType ?? codeData.plan ?? "";
  const planType  = String(rawType).toLowerCase().trim();

  if (!planType || !["lite", "pro"].includes(planType)) {
    throw new Error("Invalid code type. Please contact support.");
  }

  // 4. Must have durationDays
  const durationDays = Number(codeData.durationDays ?? codeData.duration ?? 0);
  if (!durationDays || durationDays < 1) {
    throw new Error("Invalid code duration. Please contact support.");
  }

  // ── Apply plan ──────────────────────────────────────────────────────────────
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  // Ensure user doc exists
  await ensureUserDoc(uid, email);

  // Update user plan
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    plan:        planType,            // "lite" or "pro"
    planStatus:  "active",
    expiresAt:   expiresAt.toISOString(),
  });

  // Mark code as used
  await updateDoc(codeRef, {
    used:   true,
    usedBy: uid,
    usedAt: new Date().toISOString(),
    active: false,
  });

  return {
    plan:       planType,             // "lite" | "pro"
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

// Aliases used by ProjectsModal
export const loadProjects = getUserTrips;
export const deleteProject = deleteTrip;

export async function saveProject(uid, existingId, { tripInfo, rows, region, rate }) {
  const data = {
    userId:   uid,
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
