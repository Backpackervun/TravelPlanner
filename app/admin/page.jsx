"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import {
  adminGetStats, adminGetAllUsers, adminGetAllCodes,
  generateCodes, adminUpdateUser,
} from "@/lib/firestore";
import { planLabel, planBadgeClass } from "@/lib/plans";

export default function AdminPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const [tab, setTab]         = useState("dashboard");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [codes, setCodes]     = useState([]);
  const [busy, setBusy]       = useState(false);
  const [genForm, setGenForm] = useState({ type: "LITE", durationDays: 30, quantity: 5 });
  const [genResult, setGenResult] = useState([]);

  // Auth + role guard
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (userProfile && userProfile.role !== "admin") { router.replace("/dashboard"); }
  }, [loading, user, userProfile, router]);

  // Load data
  useEffect(() => {
    if (!userProfile || userProfile.role !== "admin") return;
    adminGetStats().then(setStats);
  }, [userProfile]);

  useEffect(() => {
    if (tab === "users" && users.length === 0) adminGetAllUsers().then(setUsers);
    if (tab === "codes" && codes.length === 0) adminGetAllCodes().then(setCodes);
  }, [tab]);

  const handleGenerate = async () => {
    setBusy(true);
    setGenResult([]);
    try {
      const created = await generateCodes(genForm);
      setGenResult(created);
      adminGetAllCodes().then(setCodes); // refresh
    } finally { setBusy(false); }
  };

  const handleUpgradeUser = async (uid, plan, days) => {
    await adminUpdateUser(uid, { plan, durationDays: days });
    adminGetAllUsers().then(setUsers);
  };

  if (loading || !userProfile) {
    return <div className="min-h-screen paper-bg flex items-center justify-center text-sm text-ink-muted">Loading admin…</div>;
  }
  if (userProfile.role !== "admin") return null;

  const TAB_CLS = (t) =>
    `px-4 py-2.5 text-sm font-semibold rounded-lg transition ${tab === t ? "bg-navy-500 text-white" : "text-ink-soft hover:bg-paper-dim"}`;

  return (
    <div className="min-h-screen paper-bg">
      <header className="sticky top-0 z-20 border-b border-paper-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto" />
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">ADMIN</span>
          </div>
          <a href="/dashboard" className="text-xs text-navy-500 hover:underline underline-offset-2">← Dashboard</a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Tab nav */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {[["dashboard","📊 Dashboard"],["users","👥 Users"],["codes","🎟️ Redeem Codes"],["generate","⚡ Generate Codes"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={TAB_CLS(t)}>{l}</button>
          ))}
        </div>

        {/* ── DASHBOARD STATS ── */}
        {tab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-semibold text-ink mb-6">Overview</h1>
            {stats ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                  { label: "Total Users",   value: stats.totalUsers,   color: "bg-navy-50 text-navy-500" },
                  { label: "Lite Users",    value: stats.liteUsers,    color: "bg-blue-50 text-blue-600" },
                  { label: "Pro Users",     value: stats.proUsers,     color: "bg-violet-50 text-violet-600" },
                  { label: "Expired",       value: stats.expiredUsers, color: "bg-amber-50 text-amber-600" },
                  { label: "Redeem Codes",  value: stats.totalCodes,   color: "bg-emerald-50 text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-paper-line bg-white p-5 shadow-soft text-center">
                    <p className={`text-4xl font-bold ${s.color} rounded-xl py-2`}>{s.value}</p>
                    <p className="mt-2 text-xs text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Loading stats…</p>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <h1 className="text-2xl font-semibold text-ink mb-6">Users ({users.length})</h1>
            <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-paper-dim border-b border-paper-line">
                    <tr>{["Name","Email","Phone","Plan","Expires","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-paper-line">
                    {users.map((u) => {
                      const exp = u.expiresAt ? new Date(u.expiresAt).toLocaleDateString("en-US", {day:"numeric",month:"short",year:"2-digit"}) : "—";
                      return (
                        <tr key={u.id} className="hover:bg-paper-dim/50">
                          <td className="px-4 py-3 font-medium text-ink">{u.name || "—"}</td>
                          <td className="px-4 py-3 text-ink-soft truncate max-w-[180px]">{u.email}</td>
                          <td className="px-4 py-3 text-ink-soft">{u.phone || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${planBadgeClass(u.plan ?? "FREE")}`}>
                              {planLabel(u.plan ?? "FREE")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-ink-muted">{exp}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <AdminBtn label="→Lite 30d" onClick={() => handleUpgradeUser(u.id, "LITE", 30)} />
                              <AdminBtn label="→Pro 365d" onClick={() => handleUpgradeUser(u.id, "PRO", 365)} color="violet" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REDEEM CODES ── */}
        {tab === "codes" && (
          <div>
            <h1 className="text-2xl font-semibold text-ink mb-6">Redeem Codes ({codes.length})</h1>
            <div className="rounded-2xl border border-paper-line bg-white shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-paper-dim border-b border-paper-line">
                    <tr>{["Code","Type","Duration","Used?","Used By","Expires"].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-paper-line">
                    {codes.map((c) => (
                      <tr key={c.id} className={`hover:bg-paper-dim/50 ${c.used ? "opacity-60" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">{c.code}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${planBadgeClass(c.type === "PRO" ? "PRO" : "LITE")}`}>{c.type}</span></td>
                        <td className="px-4 py-3 text-ink-soft">{c.durationDays}d</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.used ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-700"}`}>
                            {c.used ? "Used" : "Available"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-muted truncate max-w-[120px]">{c.usedBy ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-ink-muted">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── GENERATE CODES ── */}
        {tab === "generate" && (
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold text-ink mb-6">Generate Codes</h1>
            <div className="rounded-2xl border border-paper-line bg-white p-6 shadow-soft space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">Plan Type</label>
                <select value={genForm.type} onChange={(e) => setGenForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-paper-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300">
                  <option value="TRIAL">Trial (3 days Lite)</option>
                  <option value="LITE">Lite</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">Duration (days)</label>
                <input type="number" min={1} value={genForm.durationDays}
                  onChange={(e) => setGenForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-paper-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">Quantity</label>
                <input type="number" min={1} max={50} value={genForm.quantity}
                  onChange={(e) => setGenForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-paper-line px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-300" />
              </div>
              <button onClick={handleGenerate} disabled={busy}
                className="w-full rounded-xl bg-navy-500 py-3 text-sm font-semibold text-white shadow hover:bg-navy-600 disabled:opacity-60">
                {busy ? "Generating…" : `Generate ${genForm.quantity} codes`}
              </button>

              {genResult.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-2">Generated codes:</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {genResult.map((c) => (
                      <div key={c} className="font-mono text-xs text-ink bg-white rounded px-2 py-1 border border-emerald-100">{c}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminBtn({ label, onClick, color = "blue" }) {
  const cls = color === "violet"
    ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
    : "bg-blue-50 text-blue-700 hover:bg-blue-100";
  return (
    <button onClick={onClick} className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${cls}`}>{label}</button>
  );
}
