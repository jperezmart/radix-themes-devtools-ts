import { Theme } from '@radix-ui/themes';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import type { RadixThemeConfig } from './types';

const PLUGIN_ID = 'radix-themes';
const EVT_CHANGED = `${PLUGIN_ID}:theme-changed`;
const EVT_RESET = `${PLUGIN_ID}:theme-reset`;

// Module-level cache so the theme survives provider remounts within a session
// (e.g. when TanStack Devtools unmounts/remounts subtrees).
let cachedTheme: RadixThemeConfig | null = null;

export interface RadixThemeProviderProps {
  defaultTheme?: RadixThemeConfig;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps Radix's `<Theme>` and syncs with the devtools panel when present.
 *
 * Production-safe: imports nothing from `@tanstack/devtools-event-client`. It
 * listens to the bus's native `CustomEvent`s on `window`, so if the devtools
 * are stripped from the build the provider degrades to a static `<Theme>`.
 */
export function RadixThemeProvider({
  defaultTheme = {},
  children,
  className,
  style,
}: RadixThemeProviderProps) {
  const [theme, setTheme] = useState<RadixThemeConfig>(
    () => cachedTheme ?? defaultTheme,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { payload?: RadixThemeConfig }
        | undefined;
      if (detail?.payload) {
        cachedTheme = detail.payload;
        setTheme(detail.payload);
      }
    };

    const onReset = () => {
      cachedTheme = defaultTheme;
      setTheme(defaultTheme);
    };

    window.addEventListener(EVT_CHANGED, onChanged);
    window.addEventListener(EVT_RESET, onReset);
    return () => {
      window.removeEventListener(EVT_CHANGED, onChanged);
      window.removeEventListener(EVT_RESET, onReset);
    };
  }, [defaultTheme]);

  return (
    <Theme {...theme} className={className} style={style}>
      {children}
    </Theme>
  );
}
