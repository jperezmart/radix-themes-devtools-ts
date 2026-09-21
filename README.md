# ts-devtools-plugin-radix-themes

Monorepo for [`ts-devtools-plugin-radix-themes`](./packages/ts-devtools-plugin-radix-themes) — a [TanStack Devtools](https://tanstack.com/devtools/latest) plugin for [Radix UI Themes](https://www.radix-ui.com/themes).

📦 **[→ Package docs & usage](./packages/ts-devtools-plugin-radix-themes/README.md)**

---

## Structure

```
ts-devtools-plugin-radix-themes/
├── packages/
│   └── ts-devtools-plugin-radix-themes/   ← the npm package
└── apps/
    └── playground/              ← dev playground (Vite + TanStack Router)
```

## Development

**Requirements:** Node ≥ 24.20 (see `devEngines` in the root `package.json`), pnpm ≥ 11

The published package still supports Node ≥ 20 — the floor above is the dev
toolchain's, not the library's.

```bash
pnpm install
pnpm dev        # starts the playground at http://localhost:5173
pnpm build      # builds all packages
pnpm typecheck  # type-checks all packages
```

## Contributing

Issues and PRs are welcome. Please open an issue first for significant changes.

## License

MIT © [Javier Pérez](https://github.com/jperezmart)
