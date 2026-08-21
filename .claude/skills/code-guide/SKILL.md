---
name: code-guide
description: Coding style and conventions for astro-starter — TypeScript, Astro components, client-side scripts, Tailwind 4, content collections, paraglide i18n, and value maps. Consult when writing or reviewing code.
---

# Code Guide

Style and pattern reference for the astro-starter codebase. Consult before
writing or reviewing any code.

---

## Comments

Comments are allowed (unlike some sibling repos) — the linter doesn't ban
them and the codebase already has JSDoc on exported utils (`src/utils/lqip.ts`)
and the occasional inline comment explaining a non-obvious workaround
(`src/pages/og/[id].jpg.ts`). Keep the bar high: explain the *why* (a hidden
constraint, a browser quirk, a workaround), not the *what* — clear names and
structure should cover the what. Don't add comments that just restate the
next line.

`eslint-disable` comments are not banned outright, but they're rare in this
repo (one instance, justified by a real type gap in `satori`'s types) — reach
for a real fix first.

---

## TypeScript

- `noUncheckedIndexedAccess` is on — guard or `??` index accesses
- Non-null assertions (`!`) are lint-banned — guard instead (some pre-existing
  violations remain as tracked debt; see the `check` skill's Notes — don't add
  more)
- Type assertions (`as`) are allowed and already used where the type system
  genuinely can't infer something (DOM event narrowing in
  `Lightbox.astro`, `as Record<string, unknown>` for MDX component props) —
  but reach for correct typing first; don't use `as` to silence a real
  mismatch
- Use `type` for all type definitions (not `interface`) — lint-enforced
  (`@typescript-eslint/consistent-type-definitions`)
- Use the `type` keyword on type-only imports: `import type { Foo } from '...'`
- Named exports only; no default exports in `.ts` files
- Always use the `@/` path alias — parent-relative `../` imports are
  lint-banned (sibling `./` imports are fine)
- Prefer `const`; use `let` for state that's genuinely mutable in place (loop
  accumulators, client-script counters like `current`/`pointerStartX` in
  `Lightbox.astro`) rather than as a default

---

## Astro components

- Declare `type Props` and destructure from `Astro.props`
- Accept `class?: string`, alias it (`class: className`), and compose with
  `class:list={[className, '...']}` — there's no `cn` helper in this repo,
  don't import one
- Fetch content in the frontmatter with `astro:content` APIs
  (`getCollection`, `render`) — never read files directly
- Optimise images with `astro:assets` / the project's `@unpic/astro` image
  service (configured in `astro.config.ts` with `lqip` placeholders); see
  `src/utils/lqip.ts` for the placeholder generator

```astro
---
type Props = {
  slug: string
  class?: string
}

const { slug, class: className } = Astro.props
---

<article class:list={[className, 'flex flex-col gap-4']}>
  <slot />
</article>
```

---

## Client-side interactivity

This project has no framework islands (no React/Svelte/Vue) — interactivity is
plain `<script lang="ts">` inside the `.astro` file that needs it (see
`Lightbox.astro`, `Cover.astro`). Conventions:

- Query with `document.querySelectorAll<T>(...)` and narrow with the generic,
  not a cast, where possible
- Wire behavior with `data-*` attributes (`data-action="close"`,
  `data-gallery-id`) rather than IDs or classes, so styling stays decoupled
  from behavior hooks
- Keep scripts scoped to the component's own DOM subtree
  (`dialog.querySelector(...)`) rather than querying the whole document,
  except for delegating a single top-level listener (see the
  `gallery:open` `CustomEvent` pattern in `Lightbox.astro`)

---

## Styling (Tailwind 4)

Tailwind utilities only — no ad-hoc CSS files, no inline `style` for anything
Tailwind can express. Font tokens live in `src/styles/global.css` via
`@theme`: `font-head` (Playfair Display), `font-text` (Inter).

- Motion/entrance animations use the `tailwindcss-motion` plugin's
  `motion-*` utilities directly (`motion-opacity-in-0`,
  `motion-translate-x-in-[-2rem]`, `motion-duration-700`,
  `motion-delay-200`) — see `Cover.astro`. There's no custom `@utility`
  animation layer to extend; reach for `motion-*` first.
