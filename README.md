# MEME MONKS

Exclusive, community-driven meme platform. Cyber-terminal aesthetic, neon
`#00FF66` on deep charcoal. Only monks in good standing transmit.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4
- lucide-react icons
- vitest (unit tests)

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm test        # unit tests
```

## Structure

```
app/
  layout.tsx            # shell: fixed sidebar + mobile top bar
  page.tsx              # feed: "For You" | "Newest Memes" tabs
  search/page.tsx       # instant search (title / tags / @handle)
  leaderboard/page.tsx  # "Top Monks" ranking
  apply/page.tsx        # creator application form + Stripe placeholder
  api/apply/route.ts    # sanitizes, validates, files applications
components/             # Navigation, MemeCard, FeedTabs, TagPill
lib/                    # types, seed data, sanitize, format
public/memes/           # placeholder meme art (SVG)
tests/                  # vitest unit tests
```

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
