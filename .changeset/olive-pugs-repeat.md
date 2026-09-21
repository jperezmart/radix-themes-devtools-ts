---
'ts-devtools-plugin-radix-themes': patch
---

Raise the `@tanstack/devtools-event-client` peer range from `>=0.0.1` to `>=0.4.0`.

The old range accepted versions predating the `EventClient` API this plugin
actually calls. It stays an optional peer, so consumers who never mount the
devtools panel are unaffected.
