---
name: migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
description: |
  Use this skill to migrate projects from ts-devtools-plugin-radix-themes
  v0.2.x to v0.3.x. The upgrade is additive: it covers the one shape change
  (`render` goes from a JSX element to a function), the new floor on the
  optional @tanstack/devtools-event-client peer, and the optional adoption of
  `id`, `defaultOpen` and the /plugin-noop entry point.
command: /migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
---

# Migrating ts-devtools-plugin-radix-themes v0.2 → v0.3

> **Read this before touching anything.** Unlike `0.1` → `0.2`, this upgrade is
> additive. In most projects the only real change is the version number, and
> steps 3–5 find nothing to modify. That is a correct outcome, not a failure of
> the skill: report it as such rather than inventing changes to justify the run.

## Changes that can affect a consumer

1. **`render` is now a function**, not a JSX element. It is the only form the
   devtools shell passes its props to (`theme`, `devtoolsOpen`). If the plugin
   object goes whole into `plugins={[…]}` — the documented usage — the shell
   accepts both forms and there is nothing to do. It only breaks code that
   reads `plugin.render` itself.
2. **Higher floor on an optional peer**: `@tanstack/devtools-event-client` goes
   from `>=0.0.1` to `>=0.4.0`. The old range accepted versions predating the
   `EventClient` API the plugin calls.

## New, optional

None of these are required. Offer them only where they fit.

- **`id`**: the plugin now declares a stable `'radix-themes'`, so the shell can
  persist whether the panel is open. It used to generate a random one per load.
  Override it only to mount the plugin twice.
- **`defaultOpen`**: open the panel on first load.
- **Shell appearance**: the panel follows the shell into dark mode instead of
  drawing itself with fixed light colours. Automatic, nothing to configure.
- **`/plugin-noop`**: a new entry point exporting
  `createRadixThemeNoOpPlugin()`, for swapping the panel out in production
  builds.

## Migration order

### Step 1 — Check that this applies

Read the project's `package.json`. If `ts-devtools-plugin-radix-themes` is not
there, abort and tell the user.

- If the version is `0.1.x`, **abort** and tell them to run
  `/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2` first. This skill
  assumes the `0.2` API shape.
- If it is already `^0.3.0` or greater, abort.

In monorepos, look in `pnpm-workspace.yaml` under `catalog:` too, and in each
`apps/*` and `packages/*` `package.json`.

### Step 2 — Bump the version

Set the version to `^0.3.0`:

- Plain `package.json`: edit the line.
- pnpm catalog: update `pnpm-workspace.yaml` →
  `catalog.ts-devtools-plugin-radix-themes: ^0.3.0`.

Run the project's package manager to regenerate the lockfile (read
`packageManager` in the root `package.json`). E.g. `pnpm install`,
`npm install`, `yarn install`.

### Step 3 — Look for direct uses of `.render`

This is the only change that can break. Search for property access:

```bash
grep -rn "\.render" --include="*.ts" --include="*.tsx" .
```

Filter the noise (`ReactDOM.render`, `root.render`, testing-library's
`render(`) and keep only those operating on the object
`createRadixThemePlugin(...)` returns. Most projects will have none.

If there are any:

BEFORE:

```tsx
const plugin = createRadixThemePlugin({ defaultTheme })

<div>{plugin.render}</div>
```

AFTER:

```tsx
const plugin = createRadixThemePlugin({ defaultTheme })

<div>{plugin.render(el, { theme: 'light', devtoolsOpen: true })}</div>
```

The first argument is the mount element the shell passes; outside the shell any
`HTMLElement` will do, as it is not used for rendering.

### Step 4 — Check the optional peer

Only applies if the project imports from `/plugin`. Check the resolved version:

```bash
npm ls @tanstack/devtools-event-client
```

If it is below `0.4.0`, raise it. If the package manager warns about an unmet
peer and the project never imports `/plugin`, the warning is ignorable — the
peer is optional.

### Step 5 — Offer the new options (optional)

Do not apply these unprompted. Ask the user only about the ones that match what
you see in the repo:

- Do they want the panel open by default? →
  `createRadixThemePlugin({ defaultTheme, defaultOpen: true })`.
- Do they mount `<TanStackDevtools>` somewhere shared where importing
  `/plugin` conditionally is awkward? → offer the factory swap with
  `/plugin-noop`:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin'
import { createRadixThemeNoOpPlugin } from 'ts-devtools-plugin-radix-themes/plugin-noop'

const createPlugin =
  process.env.NODE_ENV === 'development'
    ? createRadixThemePlugin
    : createRadixThemeNoOpPlugin
```

If the project already imports `/plugin` in development only, do **not** offer
`/plugin-noop`: it already has the better option and the swap would only add
noise.

### Step 6 — Verify typecheck, lint, tests and build

Read the project's `package.json` scripts and run what applies, in this order:

```bash
pnpm typecheck   # or tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Resolve any errors. The usual ones are:

- Tests asserting on the plugin object's shape (e.g.
  `expect(isValidElement(plugin.render)).toBe(true)`): `render` is a function
  now.
- Snapshots capturing the plugin object: they have new keys (`id`,
  `defaultOpen`). Update them.

## Common patterns

### Pattern A — Nothing to change

The most frequent one. The project passes
`createRadixThemePlugin({ defaultTheme })` inline inside `plugins={[…]}` and
never touches `render`. Bump, verify, done. Tell the user plainly that there
were no code changes: that is useful information, not a non-result.

### Pattern B — Monorepo with several apps

The version bump may be single (catalog) or per app. Steps 3 and 4 repeat per
app, but normally find nothing.

### Pattern C — A wrapper of their own around the plugin

If the project wraps `createRadixThemePlugin` in its own factory, check whether
that wrapper rebuilds the object by hand instead of returning it whole. If it
does, add `id` and `defaultOpen` to what it forwards, or the panel loses its
persisted open state.

## Wrap-up

Report to the user:

1. Previous and new version.
2. Files changed (count). **Zero is a valid and expected outcome.**
3. Results of typecheck / lint / test / build.
4. Which new options you offered, and which they took.

Tell the user to remove this skill once the migration is committed:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
```

Or to delete it by hand from their client's skills directory (Claude Code:
`~/.claude/skills/`, Cursor: `~/.cursor/skills/`, etc.). Keeping old migration
skills around pollutes the context of future sessions.
