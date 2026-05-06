"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import LoginHelpCard from "@/components/LoginHelpCard";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                   e.name     = "Full name is required.";
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email    = "Enter a valid email address.";
    if (!form.phone.trim())                  e.phone    = "Phone number is required.";
    if (form.password.length < 6)           e.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirm)      e.confirm  = "Passwords do not match.";
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
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(cred.user, { displayName: form.name.trim() });
      await createUserProfile(cred.user.uid, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      });
      document.cookie = "token=true; path=/; SameSite=Lax";
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email":        "Please enter a valid email address.",
        "auth/weak-password":        "Password is too weak. Use at least 6 characters.",
      };
      setApiError(msgs[err.code] ?? `Sign up failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center gap-5 px-4 py-10">
      {/* Brand */}
      <div className="text-center">
        <img src="/logo.png" alt="Backpackervun" className="mx-auto h-9 w-auto" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Travel Planner</p>
      </div>

      {/* Signup card */}
      <div className="w-full max-w-md rounded-2xl border border-paper-line bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">Create account</h1>
        <p className="mt-1 text-xs text-ink-muted">Fill in your details to get started.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {[
            { key: "name",     label: "Full Name",       type: "text",     placeholder: "e.g. Ervan Santoso",       auto: "name" },
            { key: "email",    label: "Email",           type: "email",    placeholder: "you@example.com",          auto: "email" },
            { key: "phone",    label: "Phone Number",    type: "tel",      placeholder: "+62 812 3456 7890",        auto: "tel" },
            { key: "password", label: "Password",        type: "password", placeholder: "At least 6 characters",   auto: "new-password" },
            { key: "confirm",  label: "Confirm Password",type: "password", placeholder: "Repeat your password",    auto: "new-password" },
          ].map(({ key, label, type, placeholder, auto }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">{label}</label>
              <input
                type={type} value={form[key]} onChange={set(key)}
                placeholder={placeholder} autoComplete={auto} required
                className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 ${
                  errors[key]
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                    : "border-paper-line bg-white hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
                }`}
              />
              {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
            </div>
          ))}

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{apiError}</div>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-2 w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-navy-500 hover:underline underline-offset-2">Sign in</Link>
        </p>
      </div>

      {/* Help card */}
      <LoginHelpCard />

      <p className="text-xs text-ink-muted">Backpackervun Travel Planner</p>
    </div>
  );
}
