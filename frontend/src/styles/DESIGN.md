# TasteMap Concierge — Design System

> The single source of truth for visual decisions across all 22 pages.
> If a value isn't in [`tokens.ts`](./tokens.ts), it doesn't exist.

---

## 0. Philosophy

**Editorial calm.** TasteMap is a discovery product, not a fast-food app. The interface should feel like a well-edited magazine: ivory paper, restrained ink, color used as punctuation — not decoration. Surface 90% of the time, accent 10%.

**Three rules that override everything else:**
1. Surface and text do the work. Color and motion are reserved.
2. One signature gradient. One CTA color. One AI color. Never mix on the same screen.
3. If a value isn't a token, it's a bug.

---

## 1. The token system

All values live in [`src/styles/tokens.ts`](./tokens.ts), backed by CSS vars in [`src/app/globals.css`](../app/globals.css) under the `--dsc-*` namespace.

The legacy `--color-primary`, `--surface-*`, `--border-*`, `--text-*`, `--shadow-card`, `--radius-{xs,s,m,l,xl,2xl,full}`, `--spacing-*` variables and the `.glass-premium`, `.card-hover`, `.noise-overlay`, `.focus-ring`, `.skeleton-shimmer` utility classes are **deprecated**. They will be removed at the end of the migration. Do not introduce new usage.

### Importing
```tsx
import { tokens } from "@/styles/tokens";

style={{
  background: tokens.color.surface,
  padding: tokens.space[6],
  borderRadius: tokens.radius.lg,
}}
```

Never write raw hex (`#fff5f0`), raw px (`padding: 16`), or legacy vars (`var(--color-primary)`) in a page or component.

---

## 2. Color

### Surfaces (use these 95% of the time)
| Token | Light | Dark | Use |
|---|---|---|---|
| `color.bg` | `#fafaf7` ivory | `#0b0b0a` | Page background |
| `color.surface` | `#ffffff` | `#141412` | Cards, modals, sheets |
| `color.surfaceMuted` | `#f5f5f1` | `#1c1c1a` | Inset rows, secondary surfaces |
| `color.surfaceInset` | `#f0efeb` | `#242422` | Tertiary surfaces, filter chips |

### Text (3 tiers — no fourth tier)
| Token | Light | Use |
|---|---|---|
| `color.text` | `#0a0a0a` | Titles, body |
| `color.textMuted` | `#636366` | Metadata, captions, secondary |
| `color.textSubtle` | `#aeaeb2` | Placeholders, disabled, decorative |
| `color.textInverse` | `#ffffff` | Text on accent backgrounds |

### Borders
| Token | Use |
|---|---|
| `color.border` | Default card / divider |
| `color.borderStrong` | Hovered, focused, or emphasized |
| `color.borderFocus` | Active focus ring (warm tint) |

### Accents (the 10% — used as punctuation)
| Token | Hex | Reserved for |
|---|---|---|
| `color.warm` | `#ff6b35` | **Primary CTA**, streaks, the brand mark |
| `color.cool` | `#0a84ff` | Info, neutral links, calendar |
| `color.magic` | `#a855f7` | **AI features only** — Taste DNA, AI Picks, AI Planner, AI badges |
| `color.success` | `#34c759` | Match ≥ 90%, completed states |
| `color.warning` | `#fbbf24` | Match 75–90%, caution |
| `color.danger` | `#e63946` | Live indicator, trending, destructive actions |

**Hard rules:**
- One screen, one accent dominant. Multiple accents on one card = redesign.
- `magic` purple is **never** decorative — its presence means "this output came from AI."
- `danger` is **never** a "highlight" color — only true urgency.
- No gradients except `gradient.signature` / `gradient.signatureSoft`, and only on AI hero surfaces (max 1 per screen).

---

## 3. Typography

