import type { ThemeProps } from '@radix-ui/themes';

export type RadixThemeConfig = Pick<
  ThemeProps,
  | 'accentColor'
  | 'grayColor'
  | 'appearance'
  | 'radius'
  | 'scaling'
  | 'panelBackground'
>;

export type RadixThemeEvents = {
  'theme-changed': RadixThemeConfig;
  'theme-reset': void;
};

export interface RadixThemePluginOptions {
  defaultTheme?: RadixThemeConfig;
  /**
   * Identifier the devtools shell keys its persisted open/closed state on.
   * Overriding it only makes sense when mounting the plugin more than once.
   *
   * @default 'radix-themes'
   */
  id?: string;
  /**
   * Open this panel on first load, when no panel choice is stored yet.
   *
   * @default false
   */
  defaultOpen?: boolean;
}

/**
 * The light/dark theme the TanStack Devtools shell renders itself in.
 *
 * Mirrors `TanStackDevtoolsTheme` from `@tanstack/devtools-ui`, redeclared
 * here so the plugin does not take a dependency on the shell's internals.
 */
export type DevtoolsShellTheme = 'light' | 'dark';

/**
 * Props the devtools shell hands to a plugin's `render` function.
 *
 * Structurally compatible with `TanStackDevtoolsPluginProps`, redeclared here
 * so the plugin does not take a dependency on the shell.
 */
export interface DevtoolsShellPluginProps {
  theme: DevtoolsShellTheme;
  devtoolsOpen: boolean;
}
