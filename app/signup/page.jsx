"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { grantFreeTrial } from "@/lib/firestore";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useT();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [dreamDest,       setDreamDest]       = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    if (!name.trim())                return t("validationNameRequired");
    if (!/\S+@\S+\.\S+/.test(email)) return t("validationEmailInvalid");
    if (!phone.trim())               return t("validationPhoneRequired");
    if (password.length < 6)         return t("validationPasswordShort");
    if (password !== confirmPassword) return t("validationPasswordMismatch");
    return null;
  }

  // ── Firebase error map ──────────────────────────────────────────────────────
  function mapFirebaseError(code) {
    switch (code) {
      case "auth/email-already-in-use":  return t("errorEmailInUse");
      case "auth/invalid-email":         return t("errorInvalidEmail");
      case "auth/weak-password":         return t("errorWeakPassword");
      default:                           return t("errorGeneric");
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSignup(e) {
    e?.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const { uid } = cred.user;

      // 2. Set display name
      await updateProfile(cred.user, { displayName: name.trim() });

      // 3. Create user profile in Firestore + grant 7-day free trial
      //    grantFreeTrial() also calls ensureUserDoc() internally
      await grantFreeTrial(uid, email.trim());

      // 4. Update additional profile fields (phone, dream destination)
      //    Import setDoc/doc dynamically to avoid circular imports
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await setDoc(doc(db, "users", uid), {
        name:             name.trim(),
        email:            email.trim(),
        phone:            phone.trim(),
        dreamDestination: dreamDest.trim(),
      }, { merge: true });

      // 5. Redirect to dashboard
      router.replace("/dashboard");

    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Backpackervun" className="h-7 w-auto" />
          <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 border-l border-gray-200 pl-2.5">
            Travel Planner
          </span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Form */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Trial banner */}
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🎁</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Free 7-day trial — no credit card needed
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Create your account and get instant access to the full Lite planner for 7 days.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-gray-900">{t("signUp")}</h1>
              <p className="mt-1 text-sm text-gray-500">{t("signupSubtitle")}</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                  autoComplete="email"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("phoneNumber")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(""); }}
                  placeholder={t("phonePlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                  autoComplete="tel"
                />
              </div>

              {/* Dream destination (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("dreamDestination")}
                  <span className="ml-1.5 text-[10px] font-normal normal-case text-gray-400">({t("optional")})</span>
                </label>
                <input
                  type="text"
                  value={dreamDest}
                  onChange={e => setDreamDest(e.target.value)}
                  placeholder={t("dreamDestinationPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                />
                <p className="mt-1 text-[11px] text-gray-400">{t("dreamDestinationHint")}</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-[0.12em] mb-1.5">
                  {t("confirmPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder={t("confirmPasswordPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0B3C5D] focus:bg-white focus:ring-1 focus:ring-[#0B3C5D]"
                  autoComplete="new-password"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0B3C5D] py-3.5 text-sm font-semibold text-white shadow transition hover:bg-[#0a3354] active:scale-[0.98] disabled:opacity-60 mt-2"
              >
                {loading ? t("creatingAccount") : `${t("signUp")} — Start Free Trial 🎁`}
              </button>
            </form>

            {/* Trial info */}
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[11px] text-gray-500 text-center">
                By creating an account, you get a <strong className="text-gray-700">7-day free trial</strong> with
                access to Lite plan features. No credit card required.
              </p>
            </div>

            {/* Already have account */}
            <p className="mt-5 text-center text-sm text-gray-500">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-semibold text-[#0B3C5D] hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
