"use client";

/**
 * app/admin/page.jsx — Admin Panel v2
 *
 * NEW features (additive, no existing logic changed):
 * 1. Summary stats cards — Total users, Free, Lite, Pro, Expired
 * 2. Full user data — name, email, phone, dreamDestination, plan, planStatus, expiresAt, createdAt, tripCount
 * 3. Search — filter by name, email, phone, dreamDestination
 * 4. Expandable row — click a user to see full details + dream destination
 * 5. Trip count per user — reads from trips/{uid} subcollection count
 * 6. CSV export — download all user data as CSV
 * 7. Sort by column — name, plan, expires, trips
 * 8. Plan status badge — Active / Expired / Free / —
 */

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  collection, getDocs, doc, updateDoc, query, where, orderBy, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(ts) {
  if (!ts) return "—";
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return "—"; }
}

function isPlanActive(u) {
  if (!u.plan || u.plan === "free") return null; // free has no expiry
  if (!u.expiresAt) return null;
  try {
    const exp = u.expiresAt?.toDate ? u.expiresAt.toDate() : new Date(u.expiresAt);
    return exp > new Date();
  } catch { return null; }
}

function PlanBadge({ user }) {
  const { plan, planStatus } = user;
  if (!plan || plan === "free") return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">Free</span>;
  const active = isPlanActive(user);
  if (plan === "pro") return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${active !== false ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-600"}`}>PRO {active === false ? "⚠" : "✓"}</span>;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${active !== false ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"}`}>Lite {active === false ? "⚠" : "✓"}</span>;
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab]         = useState("users");
  const [users, setUsers]     = useState([]);
  const [codes, setCodes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [expanded, setExpanded] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== "admin")) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, userProfile, router]);

  // ── Load users + trip counts ───────────────────────────────────────────────
  useEffect(() => {
    if (!user || userProfile?.role !== "admin") return;
    loadAll();
  }, [user, userProfile]); // eslint-disable-line

  async function loadAll() {
    setLoading(true);
    try {
      // Load all users
      const snap = await getDocs(collection(db, "users"));
      const rawUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Load trip counts for each user in parallel
      const usersWithCounts = await Promise.all(
        rawUsers.map(async (u) => {
          try {
            const tripSnap = await getCountFromServer(
              query(collection(db, "trips"), where("userId", "==", u.uid || u.id))
            );
            return { ...u, tripCount: tripSnap.data().count };
          } catch {
            return { ...u, tripCount: 0 };
          }
        })
      );

      setUsers(usersWithCounts);

      // Load redeem codes
      const codeSnap = await getDocs(collection(db, "redeemCodes"));
      setCodes(codeSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("[admin] load error", e);
    } finally {
      setLoading(false);
    }
  }

  // ── Grant plan ─────────────────────────────────────────────────────────────
  async function grantPlan(userId, plan, days) {
    if (actionLoading) return;
    setActionLoading(userId + plan);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      await updateDoc(doc(db, "users", userId), {
        plan,
        planStatus: "active",
        expiresAt,
      });
      setUsers(prev => prev.map(u => u.id === userId
        ? { ...u, plan, planStatus: "active", expiresAt }
        : u
      ));
    } catch (e) {
      console.error("[admin] grantPlan error", e);
      alert("Failed to update plan.");
    } finally {
      setActionLoading(null);
    }
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
  function exportCSV() {
    const headers = ["Name","Email","Phone","Dream Destination","Plan","Plan Status","Expires","Trips","Joined"];
    const rows = users.map(u => [
      u.name || "",
      u.email || "",
      u.phone || "",
      u.dreamDestination || "",
      u.plan || "free",
      isPlanActive(u) === null ? "N/A" : isPlanActive(u) ? "Active" : "Expired",
      fmtDate(u.expiresAt),
      u.tripCount ?? 0,
      fmtDate(u.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backpackervun-users-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  // ── Filtered + sorted users ────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {

    const q = search.toLowerCase();

    let list = q
      ? users.filter(u =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.phone || "").toLowerCase().includes(q) ||
          (u.dreamDestination || "").toLowerCase().includes(q)
        )
      : [...users];

    list.sort((a, b) => {

      let va, vb;

      if (sortBy === "name") {

        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();

      }

      else if (sortBy === "plan") {

        va = a.plan || "free";
        vb = b.plan || "free";

      }

      else if (sortBy === "trips") {

        va = a.tripCount ?? 0;
        vb = b.tripCount ?? 0;

      }

      else if (sortBy === "joined") {

        try {

          va =
            a.createdAt?.toDate?.() ??
            new Date(a.createdAt ?? 0);

        } catch {

          va = new Date(0);

        }

        try {

          vb =
            b.createdAt?.toDate?.() ??
            new Date(b.createdAt ?? 0);

        } catch {

          vb = new Date(0);

        }

      }

      else if (sortBy === "expires") {

        try {

          va =
            a.expiresAt?.toDate?.() ??
            new Date(a.expiresAt ?? 0);

        } catch {

          va = new Date(0);

        }

        try {

          vb =
            b.expiresAt?.toDate?.() ??
            new Date(b.expiresAt ?? 0);

        } catch {

          vb = new Date(0);

        }

      }

      if (va < vb) {

        return sortDir === "asc"
          ? -1
          : 1;

      }

      if (va > vb) {

        return sortDir === "asc"
          ? 1
          : -1;

      }

      return 0;

    });

    return list;

  }, [users, search, sortBy, sortDir]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = users.length;
    const free  = users.filter(u => !u.plan || u.plan === "free").length;
    const lite  = users.filter(u => u.plan === "lite" && isPlanActive(u) !== false).length;
    const pro   = users.filter(u => u.plan === "pro"  && isPlanActive(u) !== false).length;
    const exp   = users.filter(u => u.plan && u.plan !== "free" && isPlanActive(u) === false).length;
    const trips = users.reduce((s, u) => s + (u.tripCount ?? 0), 0);
    return { total, free, lite, pro, exp, trips };
  }, [users]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };
  const SortIcon = ({ col }) => sortBy !== col ? <span className="opacity-20">↕</span> : sortDir === "asc" ? <span>↑</span> : <span>↓</span>;

  // ── Redeem codes tab ───────────────────────────────────────────────────────
  const activeCodesCount = codes.filter(c => c.active && !c.used).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0B3C5D] border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (userProfile?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto" />
            <span className="rounded-full bg-[#0B3C5D] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              ↓ Export CSV
            </button>
            <button onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0a3354]">
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
          {[
            { label:"Total Users",   val: stats.total,  color:"text-[#0B3C5D]", bg:"bg-blue-50" },
            { label:"Free",          val: stats.free,   color:"text-gray-600",  bg:"bg-gray-50" },
            { label:"Lite Active",   val: stats.lite,   color:"text-blue-700",  bg:"bg-blue-50" },
            { label:"Pro Active",    val: stats.pro,    color:"text-violet-700",bg:"bg-violet-50" },
            { label:"Expired",       val: stats.exp,    color:"text-red-600",   bg:"bg-red-50" },
            { label:"Total Trips",   val: stats.trips,  color:"text-emerald-700",bg:"bg-emerald-50" },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-xl border border-white/60 ${bg} p-4 shadow-sm`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 border-b border-gray-200 mb-4">
          {[
            { id:"users",  label:`👥 Users (${users.length})` },
            { id:"codes",  label:`🎟️ Redeem Codes (${activeCodesCount} active)` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${tab===id ? "border-[#0B3C5D] text-[#0B3C5D]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            USERS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <>
            {/* Search */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, email, phone, dream destination…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#0B3C5D] focus:ring-1 focus:ring-[#0B3C5D]"
                />
              </div>
              <p className="text-xs text-gray-400">{filteredUsers.length} results</p>
              <button onClick={loadAll} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 hover:bg-gray-50">
                ↻ Refresh
              </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left">
                      {[
                        { key:"name",    label:"NAME" },
                        { key:"email",   label:"EMAIL", noSort:true },
                        { key:"phone",   label:"PHONE", noSort:true },
                        { key:"plan",    label:"PLAN" },
                        { key:"expires", label:"EXPIRES" },
                        { key:"trips",   label:"TRIPS" },
                        { key:"joined",  label:"JOINED" },
                        { key:"actions", label:"ACTIONS", noSort:true },
                      ].map(({ key, label, noSort }) => (
                        <th key={key} onClick={noSort ? undefined : () => toggleSort(key)}
                          className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 whitespace-nowrap ${!noSort ? "cursor-pointer hover:text-gray-600 select-none" : ""}`}>
                          {label} {!noSort && <SortIcon col={key} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                          {search ? "No users match your search." : "No users yet."}
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map(u => {
                      const isExp = expanded === u.id;
                      const active = isPlanActive(u);
                      return (
                        <>
                          <tr key={u.id}
                            onClick={() => setExpanded(isExp ? null : u.id)}
                            className={`cursor-pointer transition hover:bg-blue-50/40 ${isExp ? "bg-blue-50/60" : ""}`}
                          >
                            {/* Name */}
                            <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#0B3C5D]/10 flex items-center justify-center text-xs font-bold text-[#0B3C5D]">
                                  {(u.name||"?").charAt(0).toUpperCase()}
                                </div>
                                {u.name || <span className="text-gray-400">—</span>}
                              </div>
                            </td>
                            {/* Email */}
                            <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{u.email || "—"}</td>
                            {/* Phone */}
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{u.phone || "—"}</td>
                            {/* Plan */}
                            <td className="px-4 py-3"><PlanBadge user={u} /></td>
                            {/* Expires */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {(!u.plan || u.plan==="free") ? <span className="text-gray-300">—</span> : (
                                <span className={active === false ? "text-red-500 font-semibold" : "text-gray-600"}>
                                  {fmtDate(u.expiresAt)}
                                </span>
                              )}
                            </td>
                            {/* Trips */}
                            <td className="px-4 py-3 text-center">
                              <span className={`font-mono font-semibold ${u.tripCount > 0 ? "text-[#0B3C5D]" : "text-gray-300"}`}>
                                {u.tripCount ?? "—"}
                              </span>
                            </td>
                            {/* Joined */}
                            <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">
                              {fmtDate(u.createdAt)}
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                <button
                                  disabled={!!actionLoading}
                                  onClick={() => grantPlan(u.id, "lite", 30)}
                                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                                >
                                  {actionLoading === u.id+"lite" ? "…" : "→Lite 30d"}
                                </button>
                                <button
                                  disabled={!!actionLoading}
                                  onClick={() => grantPlan(u.id, "pro", 365)}
                                  className="rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-100 transition disabled:opacity-50"
                                >
                                  {actionLoading === u.id+"pro" ? "…" : "→Pro 365d"}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ── Expanded detail row ── */}
                          {isExp && (
                            <tr key={u.id + "-detail"} className="bg-blue-50/40">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                  <Detail label="UID" value={u.uid || u.id} mono />
                                  <Detail label="Dream Destination" value={u.dreamDestination} highlight />
                                  <Detail label="Plan Status" value={
                                    !u.plan||u.plan==="free" ? "Free" :
                                    active === true ? "✓ Active" :
                                    active === false ? "⚠ Expired" : "—"
                                  } />
                                  <Detail label="Joined" value={fmtDate(u.createdAt)} />
                                  <Detail label="Full Email" value={u.email} />
                                  <Detail label="Full Phone" value={u.phone} />
                                  <Detail label="Saved Trips" value={`${u.tripCount ?? 0} trips`} />
                                  <Detail label="Role" value={u.role || "user"} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            REDEEM CODES TAB
        ══════════════════════════════════════════════════════════════════ */}
        {tab === "codes" && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["CODE","TYPE","DURATION","STATUS","USED BY","USED AT"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {codes.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">No codes found.</td></tr>
                  )}
                  {codes.sort((a,b) => (a.used?1:0)-(b.used?1:0)).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#0B3C5D]">{c.code || c.id}</td>
                      <td className="px-4 py-3 text-gray-600">{c.type || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.durationDays ? `${c.durationDays}d` : "—"}</td>
                      <td className="px-4 py-3">
                        {c.used
                          ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">Used</span>
                          : c.active
                          ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Active</span>
                          : <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Inactive</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{c.usedBy || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.usedAt ? fmtDate(c.usedAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Small detail cell ─────────────────────────────────────────────────────────
function Detail({ label, value, mono, highlight }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xs break-all ${mono ? "font-mono text-[10px] text-gray-400" : highlight ? "font-semibold text-[#0B3C5D]" : "text-gray-700"}`}>
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  );
}
