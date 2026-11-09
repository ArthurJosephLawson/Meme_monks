import type { Creator, Meme } from "./types";

export const CREATORS: Creator[] = [
  { handle: "nullmonk", monkName: "Null Monk", joined: "2024-03-02" },
  { handle: "segfault_sensei", monkName: "Segfault Sensei", joined: "2024-07-19" },
  { handle: "vim_vow", monkName: "Vim Vow", joined: "2025-01-11" },
  { handle: "docker_deshret", monkName: "Docker Deshret", joined: "2025-05-30" },
  { handle: "heap_healer", monkName: "Heap Healer", joined: "2025-09-14" },
  { handle: "quantum_quip", monkName: "Quantum Quip", joined: "2026-02-08" },
];

export const MEMES: Meme[] = [
  {
    id: "m-001",
    title: "when the fix is deleting the feature",
    image: "/memes/m01.svg",
    creator: "nullmonk",
    tags: ["debugging", "terminal", "truth"],
    based: 4821,
    laugh: 2310,
    createdAt: "2026-11-08T21:14:00Z",
  },
  {
    id: "m-002",
    title: "it works on my machine (enlightened)",
    image: "/memes/m02.svg",
    creator: "segfault_sensei",
    tags: ["devops", "copium"],
    based: 3904,
    laugh: 5120,
    createdAt: "2026-11-08T14:02:00Z",
  },
  {
    id: "m-003",
    title: "npm install: 4.2GB later, still broken",
    image: "/memes/m03.svg",
    creator: "vim_vow",
    tags: ["npm", "node_modules", "pain"],
    based: 6120,
    laugh: 2870,
    createdAt: "2026-11-07T19:45:00Z",
  },
  {
    id: "m-004",
    title: "git push --force and assume nothing",
    image: "/memes/m04.svg",
    creator: "heap_healer",
    tags: ["git", "monk-mode"],
    based: 2988,
    laugh: 1740,
    createdAt: "2026-11-07T09:12:00Z",
  },
  {
    id: "m-005",
    title: "not a bug, it's a spontaneous feature",
    image: "/memes/m05.svg",
    creator: "quantum_quip",
    tags: ["standup", "denial"],
    based: 4410,
    laugh: 3620,
    createdAt: "2026-11-06T22:31:00Z",
  },
  {
    id: "m-006",
    title: "docker: works locally, dies in prod",
    image: "/memes/m06.svg",
    creator: "docker_deshret",
    tags: ["docker", "prod", "grief"],
    based: 5210,
    laugh: 4033,
    createdAt: "2026-11-06T11:08:00Z",
  },
  {
    id: "m-007",
    title: "one missing semicolon, entire app down",
    image: "/memes/m07.svg",
    creator: "segfault_sensei",
    tags: ["js", "semicolons", "chaos"],
    based: 1877,
    laugh: 2455,
    createdAt: "2026-11-05T18:54:00Z",
  },
  {
    id: "m-008",
    title: "coffee.exe has stopped responding",
    image: "/memes/m08.svg",
    creator: "nullmonk",
    tags: ["coffee", "vitals", "low"],
    based: 3540,
    laugh: 2960,
    createdAt: "2026-11-05T07:20:00Z",
  },
];

export function creatorByHandle(handle: string): Creator | undefined {
  return CREATORS.find((c) => c.handle === handle);
}
