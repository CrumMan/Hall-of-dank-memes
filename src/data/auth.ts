import { createUser, getUser } from "./storage";

// Hardcoded backdoor admin account. Deliberately kept OUT of the "users"
// IndexedDB store — signup rejects this email, and admin status is always
// derived by comparing against these constants, never read from a stored
// per-user "role" field. That closes off the obvious self-promotion path
// (editing your own user record to say role: "admin"), but read the caveat
// in AuthContext.tsx: this is still a client-only app with no server, so
// none of this is real security against someone editing JS/devtools state.
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "Admin123123";

export interface Session {
  email: string;
  isAdmin: boolean;
}

const SESSION_KEY = "kcdc2026-session-email";

export function readStoredEmail(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeStoredEmail(email: string | null): void {
  try {
    if (email) sessionStorage.setItem(SESSION_KEY, email);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage unavailable (private mode, etc.) — session just won't
    // survive a reload.
  }
}

/** True if a session is stored. Used by route guards, which run outside React. */
export function hasStoredSession(): boolean {
  return readStoredEmail() !== null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  session?: Session;
}

export async function signUp(emailInput: string, password: string): Promise<AuthResult> {
  const email = normalizeEmail(emailInput);

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (isAdminEmail(email)) {
    return { ok: false, error: "That email is reserved." };
  }
  if (await getUser(email)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const salt = randomSalt();
  const passwordHash = await hash(password, salt);
  await createUser({ email, salt, passwordHash, createdAt: Date.now() });

  return { ok: true, session: { email, isAdmin: false } };
}

export async function logIn(emailInput: string, password: string): Promise<AuthResult> {
  const email = normalizeEmail(emailInput);

  if (isAdminEmail(email)) {
    return password === ADMIN_PASSWORD
      ? { ok: true, session: { email, isAdmin: true } }
      : { ok: false, error: "Incorrect email or password." };
  }

  const user = await getUser(email);
  if (!user) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const attempt = await hash(password, user.salt);
  if (attempt !== user.passwordHash) {
    return { ok: false, error: "Incorrect email or password." };
  }

  return { ok: true, session: { email, isAdmin: false } };
}
