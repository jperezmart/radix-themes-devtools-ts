---
name: migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
description: |
  Usa este skill para migrar proyectos de ts-devtools-plugin-radix-themes
  v0.1.x a v0.2.x. Cubre el rename de RadixThemeDevtoolsProvider, los nuevos
  subpath exports (/provider y /plugin), y el patrón de instanciación inline
  necesario para que el bundle de producción no arrastre código de devtools.
command: /migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
---

# Migración ts-devtools-plugin-radix-themes v0.1 → v0.2

## Breaking changes

1. **Provider renombrado**: `RadixThemeDevtoolsProvider` → `RadixThemeProvider`.
2. **Firma del provider**: deja de aceptar `plugin`; ahora acepta `defaultTheme`.
3. **Subpath exports nuevos**: `/provider` (prod-safe, sin devtools deps) y `/plugin` (dev-only). El barrel sigue existiendo pero rompe el tree-shaking.
4. **Patrón inline obligatorio**: instancia `createRadixThemePlugin(...)` dentro del array `plugins={[…]}` de `<TanStackDevtools>`. NO la asignes a un `const` top-level — eso impide que `@tanstack/devtools-vite` strippee el código en prod y deja ~3 KB gz de devtools en el bundle.
5. **Tipo eliminado**: `RadixThemeDevtoolsProviderProps` ya no existe. Usa `RadixThemeProviderProps`.
6. **peer dep opcional**: `@tanstack/devtools-event-client` pasa a `peerDependenciesMeta.optional` — sólo lo necesitas si importas de `/plugin`.

## Orden de migración

### Paso 1 — Comprueba que aplica

Lee el `package.json` del proyecto. Si `ts-devtools-plugin-radix-themes` no aparece, aborta y avisa al usuario. Si la versión ya es `^0.2.0` o mayor, aborta.

En monorepos, busca también en `pnpm-workspace.yaml` bajo `catalog:` y en los `package.json` de cada `apps/*` y `packages/*`.

### Paso 2 — Sube la versión

Actualiza la versión a `^0.2.0`:

- `package.json` directo: edita la línea correspondiente.
- pnpm catalog: actualiza `pnpm-workspace.yaml` → `catalog.ts-devtools-plugin-radix-themes: ^0.2.0`.

Ejecuta el package manager del proyecto para regenerar el lockfile (lee `packageManager` en el `package.json` raíz). Ej.: `pnpm install`, `npm install`, `yarn install`.

### Paso 3 — Localiza usos

Ejecuta estos greps desde la raíz del proyecto:

```bash
grep -rn "RadixThemeDevtoolsProvider" --include="*.ts" --include="*.tsx" .
grep -rn "createRadixThemePlugin" --include="*.ts" --include="*.tsx" .
grep -rn "from 'ts-devtools-plugin-radix-themes'" --include="*.ts" --include="*.tsx" .
grep -rn "RadixThemeDevtoolsProviderProps" --include="*.ts" --include="*.tsx" .
```

Lista todos los archivos resultantes antes de tocarlos.

### Paso 4 — Migra el provider

Cambia el import al subpath `/provider`, renombra el componente y sustituye la prop `plugin` por `defaultTheme`. El valor de `defaultTheme` es el mismo objeto que se pasaba antes a `createRadixThemePlugin({ defaultTheme: … })`; extráelo a una `const` reutilizable si vive inline.

ANTES:

```tsx
import {
  RadixThemeDevtoolsProvider,
  createRadixThemePlugin,
} from 'ts-devtools-plugin-radix-themes'

const themePlugin = createRadixThemePlugin({
  defaultTheme: { accentColor: 'indigo', radius: 'medium' },
})

<RadixThemeDevtoolsProvider plugin={themePlugin}>
  {children}
</RadixThemeDevtoolsProvider>
```

DESPUÉS:

```tsx
import { RadixThemeProvider } from 'ts-devtools-plugin-radix-themes/provider'

const defaultTheme = { accentColor: 'indigo', radius: 'medium' } as const

<RadixThemeProvider defaultTheme={defaultTheme}>
  {children}
</RadixThemeProvider>
```

### Paso 5 — Migra el `<TanStackDevtools plugins=[…]>` a inline

Cambia el import a `/plugin` y mueve la llamada `createRadixThemePlugin(...)` **dentro** del array `plugins={[…]}`. Borra cualquier `const themePlugin = createRadixThemePlugin(...)` previo.

ANTES:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes'

const themePlugin = createRadixThemePlugin({ defaultTheme })

