import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../data/AuthContext";
import { useTheme } from "../data/ThemeContext";

export function RootLayout() {
  const { session, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogOut() {
    logOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-svh bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <Link to="/" className="text-lg font-bold text-amber-700 dark:text-amber-300">
          🏆 Meme Hall of Fame
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {session ? (
            <>
              <Link
                to="/add"
                className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950 shadow transition hover:bg-amber-400"
              >
                Add Meme
              </Link>
              <span className="hidden text-sm text-neutral-500 sm:inline dark:text-neutral-400">
                {session.email}
                {session.isAdmin && (
                  <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/40 dark:text-emerald-300">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogOut}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950 shadow transition hover:bg-amber-400"
            >
              Log in
            </Link>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
