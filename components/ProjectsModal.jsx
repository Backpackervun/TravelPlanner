"use client";

import { useEffect, useState } from "react";
import { loadProjects, deleteProject } from "@/lib/firestore";

/**
 * ProjectsModal — shows all projects saved by the current user.
 *
 * Props:
 *   open      — boolean
 *   userId    — Firebase uid
 *   onClose   — fn()
 *   onLoad    — fn(project) — called with the selected project
 */
export default function ProjectsModal({ open, userId, onClose, onLoad }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [deleting, setDeleting] = useState(null); // projectId being deleted

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError("");
    loadProjects(userId)
      .then(setProjects)
      .catch(() => setError("Could not load projects. Check your connection."))
      .finally(() => setLoading(false));
  }, [open, userId]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    setDeleting(projectId);
    try {
      await deleteProject(userId, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {
      alert("Could not delete. Try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-paper-line bg-white shadow-card animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Saved trips</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-paper-dim hover:text-navy-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="py-10 text-center text-sm text-ink-muted">
              Loading…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="py-10 text-center text-sm text-ink-muted">
              No saved trips yet. Click <strong className="text-navy-500">Save</strong> to save your current trip.
            </div>
          )}

          {!loading && projects.length > 0 && (
            <ul className="space-y-2">
              {projects.map((p) => {
                const name = p.tripInfo?.clientName || p.tripInfo?.destinations || "Untitled trip";
                const dest = p.tripInfo?.destinations || "—";
                const date = p.updatedAt
                  ? new Date(p.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                  : "—";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => { onLoad(p); onClose(); }}
                      className="group w-full rounded-xl border border-paper-line bg-white p-4 text-left transition hover:border-navy-200 hover:bg-navy-50/50 hover:shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{name}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">{dest}</p>
                          <p className="mt-1 text-[10px] text-ink-muted/60">Saved {date}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(p.id, e)}
                          disabled={deleting === p.id}
                          aria-label="Delete trip"
                          className="mt-0.5 flex-shrink-0 rounded p-1 text-ink-muted opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
