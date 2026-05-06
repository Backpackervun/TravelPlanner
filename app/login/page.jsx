"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Cookie is set by AuthProvider via onAuthStateChanged;
      // but we set it here too for immediate middleware access.
      document.cookie = "token=true; path=/; SameSite=Lax";
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/user-not-found":  "No account found with this email.",
        "auth/wrong-password":  "Incorrect password.",
        "auth/invalid-email":   "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/invalid-credential": "Email or password is incorrect.",
      };
      setError(msgs[err.code] ?? "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <div className="mb-8 text-center">
        <img
          src="/logo.png"
          alt="Backpackervun"
          className="mx-auto h-9 w-auto"
        />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Travel Planner
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Enter your credentials to access the planner.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

        </form>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Backpackervun Travel Planner · Internal tool
      </p>
    </div>
  );
}
