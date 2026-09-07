import { lazy, Suspense } from 'react';

import { RadixThemeEventClient } from './client';
import type { RadixThemePluginOptions } from './types';

const RadixThemePanel = lazy(() =>
  import('./panel').then(m => ({ default: m.RadixThemePanel })),
);

export function createRadixThemePlugin(options: RadixThemePluginOptions = {}) {
  const client = new RadixThemeEventClient(options.defaultTheme);

  return {
    name: 'Radix Themes',
    render: (
      <Suspense fallback={null}>
        <RadixThemePanel client={client} defaultTheme={options.defaultTheme} />
      </Suspense>
    ),
    client,
  };
}
