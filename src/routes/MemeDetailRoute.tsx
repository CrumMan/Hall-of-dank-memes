import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../data/AuthContext";
import { getMeme } from "../data/memes";
import { useMemes } from "../data/useMemes";
import { validateCategories, validateTitle } from "../lib/validate";
import type { Meme } from "../data/types";

const inputClasses =
  "rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-amber-50 dark:focus:border-amber-400";

export function MemeDetailRoute({ id }: { id: string }) {
  const [meme, setMeme] = useState<Meme | null | undefined>(undefined);
  const { session } = useAuth();
  const { remove, approve, edit } = useMemes();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategories, setEditCategories] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMeme(id).then((m) => {
      if (!cancelled) setMeme(m ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function startEditing() {
    if (!meme) return;
    setEditTitle(meme.title);
    setEditCategories((meme.categories ?? []).join(", "));
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit() {
    const titleResult = validateTitle(editTitle);
    if (!titleResult.ok) {
      setEditError(titleResult.error ?? "Invalid title.");
      return;
    }
    const categoriesResult = validateCategories(editCategories);
    if (!categoriesResult.ok || !categoriesResult.categories) {
      setEditError(categoriesResult.error ?? "Invalid category.");
      return;
    }

    setSaving(true);
    try {
      await edit(id, { title: editTitle.trim(), categories: categoriesResult.categories });
      setMeme((m) =>
        m ? { ...m, title: editTitle.trim(), categories: categoriesResult.categories! } : m,
      );
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await remove(id);
    navigate({ to: "/" });
  }

  async function handleApprove() {
    await approve(id);
    setMeme((m) => (m ? { ...m, status: "approved" } : m));
  }

  if (meme === undefined) {
    return <p className="p-8 text-center text-neutral-600 dark:text-neutral-400">Loading…</p>;
  }

  if (meme === null) {
    return (
      <p className="p-8 text-center text-neutral-600 dark:text-neutral-400">
        This meme no longer exists.
      </p>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl px-4 pb-16">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-0">
        {meme.type === "photo" && (
          <img src={meme.mediaUrl} alt={meme.title} className="max-h-[70vh] w-full object-contain" />
        )}
        {meme.type === "video" && (
          <video src={meme.mediaUrl} controls className="max-h-[70vh] w-full" />
        )}

        {meme.status === "pending" && (
          <p className="bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-700 dark:text-amber-300">
            Pending approval
          </p>
        )}

        <div className="p-4">
          {editing ? (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
                Title
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={80}
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
                Categories
                <input
                  type="text"
                  value={editCategories}
                  onChange={(e) => setEditCategories(e.target.value)}
                  placeholder="e.g. Dead, Pepe, 2016"
                  className={inputClasses}
                />
              </label>

              {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-neutral-950 shadow transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-100">
                    {meme.title}
                  </h2>
                  {meme.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Added {new Date(meme.createdAt).toLocaleDateString()}
                </p>
              </div>

              {session?.isAdmin && (
                <div className="flex shrink-0 gap-2">
                  {meme.status === "pending" && (
                    <button
                      onClick={handleApprove}
                      className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={startEditing}
                    className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-full border border-red-500 px-4 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    {meme.status === "pending" ? "Reject" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
