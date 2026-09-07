// Convenience barrel — re-exports from the dedicated entry points.
// For best tree-shaking, import from the subpath entries instead:
//   import { RadixThemeProvider } from 'ts-devtools-plugin-radix-themes/provider'
//   import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin'

export { RadixThemeProvider } from './provider';
export type { RadixThemeProviderProps } from './provider';

export { createRadixThemePlugin } from './plugin';

export { RadixThemeEventClient } from './client';

export type {
  RadixThemeConfig,
  RadixThemeEvents,
  RadixThemePluginOptions,
} from './types';