- No brand/per-entity color theming system exists yet — use Tailwind's
  default palette or extend `@theme` in `global.css` if a new token is
  genuinely needed project-wide.

---

## Content and routing

- Content lives in `src/content/events` as MDX, defined once in
  `src/content.config.ts` (a single Zod schema — no dual-schema CMS to keep in
  sync). Adding or renaming a field means updating that schema and the MDX
  frontmatter.
- Locale routing uses Astro's built-in i18n (`prefixDefaultLocale: false` in
  `astro.config.ts`): English is unprefixed, Czech pages are mirrored under
  `src/pages/cs/**`. When adding a page, add both the default-locale file and
  its `cs/` counterpart, and build cross-links with `getRelativeLocaleUrl`
  from `astro:i18n` — never hardcode a `/cs/...` path.
- User-facing UI strings (labels, aria-labels, alt text) go through
  paraglide: `import * as m from '@/paraglide/messages'`, then `m.key_name()`.
  Message source lives in `messages/en.json` / `messages/cs.json`
  (`project.inlang`); `src/paraglide/**` is generated by
  `paraglide-js compile` (part of `pnpm build`) — never hand-edit it. Content
  body text (MDX) is authored directly, not run through paraglide.
- Read env through `astro:env/client` / `astro:env/server` as declared in
  `env.config.ts` — never `process.env` in app code.

---

## Value maps

Do not use `if`/ternary chains or `switch` to select a value from a known set.
Use a module-level constant map instead:

```ts
// ❌ Breaks silently when a new locale is added
const dateLocale = locale === 'cs' ? 'cs-CZ' : 'en-US'

// ✅ Exhaustiveness enforced by the type
const DATE_LOCALES = {
  cs: 'cs-CZ',
  en: 'en-US',
} as const satisfies Record<Locale, string>

const dateLocale = DATE_LOCALES[locale]
```

Always use `as const satisfies Record<KnownUnion, Value>` — `as const`
preserves literal types, `satisfies` enforces exhaustiveness at compile time.
Never use `Partial<Record<string, ...>>` — it silently accepts unknown keys
and defeats the exhaustiveness check.

Use `switch` only for executing side effects per variant, never for computing
a value.

---

## Conditionals

Use `if` only for guards and genuinely boolean checks (`if (!post)`,
`if (delta < -50)`). For variant selection, use a value map (see above).

---

## Type narrowing

`narrowland` is a project dependency (currently unused — see the `check`
skill's Notes) that provides type guards; reach for it instead of manual
comparisons when it genuinely replaces a multi-part check:

```ts
import { isDefined, isNonEmptyArray, isNotNull, isOneOf } from 'narrowland'
```

| Pattern to replace         | narrowland equivalent     |
| --------------------------- | -------------------------- |
| `a === 'x' \|\| a === 'y'` | `isOneOf(a, ['x', 'y'])`  |
| `a !== 'x' && a !== 'y'`   | `!isOneOf(a, ['x', 'y'])` |
| `arr.length > 0`           | `isNonEmptyArray(arr)`     |
| `arr.length === 0`         | `isEmptyArray(arr)`        |
| `value !== null`           | `isNotNull(value)`         |
| `value !== undefined`      | `isDefined(value)`         |

Single comparisons that aren't about membership (a lone `!== null`, a simple
boolean check) are fine as-is — reach for narrowland when it replaces a
multi-part check or adds semantic clarity, not reflexively.

---

## Accessibility

- ESLint runs `flat/jsx-a11y-strict` on `.astro` — it fails the build, not
  warns (one pre-existing violation in `Footer.astro`, see `check` skill)
- Use appropriate `aria-*` attributes on interactive UI (dialogs, buttons) —
  see `Lightbox.astro`'s `aria-label`s sourced from paraglide messages
- Ensure keyboard interaction for dialogs (`Lightbox.astro`'s
  `ArrowLeft`/`ArrowRight` handling, native `<dialog>` `cancel` event) and
  manage focus/scroll-lock deliberately

---

## Checks

After every task run the **`check`** skill (lint, Prettier, types, Knip) and
fix all *new* errors. There is no test framework in this repo (no Vitest/Jest
dependency) — do not add test files or assume one exists.
