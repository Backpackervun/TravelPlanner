"use client";

/**
 * context/TranslationContext.jsx
 *
 * Real global translation system. Wrap the entire app with <TranslationProvider>.
 * Any component calls useT() to get the t(key) function.
 *
 * The dictionary is loaded lazily per locale so the bundle stays small.
 * Falls back to English for missing keys.
 */

import {
  createContext, useCallback, useContext, useEffect, useState,
} from "react";

const TranslationContext = createContext(null);

const STORAGE_KEY   = "bpv-lang";
export const LANGS  = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "ja", label: "日本語",     flag: "🇯🇵" },
  { code: "ko", label: "한국어",      flag: "🇰🇷" },
  { code: "zh", label: "中文",       flag: "🇨🇳" },
];

// Inline all dictionaries so dynamic import isn't required.
// This ensures SSR safety and avoids module resolution issues.
const DICTS = {
  en: () => import("@/locales/en"),
  id: () => import("@/locales/id"),
  ja: () => import("@/locales/ja"),
  ko: () => import("@/locales/ko"),
  zh: () => import("@/locales/zh"),
};

export function TranslationProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [dict, setDict]      = useState({});
  const [enDict, setEnDict]  = useState({});

  // Load English as fallback first
  useEffect(() => {
    DICTS.en().then((m) => setEnDict(m.default ?? m));
  }, []);

  // Load selected language
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? (localStorage.getItem(STORAGE_KEY) ?? "en")
      : "en";
    setLangState(stored);
  }, []);

  useEffect(() => {
    const loader = DICTS[lang] ?? DICTS.en;
    loader().then((m) => setDict(m.default ?? m));
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, code);
  }, []);

  /**
   * t(key, vars?) — translate a key.
   * vars is an object for interpolation: t("greeting", { name: "Ervan" })
   * Dictionary entry: "greeting": "Hello, {name}!"
   */
  const t = useCallback((key, vars) => {
    let str = dict[key] ?? enDict[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return str;
  }, [dict, enDict]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, t, langs: LANGS }}>
      {children}
    </TranslationContext.Provider>
  );
}

/** useT() — returns { t, lang, setLang, langs } */
export function useT() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useT must be used inside <TranslationProvider>");
  return ctx;
}
