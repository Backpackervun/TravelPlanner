"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState("idle"); // idle|loading|sent|error
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus("sent");
    } catch (err) {
      const msgs = {
        "auth/user-not-found":  "No account found with this email address.",
        "auth/invalid-email":   "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment.",
      };
      setError(msgs[err.code] ?? "Something went wrong. Try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center px-4 py-10">
      {/* Brand */}
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Backpackervun" className="mx-auto h-9 w-auto" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Travel Planner</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card">

        {/* SUCCESS STATE */}
        {status === "sent" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ink">Check your email</h2>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              We sent a password reset link to <span className="font-semibold text-ink">{email}</span>. Check your inbox and follow the instructions.
            </p>
            <p className="mt-4 text-xs text-ink-muted">Didn't receive it? Check your spam folder or resend below.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-xs font-semibold text-navy-500 hover:underline underline-offset-2"
            >
              Resend email
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-ink">Reset password</h1>
            <p className="mt-1 text-sm text-ink-muted">Enter your account email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email"
                  className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Send reset email"}
              </button>
            </form>
          </>
        )}

        <div className="mt-5 text-center">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-navy-500 hover:underline underline-offset-2">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
