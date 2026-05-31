# Migration skill — `ts-devtools-plugin-radix-themes` v0.1 → v0.2

Skill de migración automática para proyectos que consumen
`ts-devtools-plugin-radix-themes` y necesitan actualizar de la serie `0.1.x` a
la `0.2.x`.

Sigue el estándar de [Agent Skills](https://www.skills.sh/) (`SKILL.md` con
frontmatter), por lo que es compatible con Claude Code, Cursor, Codex, GitHub
Copilot y cualquier cliente que entienda ese formato.

## Qué automatiza

1. Detecta el uso del paquete en el repo (incluyendo monorepos con catalog).
2. Sube la versión a `^0.2.0` y regenera el lockfile.
3. Renombra `RadixThemeDevtoolsProvider` → `RadixThemeProvider` y cambia su
   firma (`plugin` → `defaultTheme`).
4. Migra los imports al nuevo split de entry points (`/provider` y `/plugin`).
5. Mueve la instanciación de `createRadixThemePlugin(...)` inline dentro de
   `<TanStackDevtools plugins={[…]}>` — paso clave para que
   `@tanstack/devtools-vite` lo strippee en producción.
6. Limpia tipos obsoletos (`RadixThemeDevtoolsProviderProps`).
7. Ejecuta typecheck, lint, tests y build, y reporta el resultado.

## Instalación

Vía [skills.sh](https://www.skills.sh/):

```bash
npx skills add JavierBrooktec/ts-devtools-plugin-radix-themes
```

Esto registra el skill en el directorio de skills de tu cliente.

## Uso

Desde tu cliente, lanza el comando:

```
/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

El agente leerá `SKILL.md` y aplicará la migración sobre el proyecto activo.
Revisa el diff resultante antes de commitear.

## Limpieza

Una vez la migración esté hecha y commiteada, elimina el skill para no
contaminar el contexto de futuras sesiones:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

O bórralo manualmente del directorio de skills de tu cliente:

| Cliente     | Ruta                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| Claude Code | `~/.claude/skills/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2/` |
| Cursor      | `~/.cursor/skills/migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2/` |
| Otros       | Consulta la doc del cliente.                                             |

## Compatibilidad

- Target: `ts-devtools-plugin-radix-themes` ≥ `0.2.0`.
- Bundler-agnóstico (Vite, Next.js, Webpack, Rspack…). La verificación de
  bundle stripping del paso 8 sólo aplica si el proyecto usa
  `@tanstack/devtools-vite`; el resto de la migración funciona en todos.

## Licencia

MIT © [Javier Pérez](https://github.com/JavierBrooktec)
