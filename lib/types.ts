export interface Meme {
  id: string;
  title: string;
  image: string;
  creator: string;
  tags: string[];
  based: number;
  laugh: number;
  createdAt: string;
  /** Dev-published memes may opt into community comments. */
  commentsEnabled?: boolean;
}

export interface Comment {
  id: string;
  memeId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Creator {
  handle: string;
  monkName: string;
  joined: string;
}

export type ReactionKind = "based" | "laugh";
export type FeedTabId = "foryou" | "new";

/** How an applicant delivers the meme: a file or a concept for the team. */
export type SubmissionType = "UPLOAD" | "CONCEPT_DESCRIPTION";

export interface ApplicationPayload {
  name: string;
  portfolio: string;
  submissionType: SubmissionType;
  /** Required for CONCEPT_DESCRIPTION. */
  conceptText?: string;
  /** Baseline filing fee, always server-assigned (20 NPR). */
  basePriceNpr: number;
  agreedToPolicy: boolean;
}
