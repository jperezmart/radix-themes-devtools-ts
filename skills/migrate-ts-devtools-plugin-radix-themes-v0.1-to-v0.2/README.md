# Migration skill — `ts-devtools-plugin-radix-themes` v0.1 → v0.2

Automated migration skill for projects consuming
`ts-devtools-plugin-radix-themes` that need to move from the `0.1.x` series to
`0.2.x`.

It follows the [Agent Skills](https://www.skills.sh/) standard (`SKILL.md` with
frontmatter), so it works with Claude Code, Cursor, Codex, GitHub Copilot and
any client that understands the format.

## What it automates

1. Detects use of the package in the repo (including monorepos with a catalog).
2. Bumps the version to `^0.2.0` and regenerates the lockfile.
3. Renames `RadixThemeDevtoolsProvider` → `RadixThemeProvider` and changes its
   signature (`plugin` → `defaultTheme`).
4. Migrates imports to the new entry point split (`/provider` and `/plugin`).
5. Moves the `createRadixThemePlugin(...)` call inline into
   `<TanStackDevtools plugins={[…]}>` — the key step for
   `@tanstack/devtools-vite` to strip it in production.
6. Cleans up removed types (`RadixThemeDevtoolsProviderProps`).
7. Runs typecheck, lint, tests and build, and reports the result.

## Installation

Via [skills.sh](https://www.skills.sh/):

```bash
npx skills add jperezmart/radix-themes-devtools-ts
```

This registers the skill in your client's skills directory.

## Usage

From your client, run the command:

```
/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

The agent reads `SKILL.md` and applies the migration to the active project.
Review the resulting diff before committing.

## Cleanup

Once the migration is done and committed, remove the skill so it does not
pollute the context of future sessions:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

Or delete it by hand from your client's skills directory:

| Client      | Path                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Claude Code | `~/.claude/skills/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2/` |
| Cursor      | `~/.cursor/skills/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2/` |
| Other       | Check your client's docs.                                               |

## Compatibility

- Target: `ts-devtools-plugin-radix-themes` `0.2.x`. To continue to `0.3.x`,
  chain with
  [`migrate-…-v0.2-to-v0.3`](../migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3).
- Bundler-agnostic (Vite, Next.js, Webpack, Rspack…). The bundle-stripping
  check in step 8 only applies if the project uses `@tanstack/devtools-vite`;
  the rest of the migration works everywhere.

## License

MIT © [Javier Pérez](https://github.com/jperezmart)
