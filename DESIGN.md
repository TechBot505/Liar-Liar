# Liar Liar — Design System & Client Contract

Foundation for page-building agents. Import primitives from `@/components/ui`, the
avatar from `@/components/avatar/*`, client plumbing from `@/lib/*`.
Visual identity: **calm, confident, editorial-minimal with a playful wink** — a
near-black canvas, layered surfaces, hairline borders, and ONE coral accent.
Think Linear / Vercel / Arc / Things 3 restraint. No rainbows, gradients, stickers, tilts, or glow.

## Design tokens (Tailwind v4 `@theme inline`, `src/app/globals.css`)
Colors → `bg-*/text-*/border-*`: `bg` (#0A0A0B canvas), `surface` (#131316),
`surface-2` (#1A1A1F), `line` (rgba white .08 hairline), `fg` (#F5F5F4),
`fg-muted` (#B4B4BD, ~9.6:1 on bg), `fg-faint` (#7A7A85, ~4.7:1 on bg — meets WCAG AA
for small text), `accent` (#FF5A4E — the "liar" color),
`accent-fg` (#0A0A0B, near-black text on coral, AA ~6:1), `truth` (#4ADE80, results only).
Use `accent` sparingly: primary actions, focus, the fill-in blank, key moments.
Radii → `rounded-(--radius-input)` (12), `rounded-(--radius-card)` (14), `rounded-(--radius-pill)`.
Shadows → `shadow-soft` (inset top highlight + soft drop), `shadow-raise` (lighter).
Fonts → `font-sans` (Geist), `font-serif` (Instrument Serif italic), `font-mono` (Geist Mono).

## Utility classes (`src/styles/*.css`)
`.text-display` (Geist 600, tracking -0.03em), `.text-serif` (Instrument Serif italic — rare
display: logo "Liar", verdict headlines), `.text-mono` (tabular Geist Mono for codes/timers/numbers),
`.glass` (blurred surface for overlays), `.grain` (3% noise), `.safe-top/.safe-bottom/.safe-x`,
`.no-tap-highlight`, `.no-scrollbar`, `.stage` (min-h 100dvh), `.animate-bob` (avatar idle).
Type scale: 12/14/16/20/28/40/56. Tight tracking on large headings; generous body line-height.
4px spacing grid, generous whitespace.

## Deprecated aliases — remove after restyle
Old candy tokens/classes are TEMPORARILY mapped to the new system so un-restyled pages compile
and stay legible. **Do not use in new code; delete once every page is restyled.**
Colors: `ink`→bg, `ink-2`→surface, `card`→surface-2, `cream`→fg, `yellow`/`pink`/`red`→accent,
`lime`→truth, `cyan`→fg-muted, `violet`→surface-2. Radii: `xl`→12, `2xl`/`sticker`→14.
Shadows: `shadow-sticker`/`shadow-sticker-lg`/`shadow-pop`→`shadow-soft`. Fonts: `font-display`/`font-body`→Geist.
Classes: `.sticker`→hairline card, `.btn-3d`→flat press, `.sticker-tilt`→no-op.
Component props: `Button variant="pink"`→primary look, `"cyan"`→secondary; `Sticker tone` candy names
(`yellow/pink/red`→accent, `lime`→truth, `cyan/violet/cream`→neutral); `Sticker tilt` accepted but ignored.

## Layout (wired in `src/app/layout.tsx`)
`<AnimatedBackground/>` (static coral spotlight + faint noise, no animation), `<Toaster/>`,
`<InstallHint/>`, `<ServiceWorkerRegister/>`, `<Providers/>` mounted. Metadata + viewport
(viewportFit cover, themeColor `#0A0A0B`, appleWebApp) set. Pages render inside.

## UI primitives (`@/components/ui`)
- `<Button variant size loading fullWidth>` — variants `primary(coral)|secondary|ghost|danger`
  (+ aliases `pink→primary, cyan→secondary`); sizes `sm(pill)|md|lg(52px)`; press scale .97 + darken.
- `<IconButton label size subtle>` (label required, 44px hit area).
- `<Input label error counter maxLength>` (hairline, accent focus).
- `<CodeInput value onChange onComplete length=4 error>` — mono uppercase boxes, accent focus/caret.
- `<Sheet open onClose title>` — bottom sheet w/ grabber + blurred backdrop; desktop dialog; focus trap + Esc.
- `<Segmented options value onChange>` — subtle sliding pill (`layoutId`), generic `<T extends string|number>`.
- `<Toggle checked onChange label hideLabel>` — iOS switch, accent track when on.
- `<Sticker tone tilt>` (alias `Badge`) — subtle pill; tones `neutral|accent|truth` (+ candy aliases).
- `<Spinner size label>`. `<CountUp value duration prefix suffix>` (pass `text-mono` for tabular).
- `<TimerRing deadline total serverOffset size>` — thin 2px ring, mono digits, turns accent <10s, no pulse.
- `<AvatarStack players max size>` (players `{id,avatar,name?}`), ring `bg`.
- `<Card padding='none|sm|md|lg' interactive>` — raised surface, hairline, 14px, soft shadow.
- `<Stat label value prefix suffix accent>` — small label + big tabular-mono number.
- `<Divider label orientation>` — hairline rule (optional centered label / vertical).
- `<ProgressDots total current label>` — round steps: done (muted) / current (accent) / upcoming (faint).
- `<ModalCard open onClose? tone='truth'|'fooled'|'neutral'>` — centered scale-in overlay w/ tone bar;
  use for per-player verdict popups.
- `toast(msg, kind)` (`success|error|info|warn`) — compact top-center dark pill, auto 2.5s, color dot only.
- `fireConfetti(opts?)`, `firePodium()` — restrained; palette = accent + white + truth; no-op if reduced motion.

## Avatar (`@/components/avatar`, types in `@/lib/avatar`)
`AvatarConfig = { face, color, eyes, mouth, accessory, bg }`, 8 ids each (`FACES COLORS EYES
MOUTHS ACCESSORIES BGS`). Palette: 8 muted body tones (clay/sand/sage/slate/dusk/rose/stone/ocean)
on dark disc backgrounds; near-black line features; minimal coral line-icon accessories.
`avatarConfigSchema` (zod) + `normalizeAvatar()` (migrates legacy candy hexes → new palette,
so old profiles don't break) + `randomAvatar(seed?)` (deterministic with seed).
- `<Avatar config size=96 ring? mood? bob? title/>` — pure SVG; `mood: idle|happy|sad|smug|shocked`.
- `<AvatarBuilder value onChange/>` — bobbing preview, per-part rows, Randomize dice.
Wire format unchanged (`protocol.ts` `join.avatar`, loose in / normalized out — backward compatible).

## Client plumbing (`@/lib`) — unchanged
- `env.ts`: `isAuthEnabledClient`, `partyHost`, `appUrl`, `clerkPublishableKey`.
- `store.ts` (zustand+persist, SSR-safe `useHydrated()`): `useProfileStore`, `useSeenStore`,
  `useHistoryStore`, `usePrefsStore`.
- `sound.ts` `playSound(name)` + `primeAudio()`; `haptics.ts` `haptic(name)`.
- `share.ts`: `inviteUrl`, `shareInvite`, `qrDataUrl`.
- `useRoom(code)` → `{ view, status, error, kicked, serverOffset, send, onReaction }`;
  `createRoom(settings)` → `{code}`. Pass `serverOffset` into `<TimerRing>`.

## Logo / wordmark
`<Wordmark/>` = "Liar" in Instrument Serif italic (coral) + "Liar" in Geist semibold. App icon
(`src/app/icon.svg`, `public/icon.svg`) = coral serif "L" monogram + caret blank on near-black.
Regenerate PNGs after logo edits: `node scripts/gen-icons.mjs`.

## Motion conventions
Quick springs (`stiffness ~400, damping ~32`); entrances = fade + 8px rise; `layoutId` for gliding
highlights (Segmented); `AnimatePresence` for enter/exit (Sheet, Toast, ModalCard); `CountUp` for
number changes. Restraint — never bouncy/wobbly. Always honor `prefers-reduced-motion`.

## Rules for page agents
Every file ≤200 lines (split). No `any`/`ts-ignore`. Don't touch `src/game` or `src/decks`.
Gates: `npm run typecheck`, `npm run lint`, `npx vitest run`,
`NODE_OPTIONS="--require ./scripts/force-ipv4.cjs" npm run build`.
