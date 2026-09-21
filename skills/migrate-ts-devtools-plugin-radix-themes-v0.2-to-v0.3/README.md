# Migration skill — `ts-devtools-plugin-radix-themes` v0.2 → v0.3

Automated migration skill for projects consuming
`ts-devtools-plugin-radix-themes` that need to move from the `0.2.x` series to
`0.3.x`.

It follows the [Agent Skills](https://www.skills.sh/) standard (`SKILL.md` with
frontmatter), so it works with Claude Code, Cursor, Codex, GitHub Copilot and
any client that understands the format.

> **Unlike the `v0.1` → `v0.2` skill, this upgrade is additive.** In most
> projects there are no code changes and the skill finishes having touched only
> `package.json`. It exists so you can confirm that without reading the
> changelog, not because there is mechanical work to automate.

## What it automates

1. Detects use of the package in the repo (including monorepos with a catalog),
   and redirects to the `v0.1` → `v0.2` skill if the project is still on
   `0.1.x`.
2. Bumps the version to `^0.3.0` and regenerates the lockfile.
3. Finds direct access to `plugin.render`, which goes from a JSX element to a
   function — the release's only shape change.
4. Checks the new floor on the optional `@tanstack/devtools-event-client` peer
   (`>=0.4.0`).
5. Offers the optional additions (`defaultOpen`, the `/plugin-noop` entry
   point) only where they fit the repo.
6. Runs typecheck, lint, tests and build, and reports the result.

## Installation

Via [skills.sh](https://www.skills.sh/):

```bash
npx skills add jperezmart/radix-themes-devtools-ts
```

This registers the skill in your client's skills directory.

## Usage

From your client, run the command:

```
/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
```

The agent reads `SKILL.md` and applies the migration to the active project.
Review the resulting diff before committing.

## Cleanup

Once the migration is done and committed, remove the skill so it does not
pollute the context of future sessions:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3
```

Or delete it by hand from your client's skills directory:

| Client      | Path                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Claude Code | `~/.claude/skills/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3/` |
| Cursor      | `~/.cursor/skills/migrate-ts-devtools-plugin-radix-themes-v0.2-to-v0.3/` |
| Other       | Check your client's docs.                                               |

## Compatibility

- Input: `ts-devtools-plugin-radix-themes` `0.2.x`. Coming from `0.1.x`? Run
  [`migrate-…-v0.1-to-v0.2`](../migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2)
  first.
- Target: `ts-devtools-plugin-radix-themes` ≥ `0.3.0`.
- Bundler-agnostic (Vite, Next.js, Webpack, Rspack…).

## License

MIT © [Javier Pérez](https://github.com/jperezmart)
