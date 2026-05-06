import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Path helpers ────────────────────────────────────────────────────────────

function projectsRef(userId) {
  return collection(db, "users", userId, "projects");
}

function projectRef(userId, projectId) {
  return doc(db, "users", userId, "projects", projectId);
}

// ── Serialise / deserialise ──────────────────────────────────────────────────
// Firestore can't store undefined values; strip them before saving.

function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a new project document in Firestore.
 * Returns the generated projectId.
 */
export async function createProject(userId, { tripInfo, rows, region, rate }) {
  const ref = await addDoc(projectsRef(userId), {
    userId,
    tripInfo: clean(tripInfo),
    rows:     clean(rows),
    region:   region ?? null,
    rate:     rate ?? 110,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update an existing project. Call this on auto-save.
 */
export async function updateProject(userId, projectId, { tripInfo, rows, region, rate }) {
  await setDoc(
    projectRef(userId, projectId),
    {
      userId,
      tripInfo: clean(tripInfo),
      rows:     clean(rows),
      region:   region ?? null,
      rate:     rate ?? 110,
      updatedAt: serverTimestamp(),
    },
    { merge: true }            // keep createdAt + any other fields
  );
}

/**
 * Save = create if no projectId, update if one exists.
 * Returns the projectId (new or existing).
 */
export async function saveProject(userId, projectId, data) {
  if (projectId) {
    await updateProject(userId, projectId, data);
    return projectId;
  }
  return createProject(userId, data);
}

/**
 * Load all projects for a user, newest first.
 * Returns an array of { id, ...data } objects.
 */
export async function loadProjects(userId) {
  const q = query(projectsRef(userId), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    // Convert Firestore Timestamps to ISO strings for easy display
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

/**
 * Load a single project by id.
 */
export async function loadProject(userId, projectId) {
  const snap = await getDoc(projectRef(userId, projectId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...snap.data(),
    createdAt: snap.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: snap.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

/**
 * Permanently delete a project.
 */
export async function deleteProject(userId, projectId) {
  await deleteDoc(projectRef(userId, projectId));
}
