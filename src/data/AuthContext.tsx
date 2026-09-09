import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import * as auth from "./auth";
import type { Session } from "./auth";

// We only ever persist the email, never an "isAdmin" flag. isAdmin is always
// re-derived by comparing the email against the hardcoded admin address, so
// there's nothing here that can be self-promoted by editing stored data —
// only by logging in with the actual admin credentials.
//
// CAVEAT: this is still a client-only app with no server. Anyone can open
// devtools and rewrite this session, the auth module, or the sessionStorage
// value directly. This gate is a UI convenience for a small personal
// project, not real access control — never rely on it to protect anything
// sensitive or to gate a real multi-user deployment.
function toSession(email: string | null): Session | null {
  if (!email) return null;
  return { email, isAdmin: auth.isAdminEmail(email) };
}

interface AuthContextValue {
  session: Session | null;
  logIn: (email: string, password: string) => Promise<auth.AuthResult>;
  signUp: (email: string, password: string) => Promise<auth.AuthResult>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => auth.readStoredEmail());

  function persist(newEmail: string | null) {
    setEmail(newEmail);
    auth.writeStoredEmail(newEmail);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session: toSession(email),
      async logIn(rawEmail, password) {
        const result = await auth.logIn(rawEmail, password);
        if (result.ok && result.session) persist(result.session.email);
        return result;
      },
      async signUp(rawEmail, password) {
        const result = await auth.signUp(rawEmail, password);
        if (result.ok && result.session) persist(result.session.email);
        return result;
      },
      logOut() {
        persist(null);
      },
    }),
    [email],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
