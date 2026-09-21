---
'ts-devtools-plugin-radix-themes': minor
---

Add a `/plugin-noop` entry point exporting `createRadixThemeNoOpPlugin()`.

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
