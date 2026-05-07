"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import enDict from "@/locales/en";

export const LANGS = [
  { code:"en", label:"English",   flag:"🇬🇧" },
  { code:"id", label:"Indonesia", flag:"🇮🇩" },
  { code:"ja", label:"日本語",     flag:"🇯🇵" },
  { code:"ko", label:"한국어",      flag:"🇰🇷" },
  { code:"zh", label:"中文",       flag:"🇨🇳" },
];

const LS_KEY = "bpv-lang";
const Ctx    = createContext(null);

export function TranslationProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [dict, setDict]      = useState(enDict); // English is synchronous — no flash

  // Restore saved language
  useEffect(() => {
    const s = localStorage.getItem(LS_KEY) ?? "en";
    if (s !== "en") setLangState(s);
  }, []);

  // Load dictionary on language change
  useEffect(() => {
    if (lang === "en") { setDict(enDict); return; }
    const loaders = {
      id: () => import("@/locales/id"),
      ja: () => import("@/locales/ja"),
      ko: () => import("@/locales/ko"),
      zh: () => import("@/locales/zh"),
    };
    loaders[lang]?.().then((m) => setDict(m.default ?? m)).catch(() => setDict(enDict));
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    localStorage.setItem(LS_KEY, code);
  }, []);

  const t = useCallback((key, vars) => {
    let s = dict[key] ?? enDict[key] ?? key;
    if (vars) Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
    return s;
  }, [dict]);

  return <Ctx.Provider value={{ lang, setLang, t, langs: LANGS }}>{children}</Ctx.Provider>;
}

export function useT() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useT must be inside <TranslationProvider>");
  return c;
}
