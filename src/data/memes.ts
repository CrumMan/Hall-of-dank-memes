import { API_URL, MEME_MEDIA_BUCKET, getAccessToken, supabase } from "../lib/supabaseClient";
import type { Meme, MemeInput, MemeType } from "./types";

interface MemeRow {
  id: string;
  title: string;
  media_url: string;
  media_type: "image" | "video";
  categories: string[];
  status: "approved" | "pending";
  submitted_by_email: string;
  sort_order: number | null;
  created_at: string;
}

function typeFromDb(mediaType: MemeRow["media_type"]): MemeType {
  return mediaType === "image" ? "photo" : "video";
}

function typeToDb(type: MemeType): MemeRow["media_type"] {
  return type === "photo" ? "image" : "video";
}

function rowToMeme(row: MemeRow): Meme {
  return {
    id: row.id,
    type: typeFromDb(row.media_type),
    mediaUrl: row.media_url,
    title: row.title,
    categories: row.categories ?? [],
    status: row.status,
    submittedBy: row.submitted_by_email,
    order: row.sort_order ?? 0,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getAllMemes(): Promise<Meme[]> {
  // RLS scopes this to: everyone sees approved memes, plus the caller's own
  // pending submissions, plus (for admins) every pending submission.
  const { data, error } = await supabase
    .from("memes")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as MemeRow[]).map(rowToMeme);
}

export async function getMeme(id: string): Promise<Meme | undefined> {
  const { data, error } = await supabase.from("memes").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return rowToMeme(data as MemeRow);
}

async function uploadMedia(file: File): Promise<string> {
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from(MEME_MEDIA_BUCKET).upload(path, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEME_MEDIA_BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function addMeme(
  input: MemeInput,
  options: { submittedBy: string; submittedById: string; autoApprove: boolean },
): Promise<Meme> {
  const mediaUrl = await uploadMedia(input.file);

  const { data, error } = await supabase
    .from("memes")
    .insert({
      title: input.title,
      media_url: mediaUrl,
      media_type: typeToDb(input.type),
      categories: input.categories,
      status: options.autoApprove ? "approved" : "pending",
      submitted_by: options.submittedById,
      submitted_by_email: options.submittedBy,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToMeme(data as MemeRow);
}

// ── Admin/mutating operations go through the small API backend (backend/),
// which verifies the caller's role directly against Postgres before running
// the write — see backend/src/auth.js. Everything above this line is a
// plain read/insert governed by Supabase Row Level Security instead.

async function callApi(path: string, init: RequestInit = {}): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("You must be logged in.");

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
}

export async function approveMeme(id: string): Promise<void> {
  await callApi(`/api/memes/${id}/approve`, { method: "POST" });
}

export async function updateMeme(
  id: string,
  updates: Partial<Pick<Meme, "title" | "categories">>,
): Promise<void> {
  await callApi(`/api/memes/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
}

export async function updateOrder(orderedIds: string[]): Promise<void> {
  await callApi("/api/memes/reorder", { method: "POST", body: JSON.stringify({ orderedIds }) });
}

export async function deleteMeme(id: string): Promise<void> {
  await callApi(`/api/memes/${id}`, { method: "DELETE" });
}
