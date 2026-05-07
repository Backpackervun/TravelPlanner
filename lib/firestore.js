/**
 * lib/firestore.js — v7
 * Fixed: redeemCode now uses setDoc with merge so missing user docs never crash.
 */
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  deleteDoc, updateDoc, query, where, orderBy,
  serverTimestamp, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import { CODE_EFFECTS } from "./plans";

const clean = (v) => JSON.parse(JSON.stringify(v));

// ─── User profiles ──────────────────────────────────────────────────────────

export async function createUserProfile(uid, { name, email, phone }) {
  await setDoc(doc(db, "users", uid), {
    uid, name: name ?? "", email: email ?? "", phone: phone ?? "",
    role: "user", plan: "FREE", planStatus: "inactive",
    expiresAt: null, language: "en", createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  // Use setDoc + merge so it works even if the document doesn't exist yet
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function updateUserLanguage(uid, lang) {
  await setDoc(doc(db, "users", uid), { language: lang }, { merge: true });
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export async function saveProject(userId, projectId, { tripInfo, rows, region, rate }) {
  const data = {
    userId, ownerId: userId,
    tripInfo: clean(tripInfo), rows: clean(rows),
    region: region ?? null, rate: rate ?? 1,
    updatedAt: serverTimestamp(),
  };
  if (projectId) {
    await setDoc(doc(db, "trips", projectId), data, { merge: true });
    return projectId;
  }
  data.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, "trips"), data);
  return ref.id;
}

export async function loadProjects(userId) {
  const q    = query(collection(db, "trips"), where("userId", "==", userId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id, ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

export async function deleteProject(userId, projectId) {
  const snap = await getDoc(doc(db, "trips", projectId));
  if (snap.exists() && (snap.data().userId === userId || snap.data().ownerId === userId)) {
    await deleteDoc(doc(db, "trips", projectId));
  }
}

export async function countUserTrips(userId) {
  try {
    const q    = query(collection(db, "trips"), where("userId", "==", userId));
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch {
    // Fallback for older SDK versions
    const snap = await getDocs(query(collection(db, "trips"), where("userId", "==", userId)));
    return snap.size;
  }
}

// ─── Redeem codes ─────────────────────────────────────────────────────────────

/**
 * Redeem a code — SAFE VERSION.
 *
 * Uses setDoc + merge throughout, so if the user document doesn't exist yet
 * (e.g. the user signed up via a different flow and Firestore doc was never created),
 * it creates it automatically rather than crashing.
 */
export async function redeemCode(userId, userEmail, codeStr) {
  const codeId  = codeStr.trim().toUpperCase();
  const codeRef = doc(db, "redeemCodes", codeId);
  const snap    = await getDoc(codeRef);

  if (!snap.exists()) throw new Error("Code not found. Check for typos.");
  const data = snap.data();

  if (!data.active) throw new Error("This code is no longer active.");
  if (data.used)    throw new Error("This code has already been used.");
  if (data.expiresAt) {
    const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (new Date() > exp) throw new Error("This code has expired.");
  }

  const effect = CODE_EFFECTS[data.type];
  if (!effect) throw new Error("Invalid code type. Contact support.");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.durationDays ?? effect.durationDays));

  // Mark code as used
  await setDoc(codeRef, {
    used: true, usedBy: userId, usedAt: serverTimestamp(),
  }, { merge: true });

  // Create or UPDATE user plan — setDoc with merge handles missing doc safely
  await setDoc(doc(db, "users", userId), {
    uid:         userId,
    email:       userEmail ?? "",
    plan:        effect.plan,
    planStatus:  "active",
    expiresAt,
    // Only set role/createdAt if not already present (merge won't overwrite)
  }, { merge: true });

  return {
    success:   true,
    plan:      effect.plan,
    expiresAt,
    codeType:  data.type,
  };
}

export async function seedInitialCodes() {
  const codes = [
    { code: "BE-3DAYSTRIAL", type: "TRIAL", durationDays: 3,   active: true, used: false, expiresAt: null },
    { code: "BE-LITECODE",   type: "LITE",  durationDays: 30,  active: true, used: false, expiresAt: null },
    { code: "BE-PROCODE",    type: "PRO",   durationDays: 365, active: true, used: false, expiresAt: null },
  ];
  for (const c of codes) {
    const ref = doc(db, "redeemCodes", c.code);
    const s   = await getDoc(ref);
    if (!s.exists()) await setDoc(ref, { ...c, createdAt: serverTimestamp() });
  }
}

export async function generateCodes({ type, durationDays, quantity }) {
  const prefix  = { PRO: "BE-PRO", LITE: "BE-LITE", TRIAL: "BE-TRIAL" }[type] ?? "BE-CODE";
  const created = [];
  for (let i = 0; i < quantity; i++) {
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code   = `${prefix}-${suffix}`;
    await setDoc(doc(db, "redeemCodes", code), {
      code, type, durationDays, active: true, used: false,
      expiresAt: null, usedBy: null, usedAt: null,
      createdAt: serverTimestamp(),
    });
    created.push(code);
  }
  return created;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminGetStats() {
  const [usersSnap, codesSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "redeemCodes")),
  ]);
  const now = new Date();
  let lite = 0, pro = 0, expired = 0;
  usersSnap.forEach((d) => {
    const u   = d.data();
    const exp = u.expiresAt?.toDate ? u.expiresAt.toDate() : u.expiresAt ? new Date(u.expiresAt) : null;
    if (exp && now > exp) { expired++; return; }
    if (u.plan === "LITE") lite++;
    else if (u.plan === "PRO") pro++;
  });
  return { totalUsers: usersSnap.size, liteUsers: lite, proUsers: pro, expiredUsers: expired, totalCodes: codesSnap.size };
}

export async function adminGetAllUsers() {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({
    id: d.id, ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    expiresAt: d.data().expiresAt?.toDate ? d.data().expiresAt.toDate().toISOString() : (d.data().expiresAt ?? null),
  }));
}

export async function adminGetAllCodes() {
  const snap = await getDocs(collection(db, "redeemCodes"));
  return snap.docs.map((d) => ({
    id: d.id, ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    usedAt:    d.data().usedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

export async function adminUpdateUser(uid, { plan, durationDays }) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  await setDoc(doc(db, "users", uid), { plan, planStatus: "active", expiresAt }, { merge: true });
}
