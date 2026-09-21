import { lazy, Suspense } from 'react';

import { RADIX_THEME_PLUGIN_ID, RadixThemeEventClient } from './client';
import type {
  DevtoolsShellPluginProps,
  RadixThemePluginOptions,
} from './types';

const RadixThemePanel = lazy(() =>
  import('./panel').then(m => ({ default: m.RadixThemePanel })),
);

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
