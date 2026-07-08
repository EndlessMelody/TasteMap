# Frontend → Once UI Migration Playbook

Working branch: **`frontend/onceui-migration`**. Full plan:
`~/.claude/plans/can-you-help-me-luminous-fox.md`.

This is the repeatable recipe for converting the TasteMap frontend from its
Tailwind/inline-style/custom-clone hybrid to **real `@once-ui-system/core` + SCSS
modules**, organized by page, working in **both light and dark**.

---

## Status

| Phase | State |
|---|---|
| 0 Branch + baseline | ✅ baseline 52 tsc errors; `next build` failed pre-migration → gated on **tsc-delta + dev boot** throughout. As of Phase 6, `next build` succeeds cleanly (0 tsc errors, all 22 routes generate). |
| 1 Once UI foundation (`@once-ui-system/core`, `sass`, `classnames`, `Providers.tsx`, CSS + `data-*`) | ✅ committed |
| 2 `styles/theme.scss` brand → `#ff6b35` | ✅ committed |
| 3a Dedup dead modal + 4 unused legacy cards | ✅ committed |
| 3b Lift providers out of `DashboardLayout` (now chrome-only) | ✅ committed |
| 3c Route groups `(marketing)`/`(app)` + move chrome to `components/layout` | ✅ committed |
| 4 Swap clone imports app-wide + delete clone | ✅ done — `components/OnceUI` removed, 0 clone importers |
| 5 Per-page restyle (22 routes) | ✅ done — all app routes (discover/feed/profile/group-rooms, foodies, hot-routes, challenges, culture, explore, admin, tour-builder, ai-planner) + marketing landing/promo migrated to `@once-ui-system/core`; tsc errors at **0** (from 52 baseline) |
| 6 Remove Tailwind, delete legacy tokens, `globals.css`→scss, ESLint guardrails | ✅ done — see notes below |

Reference migrations to copy from: `app/admin/analytics/page.tsx` (props-only),
`app/admin/login/page.tsx` + `page.module.scss` (when SCSS is needed).

---

## Verified Once UI API (v1.7.9) — clone → real mappings

Imports: `@/components/OnceUI` → `@once-ui-system/core`.

| Clone usage | Real Once UI | Notes |
|---|---|---|
| `gap={16}` / `gap={0}` (number) | `gap="16"` / `gap="0"` (string) | Tokens: `0,1,2,4,8,12,16,20,24,32,40,48,56,64,80,104,128,160` + t‑shirt `xs..xl`. **Round non-tokens** (e.g. `gap={6}`→`"8"`, `gap={9}`→`"8"`). |
| `padding="20px"` arbitrary | `padding="20"` | Same spacing tokens only. |
| `align="center" justify="center"` (flex) | `horizontal="center" vertical="center"` (or `center`) | Real `align` = **text-align**, not flex. `justify` does not exist. |
| `vertical="between"` | `vertical="between"` ✅ | Real values: `start\|center\|end\|between\|around\|even\|stretch`. |
| `horizontal="space-between"` | `horizontal="between"` | "space-between" is invalid. |
| `<Text weight=…>` / `<Heading padding=…>` | ✅ valid in real Once UI | Clone wrongly rejected these. |
| `background="surface"` | ✅ `Colors \| "surface"\|"overlay"\|"page"\|"transparent"` | |
| `onBackground="neutral-medium"` | ✅ `Colors` = `{neutral\|brand\|accent\|info\|danger\|warning\|success}-{weak\|medium\|strong}` (+ `-alpha-`) | Use `danger-medium` for error text, etc. |
| `border="neutral-alpha-weak"` | ✅ | 1px solid alpha border. |

Breakpoints: `s={{ direction:'column' }}` etc. valid (`xs/s/m/l/xl`).
`maxWidth={25}` = 25rem (auto-adds `fillWidth`). No `vh`/`dvh` prop → use SCSS.

Providers live in `src/providers/Providers.tsx` (Once UI Theme/Layout/Icon/Toast
+ app contexts). Theme is `light` + `brand=orange`, `neutral=sand`; static
`data-*` mirror on `<html>` in `app/layout.tsx`.

---

## Per-page recipe

For each route `app/<route>/page.tsx`:

1. **Swap import** to `@once-ui-system/core`.
2. **Containers**: every `<div>` doing flex/grid → `<Column>`/`<Row>`/`<Grid>`
   with props (`gap`, `padding`, `fillWidth`, `horizontal`, `vertical`,
   `background`, `radius`, `border`). Apply the table above.
3. **Typography**: `<h*>/<p>/<span>` → `<Heading variant>` / `<Text variant>`.
4. **Colors → both themes**: replace hardcoded hex (`#1C1C1E`, `#8E8E93`,
   `var(--text-*)`, `var(--surface-*)`) with semantic props (`background="surface"`,
   `onBackground="neutral-weak"`, etc.). **No hardcoded light-only hex** — that's
   what breaks dark mode. lucide icons: wrap in `<Text onBackground="…">` (they
   inherit `currentColor`) or register them in `IconProvider` and use `<Icon>`.
5. **Tailwind `className`** utilities → Once UI props, or a class in a co-located
   `*.module.scss`.
6. **SCSS module only when props can't express it**: pseudo-states, keyframes,
   media queries, gradients, `min-height:100dvh`, custom inputs. Co-locate as
   `page.module.scss` / `Component.module.scss`. (See login example.)
