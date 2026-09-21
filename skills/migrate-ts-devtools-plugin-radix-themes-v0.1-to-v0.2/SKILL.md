---
name: migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
description: |
  Use this skill to migrate projects from ts-devtools-plugin-radix-themes
  v0.1.x to v0.2.x. It covers the RadixThemeDevtoolsProvider rename, the new
  subpath exports (/provider and /plugin), and the inline instantiation
  pattern needed to keep devtools code out of the production bundle.
command: /migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
---

# Migrating ts-devtools-plugin-radix-themes v0.1 → v0.2

## Breaking changes

1. **Provider renamed**: `RadixThemeDevtoolsProvider` → `RadixThemeProvider`.
2. **Provider signature**: it no longer accepts `plugin`; it accepts `defaultTheme`.
3. **New subpath exports**: `/provider` (prod-safe, no devtools deps) and `/plugin` (dev-only). The barrel still exists but defeats tree-shaking.
4. **Inline pattern required**: instantiate `createRadixThemePlugin(...)` inside the `plugins={[…]}` array of `<TanStackDevtools>`. Do NOT assign it to a top-level `const` — that stops `@tanstack/devtools-vite` from stripping the code in prod and leaves ~3 KB gz of devtools in the bundle.
5. **Type removed**: `RadixThemeDevtoolsProviderProps` is gone. Use `RadixThemeProviderProps`.
6. **Optional peer dep**: `@tanstack/devtools-event-client` moves to `peerDependenciesMeta.optional` — you only need it if you import from `/plugin`.

## Migration order

### Step 1 — Check that this applies

Read the project's `package.json`. If `ts-devtools-plugin-radix-themes` is not there, abort and tell the user. If the version is already `^0.2.0` or greater, abort.

In monorepos, look in `pnpm-workspace.yaml` under `catalog:` too, and in each `apps/*` and `packages/*` `package.json`.

### Step 2 — Bump the version

Set the version to `^0.2.0`:

- Plain `package.json`: edit the line.
- pnpm catalog: update `pnpm-workspace.yaml` → `catalog.ts-devtools-plugin-radix-themes: ^0.2.0`.

Run the project's package manager to regenerate the lockfile (read `packageManager` in the root `package.json`). E.g. `pnpm install`, `npm install`, `yarn install`.

### Step 3 — Locate the usages

Run these greps from the project root:

```bash
grep -rn "RadixThemeDevtoolsProvider" --include="*.ts" --include="*.tsx" .
grep -rn "createRadixThemePlugin" --include="*.ts" --include="*.tsx" .
grep -rn "from 'ts-devtools-plugin-radix-themes'" --include="*.ts" --include="*.tsx" .
grep -rn "RadixThemeDevtoolsProviderProps" --include="*.ts" --include="*.tsx" .
```

List every file that comes back before touching any of them.

### Step 4 — Migrate the provider

Change the import to the `/provider` subpath, rename the component, and replace the `plugin` prop with `defaultTheme`. The value of `defaultTheme` is the same object previously passed to `createRadixThemePlugin({ defaultTheme: … })`; extract it to a reusable `const` if it lives inline.

BEFORE:

```tsx
import {
  RadixThemeDevtoolsProvider,
  createRadixThemePlugin,
} from 'ts-devtools-plugin-radix-themes'

const themePlugin = createRadixThemePlugin({
  defaultTheme: { accentColor: 'indigo', radius: 'medium' },
})

<RadixThemeDevtoolsProvider plugin={themePlugin}>
  {children}
</RadixThemeDevtoolsProvider>
```

AFTER:

```tsx
import { RadixThemeProvider } from 'ts-devtools-plugin-radix-themes/provider'

const defaultTheme = { accentColor: 'indigo', radius: 'medium' } as const

<RadixThemeProvider defaultTheme={defaultTheme}>
  {children}
</RadixThemeProvider>
```

### Step 5 — Move `<TanStackDevtools plugins=[…]>` to inline

Change the import to `/plugin` and move the `createRadixThemePlugin(...)` call **inside** the `plugins={[…]}` array. Delete any previous `const themePlugin = createRadixThemePlugin(...)`.

BEFORE:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes'

