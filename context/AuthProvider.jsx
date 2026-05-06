"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(null); // { name, email, phone }
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync cookie for middleware
        document.cookie = "token=true; path=/; SameSite=Lax";
        setUser(firebaseUser);
        // Fetch Firestore profile for name/phone
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile ?? { name: firebaseUser.displayName ?? "", email: firebaseUser.email ?? "" });
        } catch {
          // If Firestore is unreachable, fall back to auth displayName
          setUserProfile({ name: firebaseUser.displayName ?? "", email: firebaseUser.email ?? "" });
        }
      } else {
        document.cookie = "token=; Max-Age=0; path=/";
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = async () => {
    await signOut(auth);
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
