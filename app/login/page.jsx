"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoginHelpCard from "@/components/LoginHelpCard";

export default function LoginPage() {
  const router = useRouter();
  const { t }  = useT();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.cookie = "token=true; path=/; SameSite=Lax";
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/user-not-found":     t("errorUserNotFound"),
        "auth/wrong-password":     t("errorWrongPassword"),
        "auth/invalid-email":      t("errorInvalidEmail"),
        "auth/too-many-requests":  t("errorTooManyRequests"),
        "auth/invalid-credential": t("errorInvalidCredential"),
      };
      setError(msgs[err.code] ?? t("errorGeneric"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center gap-5 px-4 py-10">
      {/* Brand + lang switcher */}
      <div className="flex w-full max-w-sm items-center justify-between">
        <div className="text-center flex-1">
          <img src="/logo.png" alt="Backpackervun" className="mx-auto h-9 w-auto" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">{t("appName")}</p>
        </div>
        <div className="flex-shrink-0">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm rounded-2xl border border-paper-line bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">{t("signIn")}</h1>
        <p className="mt-1 text-xs text-ink-muted">Enter your credentials to access the planner.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">{t("email")}</label>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("password")}</label>
              <Link href="/forgot-password" className="text-[11px] font-medium text-navy-500 hover:underline underline-offset-2">
                {t("forgotPassword")}
              </Link>
            </div>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]" />
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{error}</div>}

          <button type="submit" disabled={loading}
            className="mt-2 w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          {t("dontHaveAccount")}{" "}
          <Link href="/signup" className="font-semibold text-navy-500 hover:underline underline-offset-2">{t("createAccountLink")}</Link>
        </p>
      </div>

      <LoginHelpCard />
      <p className="text-xs text-ink-muted">Backpackervun {t("appName")}</p>
    </div>
  );
}
