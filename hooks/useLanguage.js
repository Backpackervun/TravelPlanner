"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { updateUserLanguage } from "@/lib/firestore";

const STORAGE_KEY = "bpv-lang";
export const SUPPORTED_LANGS = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "id", label: "Indonesia",  flag: "🇮🇩" },
  { code: "zh", label: "中文",        flag: "🇨🇳" },
  { code: "ko", label: "한국어",       flag: "🇰🇷" },
  { code: "ja", label: "日本語",       flag: "🇯🇵" },
];

/**
 * useLanguage — returns { lang, setLang, t }
 *
 * t(key) — returns translated string.
 * Falls back to English if key not found in current lang.
 */
export function useLanguage() {
  const { user, userProfile } = useAuth();
  const [lang, setLangState]  = useState("en");
  const [dict, setDict]       = useState(null);

  // Load language — priority: Firestore profile → localStorage → "en"
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = userProfile?.language ?? stored ?? "en";
    setLangState(initial);
  }, [userProfile?.language]);

  // Load translation dictionary
  useEffect(() => {
    import(`@/locales/${lang}.js`)
      .then((m) => setDict(m.default ?? m))
      .catch(() => import("@/locales/en.js").then((m) => setDict(m.default ?? m)));
  }, [lang]);

  const setLang = useCallback(async (code) => {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    if (user) {
      try { await updateUserLanguage(user.uid, code); } catch { /* offline */ }
    }
  }, [user]);

  const t = useCallback((key) => {
    if (!dict) return key;
    return dict[key] ?? key;
  }, [dict]);

  return { lang, setLang, t, langs: SUPPORTED_LANGS };
}
