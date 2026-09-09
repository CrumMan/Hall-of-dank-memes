export type MemeType = "photo" | "video";
export type MemeStatus = "approved" | "pending";

export interface Meme {
  id: string;
  type: MemeType;
  blob: Blob;
  mimeType: string;
  title: string;
  categories: string[];
  status: MemeStatus;
  submittedBy: string;
  order: number;
  createdAt: number;
}

export type MemeInput = Pick<Meme, "type" | "blob" | "mimeType" | "title" | "categories">;

export interface User {
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
}
