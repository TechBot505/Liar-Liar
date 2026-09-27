# Liar Liar — Product Spec & Architecture Contract

Liar Liar is a real-time multiplayer bluffing party game (Balderdash/Psych-style) delivered as a mobile-first PWA.
Everyone gets the same prompt, everyone writes a convincing LIE, then everyone tries to pick the TRUTH hidden
among the lies. Fool friends → points. Spot the truth → points.

Personality: loud, cheeky, colorful, confident, polished. Think "late-night game show × sticker-bomb × modern
motion design". NOT a generic SaaS look, NOT default shadcn. Chunky rounded display type, bold color blocks,
playful stickers, springy motion, confetti, haptics. Must look amazing on a phone first.

## Stack
- Next.js 15 (App Router, `src/`, TS strict), React 19, Tailwind CSS v4 (CSS-first), `motion` (import `motion/react`),
  `lucide-react`, `zustand`, `zod`, `clsx`, `tailwind-merge`, `canvas-confetti`, `qrcode`, `nanoid`.
- Realtime: **partyserver** on Cloudflare Workers (`partyserver` + dev `wrangler`; `partysocket` client). Server code in `party/index.ts`. One Durable Object room = one game. Deployable to `*.workers.dev` on the Workers Free plan (SQLite-backed DOs).
- DB: Drizzle ORM + `postgres` (postgres-js, `prepare:false`) → works with Neon. Optional (`DATABASE_URL`).
- Auth: Clerk (`@clerk/nextjs`) — OPTIONAL. App fully works with zero env vars (guest play). Login only adds cloud
  profile + play history.
- Tests: Vitest (engine, scoring, selection, matching, awards). Playwright-style E2E run by an agent.
- Fonts (next/font/google): display "Bricolage Grotesque" or similar chunky variable font; body "Inter"/"Plus Jakarta Sans".

## Zero-config & ports
- `npm run dev` runs BOTH Next (3000) and the `wrangler dev` worker (1999) via `concurrently`.
- `NEXT_PUBLIC_PARTYKIT_HOST` default `localhost:1999` (prod: `liarliar.<subdomain>.workers.dev`).
- `src/lib/env.ts`: `isAuthEnabled` (both Clerk keys), `isDbEnabled` (DATABASE_URL). Without them everything
  degrades gracefully (history stored locally). Deployable: Next → Vercel/Netlify; `party/` → `npx wrangler deploy`.

## Directory ownership
```
party/index.ts               Cloudflare Worker: routePartykitRequest fetch handler + partyserver Server class (thin: wires connections/alarms to the pure engine)
wrangler.jsonc               worker config (DO binding "main" → LiarLiarServer, SQLite migration)
src/game/                    PURE shared TS (no DOM, no Node APIs): types.ts, protocol.ts (zod messages),
                             engine.ts (reducer), scoring.ts, awards.ts, match.ts (fuzzy truth match),
                             select.ts (question selection), profanity.ts, codes.ts, rng.ts, bots? (no)
src/decks/                   deck registry + one folder per deck, question data split into files ≤150 lines
src/components/ui/           primitives (Button, Input, Sheet, Toast, Segmented, Toggle, etc.)
src/components/avatar/       Avatar SVG renderer + AvatarBuilder
src/components/game/         Lobby, AnswerPhase, VotePhase, RevealPhase, Scoreboard, Podium/Awards, Timer, etc.
src/components/home/         landing/home flow
src/lib/                     env, store (zustand persist: profile, seen questions, history), party client hook,
                             sound (WebAudio synth), haptics, share, db/, server/
src/app/                     routes (below) + api/
```

## Routes
- `/` Home: first visit → avatar + name creator (fun, 20 seconds max). Then two giant actions: **Start a game**
  (→ deck picker + settings → creates room) and **Join with code** (4-letter code input, auto-advance boxes).
  Also: how to play (3 animated steps), recent games, profile/avatar edit, sign in (optional).
- `/join/[code]` deep link: if no profile yet → quick avatar/name → join. (Also `/?code=ABCD` works.)
- `/room/[code]` the whole game (lobby → rounds → final). Single page, phase-driven.
- `/history`, `/history/[id]` past games (local + cloud when signed in), `/profile`, `/decks` (browse decks),
  `/how-to-play`, `/sign-in/[[...]]`, `/sign-up/[[...]]`, `not-found`.
- API: `POST /api/games` (called ONLY by party server with header `x-party-secret` = `PARTY_SECRET`; stores
  finished game), `POST /api/history/claim` (signed-in user claims their seat via playerToken), `GET /api/history`,
  `GET/PUT /api/profile`, `GET /api/health`.

## Identity
- Local profile (localStorage `ll:profile`): `{ id (nanoid), token (secret nanoid), name (1–16 chars), avatar: AvatarConfig }`.
- On connect the client sends `{type:"join", playerId, token, name, avatar, seen: string[]}`. Same playerId+token ⇒
  reconnect to the same seat (score kept). Token never broadcast.

## Game rules (authoritative, server-side)
- Room code: 4 uppercase letters from `ABCDEFGHJKLMNPQRSTUVWXYZ` (no I/O). Host creates; server rejects
  `create` if room already has a host/game → client retries a new code.
- Players: 2–12 (3+ recommended, UI hints). Late joiners during a game become players from the next round.
- Host settings (lobby): deck, rounds 5 | 7 | 10, answer timer 30/45/60/90s (default 60), vote timer 20/30/45s
  (default 30), final round double points (default on), family-friendly mode (profanity masked, default on).
