export interface Meme {
  id: string;
  title: string;
  image: string;
  creator: string;
  tags: string[];
  based: number;
  laugh: number;
  createdAt: string;
}

export interface Creator {
  handle: string;
  monkName: string;
  joined: string;
}

export type ReactionKind = "based" | "laugh";
export type FeedTabId = "foryou" | "new";

export interface ApplicationPayload {
  name: string;
  portfolio: string;
  sample: string;
  note?: string;
}