Font: system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`). No webfonts unless approved (the marketing `/` page may use Fraunces/Manrope as editorial pull-quotes).

### Scale
| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `type.size.display` | 48px | 700 | `tight` | Marketing hero only |
| `type.size.h1` | 32px | 700 | `tight` | Page title (one per page) |
| `type.size.h2` | 22px | 600 | `tight` | Section title |
| `type.size.h3` | 18px | 600 | `normal` | Card title, sub-head |
| `type.size.body` | 15px | 400 | `normal` | Body, default |
| `type.size.bodySm` | 13px | 400 | `normal` | Secondary body, metadata |
| `type.size.caption` | 11px | 600 | `wide` | Eyebrow, label, tab indicator (UPPERCASE) |

**Line-height:** `1.2` for h1/h2/display, `1.35` for h3, `1.5` for body/bodySm, `1.4` for caption.

**Rules:**
- One `h1` per page. Use `h2` for sections — not `h1` repeated.
- Captions are uppercase + wide tracking. Body text is never uppercase.
- Never tighten tracking on body text. Never loosen tracking on display.

---

## 4. Spacing

4px base scale: `1` (4), `2` (8), `3` (12), `4` (16), `5` (20), `6` (24), `8` (32), `10` (40), `12` (48), `16` (64).

**Rhythm:**
- Card inner padding: `space[5]` (20) on mobile, `space[6]` (24) on desktop.
- Section vertical gap: `space[10]` (40) on mobile, `space[12]` (48) on desktop.
- Stack gap inside a card: `space[3]` (12) or `space[4]` (16).
- Inline gap (icon + label): `space[2]` (8).
- Page outer padding: `space[4]` (16) on mobile, `space[6]` (24) on desktop, max-width `1200px` container.

No magic numbers. `padding: 18px` is wrong — round to `space[4]` or `space[5]`.

---

## 5. Radii

| Token | Use |
|---|---|
| `radius.xs` (6) | Tiny pills, badges inside cards |
| `radius.sm` (10) | Buttons, inputs, small chips |
| `radius.md` (14) | Inline tiles, secondary surfaces |
| `radius.lg` (20) | **Default card radius** |
| `radius.xl` (28) | Modals, sheets, hero surfaces |
| `radius.pill` | Pill chips, avatars, tag clouds |

Never mix `radius.md` and `radius.lg` on adjacent surfaces. Pick the parent's radius and use it consistently within a card group.

---

## 6. Shadow

Two-step stack (contact + ambient) — no single-blur shadows.

| Token | Use |
|---|---|
| `shadow.sm` | Default card at rest |
| `shadow.md` | Hovered card, sticky header, popover |
| `shadow.lg` | Modal, sheet, lifted state |
| `shadow.glowMagic` | AI hero surfaces (max 1/screen) |
| `shadow.glowWarm` | Primary CTA on dark hero only |

No `box-shadow: 0 4px 12px rgba(0,0,0,0.2)` in code. Token or nothing.

---

## 7. Motion

All transitions use tokenized duration + easing. Framer Motion uses the numeric variants.

### Duration
- `motion.duration.fast` (150ms) — hover, focus, micro-state.
- `motion.duration.base` (280ms) — default page/component transition.
- `motion.duration.slow` (480ms) — modal/sheet enter, hero reveal.

### Easing
- `motion.ease.out` `[0.22, 1, 0.36, 1]` — default for entrances.
- `motion.ease.inOut` `[0.65, 0, 0.35, 1]` — symmetric movements.
- `motion.ease.spring` `[0.34, 1.56, 0.64, 1]` — playful overshoot. **Use sparingly** — only on swipe-card snap, drag-to-route, and pill tabs. Never on data lists or modals.

### Hover lift
Cards may use `.dsc-lift` utility for `translateY(-4px) + shadow.lg` on hover. Single lift per row — don't stack lifts inside a list item.

### Rules
- Respect `prefers-reduced-motion` — disable lifts and slow transitions.
- No infinite-looping animations except: live pulse (`.dsc-pulse-live`), skeleton shimmer, and the AI processing indicator.
- Bouncy springs on data are noise — don't.

---

## 8. Z-index

| Layer | Token | Value |
|---|---|---|
| Base | `z.base` | 1 |
| Sticky headers | `z.sticky` | 40 |
| Overlays (drawers) | `z.overlay` | 50 |
| Modals | `z.modal` | 60 |
| Toasts | `z.toast` | 70 |

Never write `z-index: 9999`.

---

## 9. Iconography

- **lucide-react only.** No emoji in functional UI (allowed in user-generated content). The current login page's emoji-bg avatars (`{ emoji: "" }` placeholders) must be replaced with `<Avatar>` initials or images.
- Icon stroke width: `1.75` default, `2` for primary CTAs, `1.5` for decorative.
- Icon size: `16` inline, `20` for actions, `24` for nav, `32` for empty-state hero.
- Icon color inherits `currentColor` — never override unless conveying an accent meaning (e.g., `magic` for an AI badge).

---

## 10. Component primitives

Every page must compose from these. They live in `frontend/src/components/ui/`.

| Primitive | Purpose |
|---|---|
| `<Page>` | Sets `bg`, max-width container, page padding. One per route. |
| `<PageHeader>` | Title, optional back-button, actions slot. Sticky-aware. |
| `<Section>` | Vertical rhythm, optional eyebrow + title. |
| `<Card>` | Surface + border + `shadow.sm` + optional `lift`. Default radius `lg`. |
| `<Button>` | Variants: `primary` (warm), `secondary` (surface), `ghost`, `magic` (AI only), `danger`. Sizes: `sm`, `md`, `lg`. |
| `<IconButton>` | Square icon-only button. Same variants as Button. |
| `<Pill>` / `<Chip>` | Filter / tag / status. Semantic color prop (`neutral`, `warm`, `magic`, `success`, `danger`). |
| `<Eyebrow>` `<H1>` `<H2>` `<H3>` `<Body>` `<BodySm>` `<Caption>` | Type primitives — locked to the scale. |
| `<Field>` | Input/textarea wrapper. Label + helper + error states. One focus ring style. |
| `<Avatar>` | Image or initials. Sizes `sm` / `md` / `lg` / `xl`. |
| `<EmptyState>` | Hero icon + title + body + optional CTA. Used by every list when zero items. |
| `<Skeleton>` | Shimmer placeholder. Sizes match the primitive it stands in for. |
| `<Toast>` (via sonner) | Themed wrapper around existing `sonner` usage. |

**Existing `OnceUI` exports** (`Column`, `Row`, `Flex`, `Grid`, `Heading`, `Text`, `Button`, `IconButton`, `Input`, `Avatar`) are kept as a layout primitive layer — they will be re-themed to consume tokens, not replaced. New UI primitives above sit on top.

---

## 11. Page archetypes

Every page is one of five archetypes. Pick one — don't invent a sixth.

| Archetype | Routes | Shell |
|---|---|---|
| **Marketing** | `/` | Full-bleed sections, generous whitespace, may use editorial fonts and rule-breaking layouts. |
| **Auth / Status** | `/login`, `/auth/callback`, `/banned` | Centered `Card` on `bg`, no app chrome, no nav. |
| **Feed / List** | `/discover`, `/feed`, `/explore`, `/foodies`, `/group-rooms`, `/challenges`, `/hot-routes`, `/culture` | `PageHeader` (sticky) → optional filter row → virtualized list / grid. |
| **Detail / Profile** | `/profile`, `/foodies/[id]`, `/group-rooms/[id]` | Cover or identity block → tabs → tab content. |
| **Workflow** | `/ai-planner`, `/tour-builder` | Minimal chrome, full-height canvas, persistent footer with primary action. |
| **Admin** | `/admin/*` | Side nav + dense tables. Monochrome only — `warm` is reserved for destructive confirmations here, not CTAs. |

---

## 12. Dark mode

Every token has a dark-mode value already. Pages must work in both themes — never hard-code a light-only color. Toggle via `[data-theme="dark"]` on `<html>`.

---

## 13. Accessibility floor

- Contrast: 4.5:1 for body text, 3:1 for large text and UI components.
- Focus ring: visible on every interactive element via `tokens.color.borderFocus` (handled by primitives, never custom).
- Touch target: minimum 44×44px on mobile.
- Motion: respect `prefers-reduced-motion`.
- Icons paired with text or `aria-label` — never icon-only without a label.

---

## 14. What to do when you need a new value

1. Don't add it inline. Stop.
2. Check if an existing token covers the case 80% well — usually yes.
3. If genuinely missing, add to `tokens.ts` + `globals.css` `--dsc-*` block, document here, then use it.
4. Adding a new accent color requires a written justification in PR description. Default is **no**.

---

## 15. Migration status

See [`MIGRATION.md`](./MIGRATION.md) (TBD) for per-page checklist. Current status: planning. Pilot batch: `/login`, `/banned`, `/auth/callback`.
