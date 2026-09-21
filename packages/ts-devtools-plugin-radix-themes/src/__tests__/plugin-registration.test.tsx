import { cleanup, render, waitFor, within } from '@testing-library/react';
import { afterEach } from 'vitest';
import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';

import { createRadixThemePlugin } from '../plugin';
import { RADIX_THEME_PLUGIN_ID } from '../client';
import type { DevtoolsShellPluginProps } from '../types';

function shellProps(
  overrides: Partial<DevtoolsShellPluginProps> = {},
): DevtoolsShellPluginProps {
  return { theme: 'light', devtoolsOpen: true, ...overrides };
}

// `globals` is off in this project, so RTL's auto-cleanup is not registered.
afterEach(cleanup);

describe('createRadixThemePlugin', () => {
  it('declares a stable id matching the event client pluginId', () => {
    expect(createRadixThemePlugin().id).toBe(RADIX_THEME_PLUGIN_ID);
    expect(createRadixThemePlugin({ id: 'custom' }).id).toBe('custom');
  });

  it('defaults defaultOpen to false and honours the override', () => {
    expect(createRadixThemePlugin().defaultOpen).toBe(false);
    expect(createRadixThemePlugin({ defaultOpen: true }).defaultOpen).toBe(
      true,
    );
  });

  it('exposes render as a function so the shell can pass its props', () => {
    const { render: pluginRender } = createRadixThemePlugin();

    // An element would silently never receive `theme` or `devtoolsOpen`.
    expect(typeof pluginRender).toBe('function');
    expect(isValidElement(pluginRender)).toBe(false);
    expect(
      isValidElement(pluginRender(document.createElement('div'), shellProps())),
    ).toBe(true);
  });

  it.each(['light', 'dark'] as const)(
    'renders the panel with the shell in %s mode',
    async theme => {
      const plugin = createRadixThemePlugin();

      const { container } = render(
        plugin.render(document.createElement('div'), shellProps({ theme })),
      );

      // The panel is lazy; wait for the chunk to resolve.
      const reset = await waitFor(() => within(container).getByText('Reset'));

      const expected =
        theme === 'light' ? 'rgb(28, 32, 36)' : 'rgb(237, 238, 240)';
      expect(getComputedStyle(reset.parentElement!).color).toBe(expected);
    },
  );
});