<TanStackDevtools plugins={[themePlugin]} />
```

DESPUÉS:

```tsx
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin'

;<TanStackDevtools
  plugins={[
    createRadixThemePlugin({ defaultTheme }),
    // …otros plugins
  ]}
/>
```

Reusa exactamente el mismo objeto `defaultTheme` que pasaste al provider en el paso 4.

### Paso 6 — Limpia tipos eliminados

Sustituye `RadixThemeDevtoolsProviderProps` por `RadixThemeProviderProps` importado de `/provider`:

```tsx
// antes
import type { RadixThemeDevtoolsProviderProps } from 'ts-devtools-plugin-radix-themes'

// después
import type { RadixThemeProviderProps } from 'ts-devtools-plugin-radix-themes/provider'
```

### Paso 7 — Verifica typecheck, lint, tests y build

Lee los `scripts` del `package.json` del proyecto y ejecuta lo que aplique en este orden:

```bash
pnpm typecheck   # o tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Resuelve cualquier error. Los problemas habituales son:

- Imports residuales del barrel: cambia a subpath.
- Tipos rotos por `RadixThemeDevtoolsProviderProps`: ver paso 6.
- Tests que mockean el paquete: el path del `vi.mock(...)` debe ser `/provider` o `/plugin` según lo que mockee.

### Paso 8 — Verifica el strip de devtools en prod (sólo si el proyecto usa `@tanstack/devtools-vite`)

Comprueba que `vite.config.ts` incluye `devtools()` de `@tanstack/devtools-vite` antes del resto de plugins. Si no lo incluye, sugiere al usuario añadirlo — sin él, el plugin sigue pesando en prod:

```ts
import { devtools } from '@tanstack/devtools-vite'

plugins: [devtools() /* …resto */]
```

Tras el build, busca en el log la línea `[@tanstack/devtools-vite] Removed devtools code from: ...`. Si hay bundle analyzer, confirma que `dist/plugin*.js` y `@tanstack/devtools-event-client` NO aparecen en el bundle de prod.

## Patrones comunes

### Patrón A — Provider centralizado con tenant config

Wrappers tipo `RadixThemesProvider` o `AppShell` que envolvían `<RadixThemeDevtoolsProvider plugin={...}>` deben renombrarse y pasar `defaultTheme` directamente:

```tsx
// antes
const RadixThemesProvider = ({ children }) => (
  <RadixThemeDevtoolsProvider plugin={themePlugin}>{children}</RadixThemeDevtoolsProvider>
)

// después
const RadixThemesProvider = ({ children }) => (
  <RadixThemeProvider defaultTheme={TENANT_CONFIG.radixThemesConfig}>{children}</RadixThemeProvider>
)
```

### Patrón B — Archivo dedicado al plugin (`integrations/radix-themes/*.plugin.ts`)

Si existe un archivo cuyo único propósito es crear y exportar el plugin (típicamente `radix-themes.plugin.ts`):

- Si sólo lo consume `<TanStackDevtools>`: **borra el archivo** y mueve la llamada inline al JSX donde se monta `<TanStackDevtools>`.
- Si también lo consume el provider (patrón antiguo): extrae **sólo el objeto `defaultTheme`** a un archivo compartido (p. ej. `radix-themes.config.ts`) y borra la creación del plugin de ahí.

### Patrón C — Monorepo con varias apps

Cada app tiene su propio `<TanStackDevtools>` y su propio provider. Repite los pasos 4–7 por app. El `defaultTheme` puede vivir en un paquete compartido del workspace.

### Patrón D — Tests con mock del paquete

Cambia el path del `vi.mock`:

```tsx
// antes
vi.mock('ts-devtools-plugin-radix-themes', () => ({ … }))

// después: mockea sólo el subpath relevante para ese test
vi.mock('ts-devtools-plugin-radix-themes/provider', () => ({ … }))
```

## Cierre

Reporta al usuario:

1. Archivos modificados (cuenta).
2. Resultado de typecheck / lint / test / build.
3. Si `@tanstack/devtools-vite` está en uso y se ve el log de strip.
4. Patrones ambiguos que dejaste sin tocar (si los hay).

Indica al usuario que elimine este skill cuando la migración esté commiteada:

```bash
npx skills remove migrate-ts-devtools-plugin-radix-themes-v0.1-to-v0.2
```

O bórralo manualmente del directorio de skills de su cliente (Claude Code: `~/.claude/skills/`, Cursor: `~/.cursor/skills/`, etc.). Mantener skills de migración antiguos contamina el contexto en sesiones futuras.
