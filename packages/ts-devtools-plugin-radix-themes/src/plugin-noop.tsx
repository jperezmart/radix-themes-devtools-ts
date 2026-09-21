// Standalone entry on purpose. The no-op exists so production builds can drop
// the panel and the event bus, and it can only do that from a module that
// imports neither — `plugin.tsx` pulls both in at module scope (the `lazy()`
// call and the `RadixThemeEventClient` construction), which no bundler can
// tree-shake away. `bundle-hygiene.test.ts` holds that line.
import { RADIX_THEME_PLUGIN_ID } from './plugin-id';
import type { RadixThemePluginOptions } from './types';

/**
 * The no-op counterpart of `createRadixThemePlugin`: the same tab metadata,
 * a `render` that draws nothing, and no event client.
 *
 * Mirrors the `NoOpPlugin` half of the `[Plugin, NoOpPlugin]` tuple that
 * `createReactPlugin` from `@tanstack/devtools-utils` returns. That helper is
 * ESM-only and this package publishes CJS entries, so it cannot be a runtime
 * dependency; `plugin-registration.test.tsx` pins the shapes together instead.
 *
 * Swap the factory and let the bundler fold the branch:
 *
 * ```tsx
 * import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin';
 * import { createRadixThemeNoOpPlugin } from 'ts-devtools-plugin-radix-themes/plugin-noop';
 *
 * const createPlugin =
 *   process.env.NODE_ENV === 'development'
 *     ? createRadixThemePlugin
 *     : createRadixThemeNoOpPlugin;
 * ```
 *
 * Importing `/provider` alone and never reaching for `/plugin` remains the
 * simplest option where the app can arrange it.
 */
export function createRadixThemeNoOpPlugin(
  options: RadixThemePluginOptions = {},
) {
  return {
    id: options.id ?? RADIX_THEME_PLUGIN_ID,
    name: 'Radix Themes',
    defaultOpen: false,
    render: () => <></>,
  };
}
