"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, ensureUserDoc } from "@/lib/firestore";
import { resolveActivePlan } from "@/lib/plans";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activePlan,  setActivePlan]  = useState("FREE");
  const [loading,     setLoading]     = useState(true);

  // ── Internal: load profile & resolve plan ─────────────────────────────────
  // Called on login AND after redeem to keep plan state fresh.

  async function loadProfile(uid, email) {
    try {
      // Ensure user doc exists in Firestore (creates FREE plan + 7d expiry for new users)
      await ensureUserDoc(uid, email);

      const profile = await getUserProfile(uid);

      const safeProfile = profile || {
        uid,
        name:  "",
        email: email || "",
        role:  "user",
        plan:  "FREE",
      };

      setUserProfile(safeProfile);

      // resolveActivePlan() normalizes "pro" → "PRO" and checks expiry
      setActivePlan(resolveActivePlan(safeProfile));

      return safeProfile;
    } catch (err) {
      console.error("[AuthProvider] loadProfile error:", err);
      setUserProfile(null);
      setActivePlan("FREE");
    }
  }

  // ── Auth state listener ───────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          document.cookie = "token=true; path=/; SameSite=Lax";
          setUser(firebaseUser);
          await loadProfile(firebaseUser.uid, firebaseUser.email);
        } else {
          document.cookie = "token=; Max-Age=0; path=/";
          setUser(null);
          setUserProfile(null);
          setActivePlan("FREE");
        }
      } catch (err) {
        console.error("[AuthProvider] onAuthStateChanged error:", err);
        setUserProfile(null);
        setActivePlan("FREE");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ── refreshPlan — call after redeemCode() ─────────────────────────────────
  // Re-fetches Firestore and updates activePlan → all components re-render.

  const refreshPlan = async () => {
    if (!user) return;
    await loadProfile(user.uid, user.email);
  };

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = async () => {
    await signOut(auth);
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      activePlan,
      loading,
      logout,
      refreshPlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
