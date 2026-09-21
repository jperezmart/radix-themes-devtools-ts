import { EventClient } from '@tanstack/devtools-event-client';
import { RADIX_THEME_PLUGIN_ID } from './plugin-id';
import type { RadixThemeConfig, RadixThemeEvents } from './types';

export { RADIX_THEME_PLUGIN_ID };

export class RadixThemeEventClient extends EventClient<RadixThemeEvents> {
  currentTheme: RadixThemeConfig;
  readonly defaultTheme: RadixThemeConfig;

  constructor(defaultTheme: RadixThemeConfig = {}) {
    super({ pluginId: RADIX_THEME_PLUGIN_ID });
    this.defaultTheme = defaultTheme;
    this.currentTheme = defaultTheme;
  }
}
