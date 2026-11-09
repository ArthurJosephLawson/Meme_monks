import type { Creator, Meme } from "./types";

/**
 * Data surface for the app. Deliberately empty: no seed or test data ships
 * with the client. Wire these loaders to a real backend (the /api routes,
 * a database, or an upstream service) and the UI picks it up as-is.
 */

export const CREATORS: Creator[] = [];

export const MEMES: Meme[] = [];

export function creatorByHandle(handle: string): Creator | undefined {
  return CREATORS.find((c) => c.handle === handle);
}
