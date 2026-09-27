# Liar Liar 🤥

A real-time multiplayer bluffing party game (Balderdash/Psych-style) as a mobile-first PWA.
Everyone gets the same prompt, writes a convincing lie, then hunts for the truth. Fool your
friends and spot the truth to score.

- **Web**: Next.js 15 (App Router) → deploys to Vercel
- **Realtime**: PartyKit (`party/server.ts`, one room = one game) → deploys with `partykit deploy`
- **DB (optional)**: Drizzle + Postgres (Neon)
- **Auth (optional)**: Clerk

Everything is optional. With **zero env vars** the game runs fully in guest mode
(local-only history, no sign-in).

## 1. Local dev

```bash
npm install
npm run dev
```

Runs both servers via `concurrently`: web on http://localhost:3000 and PartyKit on
:1999. No env vars needed. Quality gates:

```bash
npm run typecheck   # tsc for app + party
npm run lint
npm test            # vitest
npm run build
```

### Local database (no Docker)

Cloud persistence (profiles, history, stats) needs a Postgres. For local
development/testing there is an **embedded Postgres — no Docker, no install**:
[PGlite](https://pglite.dev) (Postgres compiled to WASM) served over the real
Postgres wire protocol.

```bash
npm run db:local      # starts PGlite on 127.0.0.1:5432 (fallback 54329),
                      # persisted to ./.pglite, and prints a DATABASE_URL
# then, in another shell, apply the schema against the printed URL:
DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres" npm run db:migrate
```

Or run everything at once — local DB + web (wired to it) + PartyKit:

```bash
npm run dev:full
```

`npm run db:migrate` is the recommended way to apply the schema for **both** the
local PGlite DB and production Neon (it runs the SQL in `drizzle/` and records what
it applied, so it is safe to re-run). Production simply points `DATABASE_URL` at a
Neon connection string instead — see step 3.

## 2. Deploy the realtime server (PartyKit)

```bash
npx partykit login
npx partykit deploy
# set the secrets the party server reads via room.env:
npx partykit env add PARTY_SECRET       # same value you set on Vercel
npx partykit env add NEXT_PUBLIC_APP_URL # your Vercel URL, e.g. https://liarliar.vercel.app
```

Your deployed host looks like `liarliar.<username>.partykit.dev` — use it as
`NEXT_PUBLIC_PARTYKIT_HOST` on Vercel.

## 3. Deploy the web app (Vercel)

1. Import the repo in Vercel (framework auto-detected; build command stays `next build`).
2. Set env vars (see `.env.example` for the full list with comments):
   - `NEXT_PUBLIC_PARTYKIT_HOST` — your PartyKit host
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL
   - `PARTY_SECRET` — matches the PartyKit value
   - `DATABASE_URL` — Neon **pooled** connection string (optional; enables cloud history)
   - Clerk keys (optional; see step 4)
3. Provision Postgres (Neon): create a project at [neon.tech](https://neon.tech)
   (or use the Vercel Neon integration), copy the **pooled** connection string
   (host contains `-pooler`), set it as `DATABASE_URL` in Vercel and in your local
   `.env.local`, then apply the schema **once**:
   ```bash
   npm run db:migrate     # applies drizzle/*.sql; safe to re-run
   ```

Without `DATABASE_URL`, the persistence API routes return `503 { reason: "db_disabled" }`
and the app falls back to local history — nothing breaks.

## 4. Auth (Clerk, optional)

1. Create a Clerk application in the [Clerk dashboard](https://dashboard.clerk.com).
2. Copy the API keys and set **both** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
   `CLERK_SECRET_KEY` in Vercel and `.env.local` (both required — if either is
   missing, auth stays off and sign-in is hidden). Clerk keys are **not** needed on
   the PartyKit server.
3. Add your web origin to Clerk's allowed origins. The sign-in/up pages live at
   `/sign-in` and `/sign-up`; `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
   (default `/play`) controls where users land afterward.
4. Signing in adds a **cloud profile, claimable play history, and synced stats**
   (across devices) — guest play is otherwise unchanged. On sign-in a one-shot
   `CloudSync` reconciles the local profile with the cloud copy (newer edit wins)
   and claims the device's guest seats.

## 5. Architecture

```
party/server.ts     Thin PartyKit adapter → the pure engine in src/game/
src/game/           Pure shared TS: types, protocol (zod), engine, scoring, awards, matching
src/decks/          Deck registry + one folder per deck (question data)
src/lib/db/         Drizzle schema + lazy getDb() (null when DATABASE_URL unset)
src/lib/server/     env helpers, auth (getUserId), rate limiter, hashing, validation
src/app/api/        games, history, history/claim, profile, stats, health
```

Data flow: the browser talks to the PartyKit room over WebSocket. When a game ends the
party server POSTs a `GameRecord` to `${NEXT_PUBLIC_APP_URL}/api/games` (authenticated with
`x-party-secret`), storing each seat with a `sha256(token)`. A signed-in user calls
`POST /api/history/claim` with their local tokens to attach those seats to their account;
the claim is remembered in `user_tokens`, so **future** games with the same token auto-link
to the user at POST time (no re-claim needed). `GET /api/stats` aggregates lifetime stats
from the user's owned seats.

### Adding a deck

1. Create `src/decks/<id>/` with question files (each ≤ ~150 lines) and a `Deck` object
   (see `src/decks/types.ts`).
2. Register it in `src/decks/registry.ts`.
3. Give it 100+ questions with stable ids (`<deckId>:<n>`) so selection avoids repeats.

Custom user decks (`custom_decks` / `custom_questions`) are schema-only for now.
