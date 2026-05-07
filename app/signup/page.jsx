"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import { useT } from "@/context/TranslationContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoginHelpCard from "@/components/LoginHelpCard";

export default function SignupPage() {
  const router = useRouter();
  const { t }  = useT();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", dreamDestination: "",
    password: "", confirm: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                   e.name     = t("validationNameRequired");
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email    = t("validationEmailInvalid");
    if (!form.phone.trim())                  e.phone    = t("validationPhoneRequired");
    if (form.password.length < 6)           e.password = t("validationPasswordShort");
    if (form.password !== form.confirm)      e.confirm  = t("validationPasswordMismatch");
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
        name:             form.name.trim(),
        email:            form.email.trim(),
        phone:            form.phone.trim(),
        dreamDestination: form.dreamDestination.trim(),
      });
      document.cookie = "token=true; path=/; SameSite=Lax";
      router.push("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": t("errorEmailInUse"),
        "auth/invalid-email":        t("errorInvalidEmail"),
        "auth/weak-password":        t("errorWeakPassword"),
      };
      setApiError(msgs[err.code] ?? t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center gap-5 px-4 py-10">
      {/* Brand + lang switcher */}
      <div className="flex w-full max-w-md items-center justify-between">
        <div className="text-center flex-1">
          <img src="/logo.png" alt="Backpackervun" className="mx-auto h-9 w-auto" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">{t("appName")}</p>
        </div>
        <div className="flex-shrink-0">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-md rounded-2xl border border-paper-line bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">{t("signUp")}</h1>
        <p className="mt-1 text-xs text-ink-muted">Fill in your details to get started.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
          {/* Name */}
          <F label={t("fullName")} type="text" value={form.name} onChange={set("name")}
            placeholder={t("fullNamePlaceholder")} error={errors.name} autoComplete="name" />

          {/* Email */}
          <F label={t("email")} type="email" value={form.email} onChange={set("email")}
            placeholder={t("emailPlaceholder")} error={errors.email} autoComplete="email" />

          {/* Phone */}
          <F label={t("phoneNumber")} type="tel" value={form.phone} onChange={set("phone")}
            placeholder={t("phonePlaceholder")} error={errors.phone} autoComplete="tel" />

          {/* Dream destination */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">
              {t("dreamDestination")}
              <span className="ml-1 text-[10px] font-medium text-ink-muted/60 normal-case">({t("done") === "完了" ? "任意" : "optional"})</span>
            </label>
            <input
              type="text" value={form.dreamDestination} onChange={set("dreamDestination")}
              placeholder={t("dreamDestinationPlaceholder")}
              className="w-full rounded-lg border border-paper-line bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
            />
            <p className="mt-1 text-[10px] text-ink-muted">{t("dreamDestinationHint")}</p>
          </div>

          {/* Password */}
          <F label={t("password")} type="password" value={form.password} onChange={set("password")}
            placeholder={t("passwordPlaceholder")} error={errors.password} autoComplete="new-password" />

          {/* Confirm */}
          <F label={t("confirmPassword")} type="password" value={form.confirm} onChange={set("confirm")}
            placeholder={t("confirmPasswordPlaceholder")} error={errors.confirm} autoComplete="new-password" />

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">{apiError}</div>
          )}

          <button type="submit" disabled={loading}
            className="mt-1 w-full rounded-lg bg-navy-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(11,60,93,0.28)] transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t("creatingAccount") : t("signUp")}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-muted">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-semibold text-navy-500 hover:underline underline-offset-2">{t("signIn")}</Link>
        </p>
      </div>

      <LoginHelpCard />
      <p className="text-xs text-ink-muted">Backpackervun {t("appName")}</p>
    </div>
  );
}

function F({ label, type, value, onChange, placeholder, error, autoComplete }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required
        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/60 ${
          error ? "border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                : "border-paper-line bg-white hover:border-navy-200 focus:border-accent-300 focus:shadow-[0_0_0_3px_rgba(74,144,226,0.18)]"
        }`} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