7. **Organize by page**: move page-only components into `app/<route>/_components/`
   (underscore = Next private folder), with co-located `data.ts` / `types.ts` /
   `*.module.scss` and an `index.ts` barrel.
8. **Keep Framer Motion** for gestures/animation; feed it numeric values from
   `styles/tokens.ts` (`durationMs`, `easeCurve`).
9. **Verify**: `npx tsc --noEmit` (count must not rise), then dev boot the route.

---

## Remaining work

**Pages (≈20)** — order easiest→hardest: rest of `admin/*` (challenges is 826 lines
incl. 3 modals; dashboard/locations are Tailwind-heavy) → list/detail
(`feed,challenges,culture,hot-routes,foodies,group-rooms,discover,profile,explore`)
→ heavy (`ai-planner,tour-builder`) → **landing/promo last** (`app/page.tsx` + 11
promo components — the worst inline-style offender).

**Shared (swap clone too; clone deletes only when 0 importers remain — 34 files at
start, check `grep -r "@/components/OnceUI" src`)**: `DashboardLayout`,
`components/common/*` (Sidebar/RightSidebar/AppStatusBar → move to
`components/layout/`), `components/Discovery/*`, `components/modals/*`,
`components/features/**`. Rebuild `components/ui/*` + `primitives/*` (GlassCard,
MatchRing, PulseDot) on Once UI.

**Phase 3c** route groups: `(marketing)/` for `/` (landing in its own folder, URL
stays `/`) with a no-chrome layout; `(app)/` with `(app)/layout.tsx` holding the
sidebar chrome (replaces the `pathname` branching in `DashboardLayout`). Preserve
current behavior: no-chrome `/`,`/login`; full-screen `/profile`,`/tour-builder`;
special `/explore`,`/foodies`,`/ai-planner`.

**Theme toggle (both light+dark)**: bridge the existing `ThemeContext` toggle to
Once UI `useTheme().setTheme` (single source of truth); change `app/layout.tsx`
`data-theme` to `system` or driven value. Every page must use semantic colors.

**Phase 6 cleanup (done):** Migrated the remaining ~40 raw-`<div>` files
(global app shell — `Sidebar`/`RightSidebar`/`AppStatusBar` — plus auth, all
remaining `components/common/*`, `components/modals/create-post/*`, `Map*`,
`*Modal.tsx`, app-level pages, and the root `layout.tsx`) to Once UI
`Column`/`Row`/`Grid`; deleted dead-code `IOSLobbies.tsx` (0 importers).
Converted the 12 genuinely Tailwind-dependent files (admin pages, `ExploreClient`,
`DashboardHeader`, `PlannerHeader`, create-post modals, skeletons) from Tailwind
classNames to inline `style`/Once UI props.

Removed `tailwindcss` + `@tailwindcss/postcss` (and the now-empty
`postcss.config.mjs`), dropped `@import "tailwindcss"`, converted the
Tailwind-only `@theme inline {}` block in `globals.css` to a plain `:root {}`
(same vars, so existing `var(--radius-2xl)` etc. call sites keep working),
renamed `globals.css` → `globals.scss`.

`--dsc-*` turned out to be **load-bearing**, not dead — it backs
`styles/tokens.ts` (consumed by 90+ files) and `styles/ui.css` (Button/Card/Pill).
It also has real light/dark variants driven by the live `ThemeContext` toggle.
Rather than hardcode literal values (which would have silently broken dark
mode on ~15 components), `tokens.ts`'s `palette` (bg/surface/border/text) was
repointed to Once UI's own dark-mode-aware CSS vars (`--neutral-on-background-strong`
etc. — verified to exist in `@once-ui-system/core`'s `tokens.css`). The
`warm/cool/magic/success/warning/danger` accent tokens were kept as literal hex
(they never had a dark variant, and several call sites append a hex alpha
suffix like `${tokens.color.warm}30`, which only works on literal hex strings).
`radius`/`space`/`typography` became literal numbers (theme-invariant); `shadow`
points at the pre-existing `--shadow-card`/`--shadow-elevated` vars. `globals.css`
keeps only the `--dsc-ease-*`/`--dsc-duration-*` motion vars — literally
"trimmed to motion-only" as originally planned, while `tokens.ts` kept its
broader JS-object shape so none of the 90+ consumers needed touching.

Updated `.claude/rules/01-frontend-ui.md`'s stale `@/once-ui/components`
import path → `@once-ui-system/core`. Added an ESLint rule
(`no-restricted-syntax` in `eslint.config.mjs`) banning raw `<div>` and
Tailwind-utility-shaped `className` strings in `app/**`+`components/**` —
scoped to just those two, **not** inline `style` (which remains the
project's real, sanctioned mechanism for colors/gradients/literal values
Once UI props don't cover — banning it would fail lint almost everywhere).

---

## Gotchas

- **Never run two `next dev` at once** — multiple servers corrupt `.next` and wedge
  compiles (symptom: stuck "Compiling…", curl `HTTP 000`). Kill strays:
  `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ? { $_.CommandLine -like '*next*' } | Stop-Process -Force`, then `rm -rf .next`.
- `next build` fails on the pre-existing 52 tsc errors → use tsc-delta + dev boot
  as the gate until Phase 5/6 drive errors toward 0.
- Stray `C:\Users\phanp\package-lock.json` makes Turbopack mis-infer the workspace
  root (warning only) — optionally set `turbopack.root` in `next.config.ts`.
- `middleware.ts` → Next 16 wants `proxy.ts` (deprecation warning only).
