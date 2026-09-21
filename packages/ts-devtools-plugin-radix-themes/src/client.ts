import { EventClient } from '@tanstack/devtools-event-client';
import type { RadixThemeConfig, RadixThemeEvents } from './types';

/** Default plugin id, shared by the event client and the shell registration. */
export const RADIX_THEME_PLUGIN_ID = 'radix-themes';

export class RadixThemeEventClient extends EventClient<RadixThemeEvents> {
  currentTheme: RadixThemeConfig;
  readonly defaultTheme: RadixThemeConfig;

  constructor(defaultTheme: RadixThemeConfig = {}) {
    super({ pluginId: RADIX_THEME_PLUGIN_ID });
    this.defaultTheme = defaultTheme;
    this.currentTheme = defaultTheme;
  }
}
