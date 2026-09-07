import { EventClient } from '@tanstack/devtools-event-client';
import type { RadixThemeConfig, RadixThemeEvents } from './types';

export class RadixThemeEventClient extends EventClient<RadixThemeEvents> {
  currentTheme: RadixThemeConfig;
  readonly defaultTheme: RadixThemeConfig;

  constructor(defaultTheme: RadixThemeConfig = {}) {
    super({ pluginId: 'radix-themes' });
    this.defaultTheme = defaultTheme;
    this.currentTheme = defaultTheme;
  }
}
