import { createStore, entries, get, set, del, setMany } from "idb-keyval";
import type { Meme, MemeInput, User } from "./types";

const memeStore = createStore("kcdc2026-memes", "memes");
const userStore = createStore("kcdc2026-users", "users");

export async function getAllMemes(): Promise<Meme[]> {
  const all = await entries<string, Meme>(memeStore);
  return all.map(([, meme]) => meme).sort((a, b) => a.order - b.order);
}

export async function getMeme(id: string): Promise<Meme | undefined> {
  return get<Meme>(id, memeStore);
}

export async function addMeme(
  input: MemeInput,
  options: { submittedBy: string; autoApprove: boolean },
): Promise<Meme> {
  let order = 0;
  if (options.autoApprove) {
    const approved = (await getAllMemes()).filter((m) => m.status === "approved");
    order = approved.length === 0 ? 0 : Math.max(...approved.map((m) => m.order)) + 1;
  }

  const meme: Meme = {
    ...input,
    id: crypto.randomUUID(),
    status: options.autoApprove ? "approved" : "pending",
    submittedBy: options.submittedBy,
    order,
    createdAt: Date.now(),
  };

  await set(meme.id, meme, memeStore);
  return meme;
}

export async function approveMeme(id: string): Promise<void> {
  const meme = await getMeme(id);
  if (!meme || meme.status === "approved") return;

  const approved = (await getAllMemes()).filter((m) => m.status === "approved");
  const order = approved.length === 0 ? 0 : Math.max(...approved.map((m) => m.order)) + 1;

  await set(id, { ...meme, status: "approved", order }, memeStore);
}

export async function updateMeme(
  id: string,
  updates: Partial<Pick<Meme, "title" | "categories">>,
): Promise<void> {
  const meme = await getMeme(id);
  if (!meme) return;
  await set(id, { ...meme, ...updates }, memeStore);
}

export async function updateOrder(orderedIds: string[]): Promise<void> {
  const existing = await getAllMemes();
  const byId = new Map(existing.map((m) => [m.id, m]));

  const updates: [string, Meme][] = orderedIds
    .map((id, index) => {
      const meme = byId.get(id);
      if (!meme) return null;
      return [id, { ...meme, order: index }] as [string, Meme];
    })
    .filter((entry): entry is [string, Meme] => entry !== null);

  await setMany(updates, memeStore);
}

export async function deleteMeme(id: string): Promise<void> {
  await del(id, memeStore);
}

export async function getUser(email: string): Promise<User | undefined> {
  return get<User>(email, userStore);
}

export async function createUser(user: User): Promise<void> {
  await set(user.email, user, userStore);
}
