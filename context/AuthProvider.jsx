"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import {
  getUserProfile,
} from "@/lib/firestore";

import {
  resolveActivePlan,
} from "@/lib/plans";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [
    userProfile,
    setUserProfile,
  ] = useState(null);

  const [
    activePlan,
    setActivePlan,
  ] = useState("FREE");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsub =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {

          try {

            if (firebaseUser) {

              document.cookie =
                "token=true; path=/; SameSite=Lax";

              setUser(firebaseUser);

              const profile =
                await getUserProfile(
                  firebaseUser.uid
                );

              const safeProfile =
                profile || {
                  uid:
                    firebaseUser.uid,
                  name:
                    firebaseUser.displayName ||
                    "",
                  email:
                    firebaseUser.email ||
                    "",
                  role: "user",
                  plan: "FREE",
                };

              setUserProfile(
                safeProfile
              );

              setActivePlan(
                resolveActivePlan(
                  safeProfile
                )
              );

            } else {

              document.cookie =
                "token=; Max-Age=0; path=/";

              setUser(null);

              setUserProfile(
                null
              );

              setActivePlan(
                "FREE"
              );

            }

          } catch (err) {

            console.error(
              "AuthProvider error:",
              err
            );

            setUserProfile(
              null
            );

            setActivePlan(
              "FREE"
            );

          } finally {

            setLoading(false);

          }

        }
      );

    return () => unsub();

  }, []);

  // Refresh user profile manually
  const refreshPlan =
    async () => {

      if (!user) return;

      try {

        const profile =
          await getUserProfile(
            user.uid
          );

        if (profile) {

          setUserProfile(
            profile
          );

          setActivePlan(
            resolveActivePlan(
              profile
            )
          );

        }

      } catch (err) {

        console.error(
          "Refresh plan error:",
          err
        );

      }

    };

  const logout =
    async () => {

      await signOut(auth);

      document.cookie =
        "token=; Max-Age=0; path=/";

      window.location.href =
        "/login";

    };

  return (

    <AuthContext.Provider
      value={{
        user,
        userProfile,
        activePlan,
        loading,
        logout,
        refreshPlan,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  const ctx =
    useContext(AuthContext);

  if (!ctx) {

    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    );

  }

  return ctx;

}