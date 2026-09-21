import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';

import { RADIX_THEME_PLUGIN_ID, RadixThemeEventClient } from './client';
import type {
  DevtoolsShellPluginProps,
  RadixThemePluginOptions,
} from './types';

const RadixThemePanel = lazy(() =>
  import('./panel').then(m => ({ default: m.RadixThemePanel })),
);

/**
 * The plugin object handed to `<TanStackDevtools plugins={[...]} />`.
 *
 * Shaped like the objects `createReactPlugin` from `@tanstack/devtools-utils`
 * produces, plus the `client` this plugin has always exposed. That helper is
 * not used directly: it is ESM-only, and this package publishes CJS entries,
 * so depending on it would break
 * `require('ts-devtools-plugin-radix-themes/plugin')`.
 * `plugin-registration.test.tsx` pins the two shapes together.
 *
 * For the production counterpart see `/plugin-noop`.
 */
export interface RadixThemePlugin {
  id: string;
  name: string;
  defaultOpen: boolean;
  render: (el: HTMLElement, props: DevtoolsShellPluginProps) => ReactElement;
  client: RadixThemeEventClient;
}

export function createRadixThemePlugin(options: RadixThemePluginOptions = {}) {
  const client = new RadixThemeEventClient(options.defaultTheme);

  return {
    id: options.id ?? RADIX_THEME_PLUGIN_ID,
    name: 'Radix Themes',
    defaultOpen: options.defaultOpen ?? false,
    // A function rather than an element: only this form receives the shell's
    // props, which is how the panel learns whether the shell is in light or
    // dark mode.
    render: (_el: HTMLElement, props: DevtoolsShellPluginProps) => (
      <Suspense fallback={null}>
        <RadixThemePanel
          client={client}
          defaultTheme={options.defaultTheme}
          shellTheme={props.theme}
        />
      </Suspense>
    ),
    client,
  };
}
