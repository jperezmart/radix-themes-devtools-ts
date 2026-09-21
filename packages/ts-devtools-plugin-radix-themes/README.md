# ts-devtools-plugin-radix-themes

[![npm version](https://img.shields.io/npm/v/ts-devtools-plugin-radix-themes.svg)](https://www.npmjs.com/package/ts-devtools-plugin-radix-themes)
[![license](https://img.shields.io/npm/l/ts-devtools-plugin-radix-themes.svg)](./LICENSE)

A [TanStack Devtools](https://tanstack.com/devtools/latest) plugin that lets you customize your [Radix UI Themes](https://www.radix-ui.com/themes) in real time — directly from the devtools panel.

Change accent color, gray, radius, scaling, appearance and panel background without touching your code, and see the changes live in your app.

> **Note:** TanStack Devtools is currently in alpha, so APIs may change.

---

## Requirements

| Peer dependency                   | Version   | Notes                            |
| --------------------------------- | --------- | -------------------------------- |
| `react`                           | `≥ 18`    |                                  |
| `react-dom`                       | `≥ 18`    |                                  |
| `@radix-ui/themes`                | `≥ 3`     |                                  |
| `@tanstack/devtools-event-client` | `≥ 0.0.1` | Optional, only needed in dev (1) |

(1) Only required if you import the `/plugin` entry point. The `/provider` entry has no devtools dependency.

---

## Installation

```bash
npm install ts-devtools-plugin-radix-themes
# or
pnpm add ts-devtools-plugin-radix-themes
# or
yarn add ts-devtools-plugin-radix-themes
```

You also need TanStack Devtools for your framework:

```bash
npm install @tanstack/react-devtools @tanstack/devtools-event-client
```

---

## Usage

The package exposes independent entry points so that the dev-only code can be stripped from your production bundle:

| Entry                                         | Used in        | What it ships                                               |
| --------------------------------------------- | -------------- | ----------------------------------------------------------- |
| `ts-devtools-plugin-radix-themes/provider`    | **dev + prod** | `<RadixThemeProvider>` — wraps Radix's `<Theme>`            |
| `ts-devtools-plugin-radix-themes/plugin`      | **dev only**   | `createRadixThemePlugin()` — panel + event client           |
| `ts-devtools-plugin-radix-themes/plugin-noop` | **prod**       | `createRadixThemeNoOpPlugin()` — tab metadata, nothing else |
| `ts-devtools-plugin-radix-themes` (barrel)    | convenience    | re-exports all of them (no tree-shaking advantage)          |

### 1. Wrap your app with `<RadixThemeProvider>`

Use it where you would normally put Radix's `<Theme>`. It works the same way in both dev and prod — in prod it just renders a static `<Theme>` because no devtools events ever fire.

```tsx
import { RadixThemeProvider } from 'ts-devtools-plugin-radix-themes/provider';
import '@radix-ui/themes/styles.css';

const defaultTheme = {
  accentColor: 'indigo',
  grayColor: 'slate',
  appearance: 'light',
  radius: 'medium',
  scaling: '100%',
  panelBackground: 'translucent',
} as const;

export function App({ children }) {
  return (
    <RadixThemeProvider defaultTheme={defaultTheme}>
      {children}
    </RadixThemeProvider>
  );
}
```

### 2. Register the plugin with TanStack Devtools

Create the plugin **inline** in the `plugins` array. That way, when [`@tanstack/devtools-vite`](https://www.npmjs.com/package/@tanstack/devtools-vite) strips the `<TanStackDevtools>` JSX in production, the import to `/plugin` becomes unused and is fully tree-shaken — including the transitive `@tanstack/devtools-event-client`.

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin';

export function Root({ children }) {
  return (
    <>
      {children}
      <TanStackDevtools
        plugins={[
          createRadixThemePlugin({ defaultTheme }),
          // ...other plugins
        ]}
      />
    </>
  );
}
```

That's it. Open the TanStack Devtools panel and go to the **Radix Themes** tab — changes are pushed to the provider via the bus and `<Theme>` re-renders with the new props.

> **Tip:** assigning the plugin to a top-level `const` and passing it into `plugins={[themePlugin]}` works too, but defeats tree-shaking: the top-level call is a side effect that Rolldown/Rollup can't drop. Prefer the inline form above.

---

## How it works (and why two entries)

`<RadixThemeProvider>` subscribes to two native `CustomEvent`s on `window`:

- `radix-themes:theme-changed` → new theme props are pushed via `event.detail.payload`
- `radix-themes:theme-reset` → fall back to `defaultTheme`

These are the same events that `@tanstack/devtools-event-client` dispatches when the panel calls `client.emit(...)`. By listening to the wire format directly, the provider needs **zero devtools imports**, so prod bundles carry only Radix's `<Theme>` plus a tiny `useEffect`.

The plugin/panel side (`/plugin`) still uses `EventClient` because that's what TanStack Devtools wires into its bus router.

---

## API

### `RadixThemeProvider`

| Prop           | Type                  | Required | Default | Description                                          |
| -------------- | --------------------- | -------- | ------- | ---------------------------------------------------- |
| `defaultTheme` | `RadixThemeConfig`    |          | `{}`    | Initial values, also used by the `theme-reset` event |
| `children`     | `React.ReactNode`     | ✅       | —       |                                                      |
| `className`    | `string`              |          |         | Forwarded to `<Theme>`                               |
| `style`        | `React.CSSProperties` |          |         | Forwarded to `<Theme>`                               |

The latest theme is kept in a module-level cache so it survives provider remounts within the same session.

### `createRadixThemeNoOpPlugin(options?)`

The production counterpart of `createRadixThemePlugin`, mirroring the
`NoOpPlugin` half of the `[Plugin, NoOpPlugin]` tuple that
[`createReactPlugin`](https://tanstack.com/devtools/latest/docs/devtools-utils)
returns. Same tab metadata, a `render` that draws nothing, no event client.

Reach for it when the app builds its `plugins` array in one shared place and
importing `/plugin` conditionally is awkward. Swapping the factory lets the
bundler fold the branch and drop the panel and the bus entirely:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin';
import { createRadixThemeNoOpPlugin } from 'ts-devtools-plugin-radix-themes/plugin-noop';

const createPlugin =
  process.env.NODE_ENV === 'development'
    ? createRadixThemePlugin
    : createRadixThemeNoOpPlugin;
```

It lives on its own entry point deliberately: `/plugin` constructs the event
client and calls `lazy(() => import('./panel'))` at module scope, so merely
importing that module pulls both into the bundle no matter which factory you
call.

> Upstream's `createReactPlugin` is not used directly because it is ESM-only
> and this package publishes CJS entries. A conformance test keeps the plugin
> objects matching the shape it produces.

### `createRadixThemePlugin(options?)`

Creates the plugin object to pass to `<TanStackDevtools plugins={[...]} />`.

| Option         | Type               | Default          | Description                                                                                     |
| -------------- | ------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| `defaultTheme` | `RadixThemeConfig` | —                | Initial theme values for the panel.                                                             |
| `id`           | `string`           | `'radix-themes'` | Key the shell persists this panel's open/closed state under. Override only to mount twice.      |
| `defaultOpen`  | `boolean`          | `false`          | Open this panel on first load, before the shell has a stored choice. At most three may be open. |

The panel follows the devtools shell's own light/dark appearance: the shell
passes it down through `render`, so the panel chrome stays legible in both.

Returns `{ name, render, client }`. The `client` is the underlying `RadixThemeEventClient` if you want to listen to theme changes programmatically — though most apps don't need it.

### `RadixThemeConfig`

All fields are optional and map 1:1 to Radix's `<Theme>` props:

```ts
type RadixThemeConfig = {
  accentColor?: ThemeProps['accentColor']; // 'indigo' | 'blue' | 'mint' | ...
  grayColor?: ThemeProps['grayColor']; // 'gray' | 'mauve' | 'slate' | ...
  appearance?: ThemeProps['appearance']; // 'light' | 'dark'
  radius?: ThemeProps['radius']; // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling?: ThemeProps['scaling']; // '90%' | '95%' | '100%' | '105%' | '110%'
  panelBackground?: ThemeProps['panelBackground']; // 'solid' | 'translucent'
};
```

---

## Migrating from `0.2.x`

**In the common case there is nothing to do.** Upgrade and carry on — the
`0.3.0` release is additive. It is a minor rather than a patch because on a
`0.x` line that is the signal for "read this first", not because the documented
API moved.

> **Automated migration:** there is an [Agent Skill](https://github.com/jperezmart/radix-themes-devtools-ts/tree/main/skills/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3) that bumps the version, checks the two items below and offers the new options. Install with `npx skills add jperezmart/radix-themes-devtools-ts` and run `/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3` from Claude Code, Cursor, Codex or any [skills.sh](https://www.skills.sh/)-compatible client. Coming from `0.1.x`? Run the `v0.1-to-v0.2` skill first.

Two things did change, and neither affects code that follows this README:

**`createRadixThemePlugin()` now returns `render` as a function** instead of a
JSX element, which is the only form the devtools shell passes its props to. If
you pass the whole plugin object into `<TanStackDevtools plugins={[…]} />` —
the documented usage — the shell accepts both forms and you will not notice.
You only need to act if you read `plugin.render` yourself:

```tsx
// Before
<div>{plugin.render}</div>

// After
<div>{plugin.render(el, { theme: 'light', devtoolsOpen: true })}</div>
```

**The optional `@tanstack/devtools-event-client` peer floor moved** from
`>=0.0.1` to `>=0.4.0`. The old range accepted versions predating the
`EventClient` API this plugin calls. If your package manager warns about an
unmet peer, upgrade that package; if you never import `/plugin`, ignore it.

### What's new

|                  |                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | The plugin now declares a stable `'radix-themes'`, so the shell can persist whether the panel is open. Override it only to mount the plugin twice. |
| `defaultOpen`    | Open the panel on first load.                                                                                                                      |
| Shell appearance | The panel follows the devtools shell into dark mode instead of drawing itself with fixed light colours.                                            |
| `/plugin-noop`   | A new entry point exporting `createRadixThemeNoOpPlugin()`, for swapping the panel out in production builds.                                       |

---

## Migrating from `0.1.x`

The `0.2.0` release reshapes the API so the provider stops pulling devtools code into production bundles.

> **Automated migration:** there is an [Agent Skill](https://github.com/jperezmart/radix-themes-devtools-ts/tree/main/skills/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2) that performs every step below (rename, split imports, inline plugin instantiation, typecheck & build). Install with `npx skills add jperezmart/radix-themes-devtools-ts` and run `/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2` from Claude Code, Cursor, Codex or any [skills.sh](https://www.skills.sh/)-compatible client.

| Before (`0.1.x`)                                                  | After (`0.2.0`)                                                                   |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `import { RadixThemeDevtoolsProvider } from '…'`                  | `import { RadixThemeProvider } from '…/provider'`                                 |
| `import { createRadixThemePlugin } from '…'`                      | `import { createRadixThemePlugin } from '…/plugin'`                               |
| `<RadixThemeDevtoolsProvider plugin={themePlugin}>`               | `<RadixThemeProvider defaultTheme={defaultTheme}>`                                |
| `const themePlugin = createRadixThemePlugin({…})` at module scope | Call `createRadixThemePlugin({…})` **inline** inside `<TanStackDevtools plugins>` |

The provider no longer needs the `plugin` instance — it picks up theme changes from the event bus directly. Importing `createRadixThemePlugin` inline (instead of binding it to a top-level `const`) lets `@tanstack/devtools-vite` strip it cleanly in production.

---

## License

MIT © [Javier Pérez](https://github.com/jperezmart)
