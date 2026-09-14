import { useCallback, useEffect, useState } from "react";
import * as memesApi from "./memes";
import type { Meme, MemeInput } from "./types";

export function useMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const all = await memesApi.getAllMemes();
    setMemes(all);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all = await memesApi.getAllMemes();
      if (!cancelled) {
        setMemes(all);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const approved = memes.filter((m) => m.status === "approved").sort((a, b) => a.order - b.order);
  const pending = memes.filter((m) => m.status === "pending").sort((a, b) => a.createdAt - b.createdAt);

  const addMeme = useCallback(
    async (
      input: MemeInput,
      options: { submittedBy: string; submittedById: string; autoApprove: boolean },
    ) => {
      const meme = await memesApi.addMeme(input, options);
      await reload();
      return meme;
    },
    [reload],
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      // Optimistic update so the drag itself feels immediate. This is only
      // a guess, though: the backend now treats the drag as a top-3 vote
      // (see backend/src/server.js) and recomputes everyone's order from
      // the combined totals, which can land differently than "drop it
      // exactly where I dragged it" — especially past the top 3. Reload
      // once the vote lands so the list settles on the real order.
      setMemes((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        const reordered = orderedIds
          .map((id, index) => {
            const meme = byId.get(id);
            return meme ? { ...meme, order: index } : null;
          })
          .filter((m): m is Meme => m !== null);
        const untouched = prev.filter((m) => !orderedIds.includes(m.id));
        return [...reordered, ...untouched];
      });
      await memesApi.updateOrder(orderedIds);
      await reload();
    },
    [reload],
  );

  const approve = useCallback(
    async (id: string) => {
      await memesApi.approveMeme(id);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await memesApi.deleteMeme(id);
      await reload();
    },
    [reload],
  );

  const edit = useCallback(
    async (id: string, updates: Partial<Pick<Meme, "title" | "categories">>) => {
      await memesApi.updateMeme(id, updates);
      await reload();
    },
    [reload],
  );

  return { memes, approved, pending, loading, addMeme, reorder, approve, remove, edit, reload };
}
