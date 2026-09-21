---
'ts-devtools-plugin-radix-themes': patch
---

Document the `0.2.x` -> `0.3.0` upgrade in the package README, with a matching
migration skill.

`0.3.0` shipped without them. Nothing to do in the common case: both record the
two observable changes — `render` is now a function, and the optional
`@tanstack/devtools-event-client` peer floor moved to `>=0.4.0` — and say
plainly that neither affects code following the documented usage.
