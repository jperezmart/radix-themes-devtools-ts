import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RadixThemeConfig } from '../types';

// Mock @radix-ui/themes to capture the props passed to <Theme>
let lastThemeProps: Record<string, unknown> = {};
vi.mock('@radix-ui/themes', () => ({
  Theme: (props: Record<string, unknown>) => {
    const { children, ...rest } = props;
    lastThemeProps = rest;
    return <div data-testid="radix-theme">{children as React.ReactNode}</div>;
  },
}));

/**
 * Simulate what the TanStack event bus does once it is connected: dispatch a
 * CustomEvent on window with the format `${pluginId}:${eventSuffix}` and
 * detail = { payload, type, pluginId }. The new provider listens to these
 * native events directly, with no `@tanstack/devtools-event-client` import.
 */
function simulateBusEvent(event: string, payload?: unknown) {
  window.dispatchEvent(
    new CustomEvent(`radix-themes:${event}`, {
      detail: {
        payload,
        type: `radix-themes:${event}`,
        pluginId: 'radix-themes',
      },
    }),
  );
}

// The provider keeps a module-level cache so the theme survives remounts.
// Reload the module before each test to start from a clean cache.
async function loadProvider() {
  vi.resetModules();
  const { RadixThemeProvider } = await import('../provider');
  return RadixThemeProvider;
}

beforeEach(() => {
  lastThemeProps = {};
});

describe('RadixThemeProvider', () => {
  it('initializes with defaultTheme', async () => {
    const RadixThemeProvider = await loadProvider();

    render(
      <RadixThemeProvider
        defaultTheme={{ accentColor: 'red', radius: 'large' }}
      >
        <span>app</span>
      </RadixThemeProvider>,
    );

    expect(lastThemeProps).toMatchObject({
      accentColor: 'red',
      radius: 'large',
    });
  });

  it('updates theme on a theme-changed bus event', async () => {
    const RadixThemeProvider = await loadProvider();

    render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span>app</span>
      </RadixThemeProvider>,
    );

    const next: RadixThemeConfig = {
      accentColor: 'red',
      appearance: 'dark',
    };
    act(() => simulateBusEvent('theme-changed', next));

    expect(lastThemeProps).toMatchObject(next);
  });

  it('keeps theme after the bus goes silent (devtools close)', async () => {
    const RadixThemeProvider = await loadProvider();

    render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span>app</span>
      </RadixThemeProvider>,
    );

    const custom: RadixThemeConfig = {
      accentColor: 'red',
      grayColor: 'sage',
      appearance: 'dark',
      radius: 'full',
      scaling: '110%',
      panelBackground: 'solid',
    };
    act(() => simulateBusEvent('theme-changed', custom));

    // Bus stops — no more events. The theme should persist in component state.
    expect(lastThemeProps).toMatchObject(custom);
  });

  it('restores theme from internal cache on provider remount', async () => {
    const RadixThemeProvider = await loadProvider();

    const { unmount } = render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span>app</span>
      </RadixThemeProvider>,
    );

    const custom: RadixThemeConfig = {
      accentColor: 'crimson',
      appearance: 'dark',
      radius: 'full',
    };
    act(() => simulateBusEvent('theme-changed', custom));
    expect(lastThemeProps).toMatchObject({ accentColor: 'crimson' });

    unmount();

    // Provider remounts — recovers the theme from the module-level cache.
    render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span>app</span>
      </RadixThemeProvider>,
    );

    expect(lastThemeProps).toMatchObject(custom);
  });

  it('resets to defaultTheme on theme-reset', async () => {
    const RadixThemeProvider = await loadProvider();

    const defaultTheme: RadixThemeConfig = {
      accentColor: 'indigo',
      radius: 'medium',
    };
    render(
      <RadixThemeProvider defaultTheme={defaultTheme}>
        <span>app</span>
      </RadixThemeProvider>,
    );

    act(() =>
      simulateBusEvent('theme-changed', {
        accentColor: 'red',
        appearance: 'dark',
      }),
    );
    expect(lastThemeProps).toMatchObject({ accentColor: 'red' });

    act(() => simulateBusEvent('theme-reset'));
    expect(lastThemeProps).toMatchObject(defaultTheme);
  });

  it('survives multiple mount/unmount cycles', async () => {
    const RadixThemeProvider = await loadProvider();

    let r = render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span />
      </RadixThemeProvider>,
    );
    act(() =>
      simulateBusEvent('theme-changed', {
        accentColor: 'teal',
        scaling: '105%',
      }),
    );
    expect(lastThemeProps).toMatchObject({
      accentColor: 'teal',
      scaling: '105%',
    });

    r.unmount();
    r = render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span />
      </RadixThemeProvider>,
    );
    expect(lastThemeProps).toMatchObject({
      accentColor: 'teal',
      scaling: '105%',
    });

    act(() =>
      simulateBusEvent('theme-changed', {
        accentColor: 'pink',
        appearance: 'dark',
      }),
    );

    r.unmount();
    render(
      <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
        <span />
      </RadixThemeProvider>,
    );
    expect(lastThemeProps).toMatchObject({
      accentColor: 'pink',
      appearance: 'dark',
    });
  });
});

describe('createRadixThemePlugin', () => {
  it('exposes a client whose currentTheme tracks the latest value', async () => {
    const { createRadixThemePlugin } = await import('../plugin');
    const plugin = createRadixThemePlugin({
      defaultTheme: { accentColor: 'indigo' },
    });

    expect(plugin.client.currentTheme).toEqual({ accentColor: 'indigo' });

    plugin.client.currentTheme = { accentColor: 'red', appearance: 'dark' };
    expect(plugin.client.currentTheme).toEqual({
      accentColor: 'red',
      appearance: 'dark',
    });
  });
});