- Phases: `lobby` → per round: `answering` → `voting` → `reveal` → `scores` → … → `final`.
- ANSWERING: all active players see the prompt; submit one lie (1–60 chars). If the lie fuzzy-matches the truth
  (normalize case/punct/articles, Levenshtein ≤ 2 for short strings or token-set equality, plus deck `alts`),
  it's rejected with "Too close to the truth! Try another lie." Players can edit until everyone submitted or timer
  ends. Missing players get no lie (they can still vote). Phase ends early when all submitted.
- Identical lies from multiple players are merged into one option credited to all authors.
- VOTING: options = unique lies + the truth, shuffled (seeded per round). A player cannot pick their own lie
  (UI disables; server rejects). Ends early when all voted.
- SCORING: picking the truth +2. Each player who picks your lie gives you +1 (merged authors each get +1 per
  fooled voter). Final round ×2 if enabled. No points for not submitting.
- "Truth Comes Out" deck (kind `player`): prompt references a target player ("What's {target}'s secret talent?").
  The TARGET writes the real answer (it becomes the truth; not fuzzy-checked); others write lies meant to look like
  the target's. Target does not vote; others +2 for finding the target's answer, authors +1 per fooled, target +1
  per player who found their real answer. Targets rotate among players.
- REVEAL: server sends full result; client animates each lie one by one (who fell for it → author unmasked
  "PSYCHED!"-style "LIAR!" stamp) then the truth last with correct pickers. Host taps "Next" (or auto after
  ~5s per option, max 25s). Players can send emoji reactions (😂🤯😈👏💀) — broadcast, rate-limited.
- SCORES: animated leaderboard with rank changes, then next round (host taps or auto 6s).
- FINAL: podium (1st/2nd/3rd) with confetti + awards: Biggest Liar (most fooled total), Human Lie Detector (most
  truths found), Most Gullible (fell for most lies), Nemesis (pair: A fooled B most), Silver Tongue (best single lie:
  fooled most in one round), Honest to a Fault (fooled nobody), Speed Demon (fastest average submit),
  Last-Second Larry (latest average submit). Only awards with a clear, non-zero winner are shown. Then "Play again"
  (same room, same players, host picks deck) and share results card.
- Host leaves: host role transfers to the longest-connected player after 20s disconnected (immediately if they
  explicitly leave). Room with nobody connected for 10 minutes is discarded.
- Timers: server stores `deadline` epoch ms in state; clients render countdown from it (with clock offset from
  server `now` in each state message). Server uses `setTimeout`/alarm to advance.

## Question selection (no frequent repeats)
- Each deck has 100+ questions. Server builds the game's question list at start:
  1. candidates = deck questions (minus `adult` ones when family mode is on and deck isn't adult).
  2. exclude ids in the UNION of all joined players' `seen` lists (clients store last 400 seen ids per deck).
  3. if not enough remain, top up with the least-seen (fewest players have seen it) candidates.
  4. seeded shuffle (seed = room code + game number) and take N.
- After each round the question id is appended to every player's local `seen` (client does it on reveal).

## Protocol (`src/game/protocol.ts`, zod-validated both sides)
Client → server: `join`, `create` (settings), `updateSettings`, `start`, `submitLie {text}`, `vote {optionId}`,
`next` (host advances reveal/scores), `react {emoji}`, `kick {playerId}`, `playAgain`, `leave`, `ping`.
Server → client: `state` (full public `RoomView` tailored per player: never includes other players' lies before
voting, never includes which option is the truth before reveal, never includes tokens), `error {code,message}`,
`reaction {playerId, emoji}`, `kicked`, `pong {now}`.
`RoomView` includes: code, phase, hostId, you (playerId), players [{id,name,avatar,score,connected,isHost,
submitted,voted}], settings, round {index,total,prompt,deckId,kind,targetId?,deadline, options?[{id,text}],
yourLieOptionId?, result?}, final? {standings, awards}, now.

## Persistence
- Local (zustand persist `ll:*`): profile, seen question ids per deck, last 50 game summaries.
- Party server on `final` POSTs a GameRecord to `${NEXT_PUBLIC_APP_URL}/api/games` with `x-party-secret`
  (skipped when env missing). Record includes per-player `tokenHash` (sha256) so signed-in users can later claim.
- DB tables: users (clerk id), profiles (name, avatar jsonb), games (id, code, deck, rounds, started_at, ended_at),
  game_players (game_id, seat_id, user_id nullable, name, avatar, score, rank, stats jsonb, token_hash),
  custom_decks + custom_questions (schema only, for later).

## UX quality bar
- Mobile first: `100dvh`, safe-area insets, keyboard-aware answer input (visualViewport), 48px+ tap targets,
  no horizontal scroll, works 320px → desktop (desktop centers a phone-like stage with big side art; optional
  "TV mode" layout later). Haptics via `navigator.vibrate` where supported. Sounds (WebAudio synth, default ON
  but quiet, mute toggle).
- Motion: spring transitions between phases, staggered option cards, stamp animations, count-up scores,
  confetti on podium. `prefers-reduced-motion` respected.
- Connection banner (reconnecting…), optimistic UI for submit/vote, disabled states, never a dead end.
- Accessibility: labelled controls, focus states, aria-live for phase changes and timer (at 10s), contrast AA.
- PWA: manifest, generated icons, service worker caching the app shell, install prompt on Android + iOS hint.

## Quality gates
`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` clean. No `any`, no ts-ignore.
Every file written by agents ≤ ~200 lines (split files).
