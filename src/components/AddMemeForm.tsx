import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../data/AuthContext";
import { useMemes } from "../data/useMemes";
import { useObjectUrl } from "../lib/objectUrls";
import { validateCategories, validateMemeFile, validateTitle } from "../lib/validate";
import type { MemeType } from "../data/types";

export function AddMemeForm() {
  const { addMeme } = useMemes();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<MemeType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const previewUrl = useObjectUrl(file);

  const inputClasses =
    "rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-amber-50 dark:focus:border-amber-400";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setFile(null);
    setFileType(null);

    if (!selected) return;

    const result = validateMemeFile(selected);
    if (!result.ok) {
      setError(result.error ?? "Invalid file.");
      return;
    }

    setFile(selected);
    setFileType(result.type ?? null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const titleResult = validateTitle(title);
    if (!titleResult.ok) {
      setError(titleResult.error ?? "Invalid title.");
      return;
    }

    const categoryResult = validateCategories(category);
    if (!categoryResult.ok || !categoryResult.categories) {
      setError(categoryResult.error ?? "Invalid category.");
      return;
    }

    if (!file || !fileType) {
      setError("Please choose an image or video file.");
      return;
    }

    if (!session) {
      setError("You must be logged in to add a meme.");
      return;
    }

    setSubmitting(true);
    try {
      await addMeme(
        {
          type: fileType,
          blob: file,
          mimeType: file.type,
          title: title.trim(),
          categories: categoryResult.categories,
        },
        { submittedBy: session.email, autoApprove: session.isAdmin },
      );
      navigate({ to: "/" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-12 flex max-w-md flex-col gap-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-0"
    >
      <h2 className="text-center text-xl font-semibold text-amber-800 dark:text-amber-100">Add a meme</h2>

      {session && !session.isAdmin && (
        <p className="rounded-lg bg-neutral-100 px-3 py-2 text-center text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          Your submission will be reviewed by an admin before it appears in the Hall of Fame.
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="e.g. Distracted Boyfriend"
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
        Categories
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Dead, Pepe, 2016"
          className={inputClasses}
        />
        <span className="text-xs text-neutral-500">Separate multiple categories with commas.</span>
      </label>

      <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
        Photo or video
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-amber-500 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        />
      </label>

      {previewUrl && fileType === "photo" && (
        <img src={previewUrl} alt="Preview" className="max-h-64 w-full rounded-lg object-contain" />
      )}
      {previewUrl && fileType === "video" && (
        <video src={previewUrl} controls className="max-h-64 w-full rounded-lg" />
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-amber-500 px-6 py-2 font-semibold text-neutral-950 shadow transition hover:bg-amber-400 disabled:opacity-50"
      >
        {submitting
          ? "Adding…"
          : session?.isAdmin
            ? "Add to Hall of Fame"
            : "Submit for review"}
      </button>
    </form>
  );
}