const themePlugin = createRadixThemePlugin({ defaultTheme })

<TanStackDevtools plugins={[themePlugin]} />
```

AFTER:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin'

;<TanStackDevtools
  plugins={[
    createRadixThemePlugin({ defaultTheme }),
    // …other plugins
  ]}
/>
```

Reuse exactly the same `defaultTheme` object you passed to the provider in step 4.

### Step 6 — Clean up removed types

Replace `RadixThemeDevtoolsProviderProps` with `RadixThemeProviderProps` imported from `/provider`:

```tsx
// before
import type { RadixThemeDevtoolsProviderProps } from 'ts-devtools-plugin-radix-themes'

// after
import type { RadixThemeProviderProps } from 'ts-devtools-plugin-radix-themes/provider'
```

### Step 7 — Verify typecheck, lint, tests and build

Read the project's `package.json` scripts and run what applies, in this order:

```bash
pnpm typecheck   # or tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Resolve any errors. The usual ones are:

- Leftover barrel imports: switch them to a subpath.
- Types broken by `RadixThemeDevtoolsProviderProps`: see step 6.
- Tests mocking the package: the `vi.mock(...)` path must be `/provider` or `/plugin`, depending on what it mocks.

### Step 8 — Verify the prod devtools strip (only if the project uses `@tanstack/devtools-vite`)

Check that `vite.config.ts` includes `devtools()` from `@tanstack/devtools-vite` ahead of the other plugins. If it does not, suggest adding it — without it the plugin still weighs on prod:

```ts
import { devtools } from '@tanstack/devtools-vite'

plugins: [devtools() /* …rest */]
```

After the build, look for the `[@tanstack/devtools-vite] Removed devtools code from: ...` line in the log. If a bundle analyzer is available, confirm that `dist/plugin*.js` and `@tanstack/devtools-event-client` do NOT appear in the prod bundle.

## Common patterns

### Pattern A — Centralised provider with tenant config

Wrappers such as `RadixThemesProvider` or `AppShell` that wrapped `<RadixThemeDevtoolsProvider plugin={...}>` must be renamed and pass `defaultTheme` directly:

```tsx
// before
const RadixThemesProvider = ({ children }) => (
  <RadixThemeDevtoolsProvider plugin={themePlugin}>{children}</RadixThemeDevtoolsProvider>
)

// after
const RadixThemesProvider = ({ children }) => (
  <RadixThemeProvider defaultTheme={TENANT_CONFIG.radixThemesConfig}>{children}</RadixThemeProvider>
)
```

### Pattern B — A file dedicated to the plugin (`integrations/radix-themes/*.plugin.ts`)

If there is a file whose only purpose is to create and export the plugin (typically `radix-themes.plugin.ts`):

- If only `<TanStackDevtools>` consumes it: **delete the file** and move the call inline into the JSX where `<TanStackDevtools>` is mounted.
- If the provider consumes it too (the old pattern): extract **only the `defaultTheme` object** to a shared file (e.g. `radix-themes.config.ts`) and delete the plugin creation from there.

### Pattern C — Monorepo with several apps

Each app has its own `<TanStackDevtools>` and its own provider. Repeat steps 4–7 per app. The `defaultTheme` can live in a shared workspace package.

### Pattern D — Tests mocking the package

Change the `vi.mock` path:

```tsx
// before
vi.mock('ts-devtools-plugin-radix-themes', () => ({ … }))

// after: mock only the subpath relevant to that test
vi.mock('ts-devtools-plugin-radix-themes/provider', () => ({ … }))
```

## Wrap-up

Report to the user:

1. Files changed (count).
2. Results of typecheck / lint / test / build.
3. Whether `@tanstack/devtools-vite` is in use and the strip log shows up.
4. Ambiguous patterns you left alone, if any.

If later versions have been published, tell the user the next hop has its own skill:

```bash
npx skills add jperezmart/radix-themes-devtools-ts
```

```
/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
```

Tell the user to remove this skill once the migration is committed:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

Or to delete it by hand from their client's skills directory (Claude Code: `~/.claude/skills/`, Cursor: `~/.cursor/skills/`, etc.). Keeping old migration skills around pollutes the context of future sessions.
