/**
 * lib/firestore.js
 * Collection: trips/  (flat, userId field for querying)
 */
import {
  collection, doc, addDoc, setDoc,
  getDoc, getDocs, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "trips";

function clean(v) { return JSON.parse(JSON.stringify(v)); }

/** Save (create or update). Returns the projectId. */
export async function saveProject(userId, projectId, { tripInfo, rows, region, rate }) {
  const data = {
    userId,
    tripInfo: clean(tripInfo),
    rows:     clean(rows),
    region:   region ?? null,
    rate:     rate   ?? 110,
    updatedAt: serverTimestamp(),
  };
  if (projectId) {
    await setDoc(doc(db, COL, projectId), data, { merge: true });
    return projectId;
  }
  data.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

/** Load all trips for a user, newest first. */
export async function loadProjects(userId) {
  const q = query(
    collection(db, COL),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

/** Load a single trip by ID. Returns null if not found. */
export async function loadProject(userId, projectId) {
  const snap = await getDoc(doc(db, COL, projectId));
  if (!snap.exists()) return null;
  const d = snap.data();
  if (d.userId !== userId) return null; // security: don't load other users' trips
  return {
    id: snap.id, ...d,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

/** Permanently delete a trip. */
export async function deleteProject(userId, projectId) {
  // Verify ownership before deleting
  const snap = await getDoc(doc(db, COL, projectId));
  if (snap.exists() && snap.data().userId === userId) {
    await deleteDoc(doc(db, COL, projectId));
  }
}
