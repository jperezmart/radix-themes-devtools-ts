---
'ts-devtools-plugin-radix-themes': minor
---

Register with the devtools shell properly: stable `id`, `defaultOpen`, and a
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
