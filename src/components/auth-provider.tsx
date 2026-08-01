"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { firebaseReady, getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import { ensureUserDocuments } from "@/lib/firestore";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      return;
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(
      auth,
      async (nextUser) => {
        setUser(nextUser);
        setLoading(false);

        if (nextUser) {
          try {
            await ensureUserDocuments(nextUser);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not initialize your profile.");
          }
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  const signIn = useCallback(async () => {
    setError(null);

    try {
      // onAuthStateChanged fires after the popup resolves and runs
      // ensureUserDocuments there, so it is not repeated here.
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);

    try {
      await signOut(getFirebaseAuth());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed.");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      configured: firebaseReady,
      signIn,
      signOutUser,
      clearError
    }),
    [clearError, error, loading, signIn, signOutUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
