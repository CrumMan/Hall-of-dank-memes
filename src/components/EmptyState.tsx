import { Link } from "@tanstack/react-router";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="text-6xl">🏆</div>
      <h2 className="text-2xl font-semibold text-amber-800 dark:text-amber-100">No memes yet</h2>
      <p className="max-w-sm text-neutral-600 dark:text-neutral-400">
        The Hall of Fame is empty. Add the first legendary meme to get things started.
      </p>
      <Link
        to="/add"
        className="mt-2 rounded-full bg-amber-500 px-6 py-2 font-semibold text-neutral-950 shadow transition hover:bg-amber-400"
      >
        Add your first meme
      </Link>
    </div>
  );
}
