import { useMemo, useState } from "react";
import { useAuth } from "../data/AuthContext";
import { useMemes } from "../data/useMemes";
import { HallOfFameBanner } from "../components/HallOfFameBanner";
import { TopThreePodium } from "../components/TopThreePodium";
import { Gallery } from "../components/Gallery";
import { EmptyState } from "../components/EmptyState";
import { SortableGridProvider } from "../components/SortableMemeGrid";
import { PendingSubmissions } from "../components/PendingSubmissions";
import { MemeCard } from "../components/MemeCard";

export function HallOfFameRoute() {
  const { session } = useAuth();
  const { approved, pending, loading, reorder, approve, remove } = useMemes();
  const [reordering, setReordering] = useState(false);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const searching = query.length > 0;

  const searchResults = useMemo(() => {
    if (!searching) return [];
    return approved.filter(
      (meme) =>
        meme.title.toLowerCase().includes(query) ||
        (meme.categories ?? []).some((cat) => cat.toLowerCase().includes(query)),
    );
  }, [approved, query, searching]);

  const top3 = approved.slice(0, 3);
  const rest = approved.slice(3);
  const allIds = approved.map((m) => m.id);

  const body = (
    <>
      <TopThreePodium memes={top3} reordering={reordering} />
      <Gallery memes={rest} rankOffset={3} reordering={reordering} />
    </>
  );

  return (
    <div>
      <HallOfFameBanner />

      {!loading && approved.length > 0 && (
        <div className="mx-auto mt-6 max-w-md px-4">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setReordering(false);
            }}
            placeholder="Search memes by title or category…"
            className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-amber-50 dark:focus:border-amber-400"
          />
        </div>
      )}

      {session && session.isAdmin && pending.length > 0 && (
        <PendingSubmissions memes={pending} onApprove={approve} onReject={remove} />
      )}

      {!loading && !searching && session && approved.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setReordering((r) => !r)}
            className={
              reordering
                ? "rounded-full bg-emerald-500 px-5 py-1.5 text-sm font-semibold text-neutral-950 shadow"
                : "rounded-full border border-amber-600 px-5 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-500/10 dark:border-amber-500 dark:text-amber-300"
            }
          >
            {reordering ? "Done reordering" : "Reorder"}
          </button>
        </div>
      )}

      {!loading && approved.length === 0 && <EmptyState />}

      {!loading && searching && (
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 px-4 pb-16 sm:grid-cols-3 lg:grid-cols-4">
          {searchResults.map((meme) => (
            <MemeCard
              key={meme.id}
              meme={meme}
              rank={approved.findIndex((a) => a.id === meme.id)}
            />
          ))}
        </div>
      )}

      {!loading && searching && searchResults.length === 0 && (
        <p className="mt-10 text-center text-neutral-600 dark:text-neutral-400">
          No memes match "{search}".
        </p>
      )}

      {!loading && !searching && approved.length > 0 && reordering && (
        <SortableGridProvider ids={allIds} onReorder={reorder}>
          {body}
        </SortableGridProvider>
      )}

      {!loading && !searching && approved.length > 0 && !reordering && body}
    </div>
  );
}
