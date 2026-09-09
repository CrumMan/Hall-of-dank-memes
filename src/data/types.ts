export type MemeType = "photo" | "video";
export type MemeStatus = "approved" | "pending";

export interface Meme {
  id: string;
  type: MemeType;
  mediaUrl: string;
  title: string;
  categories: string[];
  status: MemeStatus;
  submittedBy: string;
  order: number;
  createdAt: number;
}

export type MemeInput = Pick<Meme, "type" | "title" | "categories"> & { file: File };
