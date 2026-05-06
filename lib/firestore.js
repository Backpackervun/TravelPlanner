/**
 * lib/firestore.js  — v6
 * Collections: trips/  users/  redeemCodes/
 */
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  deleteDoc, updateDoc, query, where, orderBy,
  serverTimestamp, increment, limit, getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import { CODE_EFFECTS } from "./plans";

const clean = (v) => JSON.parse(JSON.stringify(v));

// ─────────────────────────────────────────────
// USER PROFILES   users/{uid}
// ─────────────────────────────────────────────

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
  await updateDoc(doc(db, "users", uid), { ...data });
}

export async function updateUserLanguage(uid, lang) {
  await updateDoc(doc(db, "users", uid), { language: lang });
}

// ─────────────────────────────────────────────
// TRIPS   trips/{id}
// ─────────────────────────────────────────────

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
  const q = query(collection(db, "trips"), where("userId", "==", userId), orderBy("updatedAt", "desc"));
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
  const q = query(collection(db, "trips"), where("userId", "==", userId));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

// ─────────────────────────────────────────────
// REDEEM CODES   redeemCodes/{code}
// ─────────────────────────────────────────────

/**
 * Redeem a code for a user.
 * Returns { success, message, plan, expiresAt } or throws.
 */
export async function redeemCode(userId, codeStr) {
  const codeId  = codeStr.trim().toUpperCase();
  const codeRef = doc(db, "redeemCodes", codeId);
  const snap    = await getDoc(codeRef);

  if (!snap.exists()) throw new Error("Code not found.");
  const data = snap.data();

  if (!data.active)  throw new Error("This code is no longer active.");
  if (data.used)     throw new Error("This code has already been used.");
  if (data.expiresAt) {
    const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
    if (new Date() > exp) throw new Error("This code has expired.");
  }

  // Determine what plan + duration this code gives
  const effect = CODE_EFFECTS[data.type];
  if (!effect) throw new Error("Invalid code type.");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.durationDays ?? effect.durationDays));

  // Mark code as used
  await updateDoc(codeRef, {
    used: true, usedBy: userId,
    usedAt: serverTimestamp(),
  });

  // Upgrade user plan
  await updateDoc(doc(db, "users", userId), {
    plan: effect.plan,
    planStatus: "active",
    expiresAt,
  });

  return { success: true, plan: effect.plan, expiresAt };
}

/**
 * Seed the initial static codes if they don't exist yet.
 * Call once from admin or on first boot.
 */
export async function seedInitialCodes() {
  const codes = [
    { code: "BE-3DAYSTRIAL", type: "TRIAL", durationDays: 3,   active: true, used: false, expiresAt: null },
    { code: "BE-LITECODE",   type: "LITE",  durationDays: 30,  active: true, used: false, expiresAt: null },
    { code: "BE-PROCODE",    type: "PRO",   durationDays: 365, active: true, used: false, expiresAt: null },
  ];
  for (const c of codes) {
    const ref = doc(db, "redeemCodes", c.code);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { ...c, createdAt: serverTimestamp() });
    }
  }
}

/** Generate a batch of new codes. */
export async function generateCodes({ type, durationDays, quantity }) {
  const prefix = type === "PRO" ? "BE-PRO" : type === "LITE" ? "BE-LITE" : "BE-TRIAL";
  const created = [];
  for (let i = 0; i < quantity; i++) {
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
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

// ─────────────────────────────────────────────
// ADMIN QUERIES
// ─────────────────────────────────────────────

export async function adminGetStats() {
  const usersSnap  = await getDocs(collection(db, "users"));
  const codesSnap  = await getDocs(collection(db, "redeemCodes"));
  const now        = new Date();

  let lite = 0, pro = 0, expired = 0;
  usersSnap.forEach((d) => {
    const u = d.data();
    const exp = u.expiresAt?.toDate ? u.expiresAt.toDate() : u.expiresAt ? new Date(u.expiresAt) : null;
    const isExpired = exp && now > exp;
    if (!isExpired && u.plan === "LITE") lite++;
    else if (!isExpired && u.plan === "PRO") pro++;
    else if (isExpired) expired++;
  });

  return {
    totalUsers:  usersSnap.size,
    liteUsers:   lite,
    proUsers:    pro,
    expiredUsers: expired,
    totalCodes:  codesSnap.size,
  };
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
    expiresAt: d.data().expiresAt?.toDate ? d.data().expiresAt.toDate().toISOString() : (d.data().expiresAt ?? null),
    usedAt:    d.data().usedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

export async function adminUpdateUser(uid, { plan, durationDays }) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);
  await updateDoc(doc(db, "users", uid), {
    plan, planStatus: "active", expiresAt,
  });
}
