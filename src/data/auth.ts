import { supabase } from "../lib/supabaseClient";

export interface Session {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  session?: Session;
}

/**
 * Admin status is never taken from anything the client can influence — it's
 * read fresh from the `profiles` table (set by hand via SQL, see
 * supabase/schema.sql) every time a session is built. Row Level Security on
 * `profiles` only lets a user read their own row, and only the backend API
 * (backend/) can write role-gated changes, so there's no path for a user to
 * self-promote by editing client state.
 */
async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (error || !data) return false;
  return data.role === "admin";
}

export async function sessionFromSupabaseUser(user: {
  id: string;
  email?: string;
}): Promise<Session> {
  return {
    userId: user.id,
    email: user.email ?? "",
    isAdmin: await fetchIsAdmin(user.id),
  };
}

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return sessionFromSupabaseUser(session.user);
}

export async function signUp(emailInput: string, password: string): Promise<AuthResult> {
  const email = emailInput.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  if (!data.user) {
    return { ok: false, error: "Check your inbox to confirm your email, then log in." };
  }

  return { ok: true, session: await sessionFromSupabaseUser(data.user) };
}

export async function logIn(emailInput: string, password: string): Promise<AuthResult> {
  const email = emailInput.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, error: "Incorrect email or password." };
  }

  return { ok: true, session: await sessionFromSupabaseUser(data.user) };
}

export async function logOut(): Promise<void> {
  await supabase.auth.signOut();
}
