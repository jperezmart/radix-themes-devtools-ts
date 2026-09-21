# ts-devtools-plugin-radix-themes

## 0.3.0

### Minor Changes

- [#3](https://github.com/jperezmart/radix-themes-devtools-ts/pull/3) [`d9363b9`](https://github.com/jperezmart/radix-themes-devtools-ts/commit/d9363b94292be2a8a1445616e6282b5c351b36d7) Thanks [@jperezmart](https://github.com/jperezmart)! - Add a `/plugin-noop` entry point exporting `createRadixThemeNoOpPlugin()`.
  
  Mirrors the `NoOpPlugin` half of the `[Plugin, NoOpPlugin]` tuple that
  `createReactPlugin` from `@tanstack/devtools-utils` returns, for apps that
  build their `plugins` array in one shared place and cannot import `/plugin`
  conditionally. Swapping the factory lets the bundler fold the branch.
  
  It is a separate entry rather than another export of `/plugin` because
  `/plugin` constructs the event client and calls `lazy()` at module scope:
  importing that module pulls the panel and the bus in whichever factory you
  call. A bundle-hygiene test holds that line.
  
  Upstream's helper is not used directly — it is ESM-only and this package
  publishes CJS entries — so a conformance test keeps the two shapes aligned
  instead.

- [#3](https://github.com/jperezmart/radix-themes-devtools-ts/pull/3) [`154ebb2`](https://github.com/jperezmart/radix-themes-devtools-ts/commit/154ebb2cf43eaf794a3ea82a527d8d1753d7ff7b) Thanks [@jperezmart](https://github.com/jperezmart)! - Register with the devtools shell properly: stable `id`, `defaultOpen`, and a
  panel that follows the shell's light/dark appearance.
  
  `render` was a JSX element. The shell only passes its props (`theme`,
  `devtoolsOpen`) to the function form, so the panel never learned which
  appearance the shell was in and drew itself with hardcoded `#000`/`#fff`/`#ccc`
  — unreadable in a dark shell. `render` is now a function and the panel takes a
  `shellTheme`.
  
  The plugin also declared no `id`, so the shell generated a random one on every
  load and could not persist whether the panel was open. It now defaults to
  `'radix-themes'`, the same id the event client already used. Both `id` and the
  new `defaultOpen` are overridable through `createRadixThemePlugin(options)`.

### Patch Changes

- [#3](https://github.com/jperezmart/radix-themes-devtools-ts/pull/3) [`96dfaf9`](https://github.com/jperezmart/radix-themes-devtools-ts/commit/96dfaf91e4f06b0480244bc3f1efa8d68010d2be) Thanks [@jperezmart](https://github.com/jperezmart)! - Raise the `@tanstack/devtools-event-client` peer range from `>=0.0.1` to `>=0.4.0`.
  
  The old range accepted versions predating the `EventClient` API this plugin
  actually calls. It stays an optional peer, so consumers who never mount the
  devtools panel are unaffected.

- [#3](https://github.com/jperezmart/radix-themes-devtools-ts/pull/3) [`3cfbeb8`](https://github.com/jperezmart/radix-themes-devtools-ts/commit/3cfbeb82999ccb855ba13e6364038d19cc38184d) Thanks [@jperezmart](https://github.com/jperezmart)! - Move the build and test toolchain to Vite 8 / Vitest 5. No change to the
  published output: `engines.node` stays `>=20` because the new floors belong to
  devDependencies, not to the shipped `dist`.

## 0.2.3

### Patch Changes

- [`f796f7a`](https://github.com/jperezmart/radix-themes-devtools-ts/commit/f796f7a4fd8cde479d85f2ed86741e603695befa) - Add npm version and license badges to the README, and declare `README.md` and
  `LICENSE` explicitly in `files`.
  
  The README ships in the tarball and is what npmjs.com renders, so this reaches
  the registry page rather than only GitHub. The version badge reads live from the
  registry, which makes "what is actually published right now" answerable at a
  glance.
  
  This is also the first release under the publishing standard: changesets plus npm
  OIDC trusted publishing, with provenance and no npm token anywhere.
