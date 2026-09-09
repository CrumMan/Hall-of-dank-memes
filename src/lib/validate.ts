import type { MemeType } from "../data/types";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_TITLE_LENGTH = 80;
const MAX_CATEGORY_LENGTH = 30;

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  type?: MemeType;
}

export function validateMemeFile(file: File): FileValidationResult {
  if (file.type.startsWith("image/")) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Images must be 10MB or smaller." };
    }
    return { ok: true, type: "photo" };
  }

  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) {
      return { ok: false, error: "Videos must be 50MB or smaller." };
    }
    return { ok: true, type: "video" };
  }

  return { ok: false, error: "Please choose an image or video file." };
}

export function validateTitle(title: string): FileValidationResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { ok: false, error: "Give your meme a title." };
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  return { ok: true };
}

export interface CategoriesValidationResult {
  ok: boolean;
  error?: string;
  categories?: string[];
}

/** Splits a comma-separated string into trimmed, deduped category names. */
export function parseCategories(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
  }
  return result;
}

export function validateCategories(raw: string): CategoriesValidationResult {
  const categories = parseCategories(raw);

  if (categories.length === 0) {
    return {
      ok: false,
      error: 'Give it at least one category, e.g. "Dead, Pepe, 2016".',
    };
  }
  const tooLong = categories.find((c) => c.length > MAX_CATEGORY_LENGTH);
  if (tooLong) {
    return { ok: false, error: `Each category must be ${MAX_CATEGORY_LENGTH} characters or fewer.` };
  }
  return { ok: true, categories };
}
