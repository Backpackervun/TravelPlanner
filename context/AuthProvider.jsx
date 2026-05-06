"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { resolveActivePlan } from "@/lib/plans";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activePlan, setActivePlan]   = useState("FREE");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        document.cookie = "token=true; path=/; SameSite=Lax";
        setUser(firebaseUser);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile ?? { name: firebaseUser.displayName ?? "", email: firebaseUser.email ?? "" });
          setActivePlan(resolveActivePlan(profile));
        } catch {
          setUserProfile({ name: firebaseUser.displayName ?? "", email: firebaseUser.email ?? "" });
          setActivePlan("FREE");
        }
      } else {
        document.cookie = "token=; Max-Age=0; path=/";
        setUser(null);
        setUserProfile(null);
        setActivePlan("FREE");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /** Refresh plan after redeem or external upgrade */
  const refreshPlan = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      setActivePlan(resolveActivePlan(profile));
    } catch { /* ignore */ }
  };

  const logout = async () => {
    await signOut(auth);
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, activePlan, loading, logout, refreshPlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
