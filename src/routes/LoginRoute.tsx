import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../data/AuthContext";

const inputClasses =
  "rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-amber-50 dark:focus:border-amber-400";

export function LoginRoute() {
  const { logIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "login" ? await logIn(email, password) : await signUp(email, password);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      navigate({ to: "/" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-16">
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-12 flex max-w-sm flex-col gap-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-0"
      >
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={
              mode === "login"
                ? "rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold text-neutral-950"
                : "rounded-full px-4 py-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400"
            }
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={
              mode === "signup"
                ? "rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold text-neutral-950"
                : "rounded-full px-4 py-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400"
            }
          >
            Sign up
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 6 characters" : ""}
            className={inputClasses}
          />
        </label>

        {mode === "signup" && (
          <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
            />
          </label>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber-500 px-6 py-2 font-semibold text-neutral-950 shadow transition hover:bg-amber-400 disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
