import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import * as auth from "./auth";
import type { Session } from "./auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<auth.AuthResult>;
  signUp: (email: string, password: string) => Promise<auth.AuthResult>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    auth.getSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    });

    // Keeps the session (and admin role) in sync across tabs, token
    // refreshes, and sign-in/out triggered elsewhere.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession?.user) {
        setSession(null);
        return;
      }
      auth.sessionFromSupabaseUser(newSession.user).then((s) => {
        if (!cancelled) setSession(s);
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      async logIn(email, password) {
        const result = await auth.logIn(email, password);
        if (result.ok && result.session) setSession(result.session);
        return result;
      },
      async signUp(email, password) {
        const result = await auth.signUp(email, password);
        if (result.ok && result.session) setSession(result.session);
        return result;
      },
      async logOut() {
        await auth.logOut();
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
