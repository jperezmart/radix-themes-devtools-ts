---
'ts-devtools-plugin-radix-themes': patch
---

Move the build and test toolchain to Vite 8 / Vitest 5. No change to the
published output: `engines.node` stays `>=20` because the new floors belong to
devDependencies, not to the shipped `dist`.
