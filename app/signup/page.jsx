"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())                     e.name     = "Full name is required.";
    if (!form.email.match(/^\S+@\S+\.\S+$/))   e.email    = "Enter a valid email address.";
    if (!form.phone.trim())                    e.phone    = "Phone number is required.";
    if (form.password.length < 6)             e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirm)        e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError("");
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      // 1. Create Firebase auth user
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      const { user } = cred;

      // 2. Set displayName so it's available in auth without Firestore
      await updateProfile(user, { displayName: form.name.trim() });

      // 3. Persist full profile in Firestore users/{uid}
      await createUserProfile(user.uid, {
        name:  form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      // 4. Set session cookie (middleware picks this up)
      document.cookie = "token=true; path=/; SameSite=Lax";

      // 5. Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password is too weak. Use at least 6 characters.",
        "auth/operation-not-allowed":"Email sign-up is not enabled. Contact support.",
      };
      setApiError(msgs[err.code] ?? `Sign up failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center px-4 py-10">
      {/* Brand */}
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Backpackervun" className="mx-auto h-9 w-auto" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          Travel Planner
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-paper-line bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">Create account</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Fill in your details to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>

          {/* Full Name */}
          <Field
            label="Full Name"
            type="text"
            placeholder="e.g. Ervan Santoso"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            autoComplete="name"
          />

          {/* Email */}
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
          />

          {/* Phone */}
          <Field
            label="Phone Number"
            type="tel"
            placeholder="+62 812 3456 7890"
            value={form.phone}
            onChange={set("phone")}
            error={errors.phone}
            autoComplete="tel"
          />

          {/* Password */}
          <Field
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <Field
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
          />

          {/* API error */}
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-navy-500 hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-muted">Backpackervun Travel Planner</p>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, error, autoComplete }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
            : "border-paper-line bg-white hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
