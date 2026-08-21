---
name: check
description: Run the full static-check suite for astro-starter — ESLint, Prettier, TypeScript, and Knip — and fix any failures. Use when asked to check, verify, or QA the code (e.g. "run the checks", "is it clean?", before committing/deploying).
---

# Static checks (astro-starter)

Run all four checks, then fix everything until they pass clean. The combined
command is `pnpm check` (runs all four in parallel); when something fails, run
the checks individually so you see every problem, fix them, and re-run.

## The four checks

Run each from the repo root:

| Check     | Command             | Auto-fix            |
| --------- | -------------------- | ------------------- |
| Lint      | `pnpm lint:check`   | `pnpm lint:fix`     |
| Format    | `pnpm format:check` | `pnpm format:write` |
| Types     | `pnpm typecheck`    | manual              |
| Dead code | `pnpm knip`         | manual               |

Or all at once: `pnpm check`.

`format:check` and `format:write` share a glob (`**/*.{ts,tsx,js,cjs,json,svg}`),
so anything the check flags, the write fixes. `.astro` files are **not** in that
glob — they are linted but not format-checked by the script. The plugins
(`prettier-plugin-astro`) are installed, so if you want to format one you
touched, do it explicitly: `pnpm exec prettier --write 'src/**/*.astro'`.

`.prettierignore` currently only excludes `**/*.svg` — it does not exclude
`src/paraglide/**`, `dist/`, `.astro/`, or `.vercel/` (see Notes below).

## How to fix

1. **Prettier** — run `pnpm format:write`; it rewrites to the configured style
   (no semicolons, single quotes, width 90, sorted import groups via
   `@ianvs/prettier-plugin-sort-imports`, Tailwind class sorting). Never
   hand-format.
2. **ESLint** — run `pnpm lint:fix` for the auto-fixable rules, then hand-fix
   the rest. Config is `eslint.config.js`
   (`strictTypeChecked` + `stylisticTypeChecked` + sonarjs + astro +
   `flat/jsx-a11y-strict` + `unused-imports`).
   - Use the `@/` alias — parent-relative (`../`) imports are lint-banned;
     sibling `./` imports are fine.
   - `type` over `interface` (lint-enforced); no default `react` import.
   - Non-null assertions (`!`) are lint-banned
     (`@typescript-eslint/no-non-null-assertion`) — guard or use `??` instead.
     A few pre-existing violations remain (see Notes); don't add new ones.
   - Unused vars/imports are errors, not warnings (`unused-imports` plugin) —
     prefix a genuinely-unused binding with `_` rather than disabling the rule.
3. **TypeScript** — `noUncheckedIndexedAccess` is on (`tsconfig.json`), so guard
   or `??` index accesses. `pnpm typecheck` runs `tsc` over the whole repo.
   - If content-collection types look stale, run `pnpm astro sync` to
     regenerate `.astro/types.d.ts`, then re-run typecheck.
4. **Knip** — `knip.config.ts` scopes Astro entries (`src/pages/**`,
   `src/content.config.ts`) and ignores `src/paraglide/**` (generated) plus
   `@iconify-json/ph` / `eslint-plugin-jsx-a11y` as implicitly-used deps.
   Resolve findings by deleting unused files, un-exporting internal-only
   symbols, or removing unused deps. If a dep is used implicitly (not
   import-referenced), add it to `ignoreDependencies` instead of removing it.

## Notes

`pnpm check` is **not currently green** on `main`. Until it's cleaned up, the
practical bar is **no *new* findings in files you touch** — don't feel obliged
to fix unrelated pre-existing issues as a side effect of an unrelated task, but
mention them if you notice them blocking your own work. Known baseline
findings as of 2026-08-21:

- **`src/paraglide/**`** is generated output (from `paraglide-js compile`, run
  as part of `pnpm build`) and is untracked by git, but it isn't excluded from
  the Prettier or ESLint globs the way `knip.config.ts` excludes it. If it's
  present on disk, `format:check` and `lint:check` will flag ~20+ files in it
  that you didn't write and shouldn't hand-edit. Don't try to "fix" these —
  either ignore them or (if asked) add `src/paraglide/` to `.prettierignore`
  and to ESLint's `globalIgnores`.
- Several root config files show Prettier drift (`env.config.ts`,
  `eslint.config.js`, `prettier.config.js`, `tailwind.config.ts`,
  `src/middleware.ts`) — they predate/bypass the repo's own style config
  (double quotes + semicolons instead of single quotes + no semicolons).
- `src/pages/og/[id].jpg.ts` has pre-existing type errors (satori `FontOptions`
  union including `null`, `Buffer` vs `BodyInit`) and lint errors (non-null
  assertions, numeric template-literal expressions).
- `src/utils/schema.ts` has a pre-existing type error (`member` isn't a valid
  `PersonLeaf` property — likely meant `memberOf`, or the `schema-dts` type
  needs a cast).
- `src/components/Lightbox.astro` has two pre-existing non-null assertions.
- `src/components/Footer.astro` has a pre-existing `anchor-is-valid` a11y
  error.
- `narrowland` is a declared dependency Knip currently reports as unused —
  either use it somewhere (see the `code-guide` skill for its type-guard
  patterns) or leave it; don't silently delete it as part of an unrelated task.

Delete this Notes section once `pnpm check` is actually green.

## Done criterion

`pnpm check` exits 0 (all four clean). Report a short summary of what each
check found and what you changed.
