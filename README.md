# Meme Monks

Exclusive, community-driven meme platform. Clean, minimal blue-grey interface —
flat colors only, no gradients.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4
- lucide-react icons
- Node built-in test runner (`node --test`)

## Run

```bash
npm install
./localhost.sh   # dev server on :3000 (falls back to the next free port)
npm run build    # production build
npm test         # unit tests
```

## Structure

```
app/
  layout.tsx            # shell: fixed left rail + mobile top bar
  page.tsx              # feed: "For You" | "Newest" tabs, empty-state first
  search/page.tsx       # instant search (title / tags / @handle)
  leaderboard/page.tsx  # "Top Monks" ranking with flat progress bars
  apply/page.tsx        # creator application form + Stripe placeholder
  api/apply/route.ts    # sanitizes, validates, files applications
components/             # Navigation, MemeCard, FeedTabs, TagPill, EmptyState
lib/                    # types, data surface, sanitize, format
tests/                  # node --test unit tests
```

## Data policy

No seed or test data ships with the client. `lib/data.ts` exposes empty
`CREATORS` / `MEMES` arrays as the single data surface — point them at a real
backend and every page (feed, search, leaderboard) picks it up through its
existing empty-state handling.

## Design tokens (`app/globals.css`)

| Role | Hex |
| --- | --- |
| Page base | `#f1f3f7` |
| Surface (cards, rail, inputs) | `#fbfcfe` |
| Inset panels / hover | `#e9edf3` / `#dfe4ed` |
| Borders | `#c5ccd8` / `#adb8cb` |
| Text | `#1f2833` (primary), `#647b96` / `#7b90a8` / `#94a3b8` (secondary) |
| Interactive accent | `#647b96` (hover `#546a84`) |

All backgrounds, buttons, borders, and containers are flat, solid colors —
zero gradients or glow effects anywhere.

## Application flow

`POST /api/apply` accepts JSON `{ name, portfolio, sample }`, sanitizes and
validates server-side, then files the application to `.data/applications.json`
(mode 0600) — the scaffold's admin inbox. Server log emits a routing line per
application. Stripe checkout is a placeholder: verify a paid Checkout Session
in `app/api/apply/route.ts` before charging/filing in production.

## Security notes

- All user input is sanitized server-side (`lib/sanitize.ts`): control chars
  stripped, length caps, only absolute http(s) URLs accepted.
- No `dangerouslySetInnerHTML` anywhere; React escaping only.
- Request body capped at 10 KB; responses carry `Cache-Control: no-store`.
