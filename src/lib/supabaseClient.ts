import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Add them to your .env file.",
  );
}

export const supabase = createClient(url, anonKey);

export const MEME_MEDIA_BUCKET = "meme-media";

/** The API backend's base URL — see backend/. Falls back to local dev. */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** Current user's access token, for calling the backend's admin endpoints. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
