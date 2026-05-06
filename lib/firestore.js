/**
 * lib/firestore.js
 * Collections:
 *   trips/  — itinerary projects (ownerId = userId)
 *   users/  — user profiles
 */
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  deleteDoc, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

function clean(v) { return JSON.parse(JSON.stringify(v)); }

// ── User profiles ────────────────────────────────────────────────────────────

/** Create or overwrite a user profile document at users/{uid}. */
export async function createUserProfile(uid, { name, email, phone }) {
  await setDoc(doc(db, "users", uid), {
    uid,
    name:      name  ?? "",
    email:     email ?? "",
    phone:     phone ?? "",
    createdAt: serverTimestamp(),
  });
}

/** Fetch user profile. Returns data object or null if not found. */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// ── Trip projects ─────────────────────────────────────────────────────────────

/**
 * Save (create or update) a trip.
 * New trips: addDoc → returns generated ID.
 * Existing trips: setDoc with merge → preserves createdAt.
 */
export async function saveProject(userId, projectId, { tripInfo, rows, region, rate }) {
  const data = {
    userId,
    ownerId:   userId,                // duplicate for legacy compat
    tripInfo:  clean(tripInfo),
    rows:      clean(rows),
    region:    region ?? null,
    rate:      rate   ?? 1,
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

/** List all trips owned by a user, newest first. */
export async function loadProjects(userId) {
  const q    = query(collection(db, "trips"), where("userId", "==", userId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

/** Load a single trip. Returns null if not found or wrong owner. */
export async function loadProject(userId, projectId) {
  const snap = await getDoc(doc(db, "trips", projectId));
  if (!snap.exists()) return null;
  const d = snap.data();
  if (d.userId !== userId && d.ownerId !== userId) return null;
  return {
    id: snap.id, ...d,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

/** Delete a trip (ownership-checked). */
export async function deleteProject(userId, projectId) {
  const snap = await getDoc(doc(db, "trips", projectId));
  if (!snap.exists()) return;
  const d = snap.data();
  if (d.userId === userId || d.ownerId === userId) {
    await deleteDoc(doc(db, "trips", projectId));
  }
}
