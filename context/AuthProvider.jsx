"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

/**
 * Provides `user`, `loading`, and `logout` to every component inside it.
 * Also syncs a simple `token` cookie so Next.js middleware can protect
 * routes without a server-side session.
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoading(false);

      // Keep cookie in sync so middleware can read it on the edge
      if (firebaseUser) {
        document.cookie = "token=true; path=/; SameSite=Lax";
      } else {
        document.cookie = "token=; Max-Age=0; path=/";
      }
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
