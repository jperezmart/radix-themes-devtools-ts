// @vitest-environment node
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

const FIXTURES = resolve(__dirname, '__fixtures__');

interface Bundle {
  /** Concatenated JS of every emitted chunk. */
  code: string;
  /** External modules the bundle still imports, static and dynamic. */
  imports: string[];
}

/**
 * Bundle a synthetic consumer entry the way a real downstream app would
 * (react and friends marked external) and report what survived.
 */
async function bundleConsumer(fixture: string): Promise<Bundle> {
  const result = await build({
    logLevel: 'silent',
    configFile: false,
    plugins: [react()],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: resolve(FIXTURES, fixture),
        formats: ['es'],
        fileName: 'out',
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@radix-ui/themes',
          '@tanstack/devtools-event-client',
        ],
      },
    },
  });

  const chunks = (Array.isArray(result) ? result : [result]).flatMap(o =>
    'output' in o ? o.output : [],
  );

  return {
    code: chunks.map(c => ('code' in c ? c.code : '')).join('\n'),
    imports: chunks.flatMap(c => ('imports' in c ? c.imports : [])),
  };
}

/**
 * Whether an identifier survived into the bundle.
 *
 * Deliberately not a substring check on the raw code: the bundler preserves
 * comments, and `provider.tsx` has one that names
 * `@tanstack/devtools-event-client` precisely to say it does not import it.
 * Module-level questions go to `imports` instead, which is the module graph
 * rather than the text.
 */
function declares(bundle: Bundle, identifier: string): boolean {
  return new RegExp(`\\b${identifier}\\b`).test(bundle.code);
}

describe('bundle hygiene', () => {
  it('importing only RadixThemeProvider does NOT pull in devtools or panel', async () => {
    const bundle = await bundleConsumer('consumer-provider-only.tsx');

    // No event client / devtools bus
    expect(bundle.imports).not.toContain('@tanstack/devtools-event-client');
    expect(declares(bundle, 'EventClient')).toBe(false);

    // No panel UI
    expect(declares(bundle, 'RadixThemePanel')).toBe(false);
    expect(declares(bundle, 'ACCENT_COLORS')).toBe(false);

    // Plugin factory should not be present either
    expect(declares(bundle, 'createRadixThemePlugin')).toBe(false);

    // Sanity: provider IS present
    expect(declares(bundle, 'RadixThemeProvider')).toBe(true);
  }, 30_000);

  it('importing only createRadixThemeNoOpPlugin drops the panel and the bus', async () => {
    const bundle = await bundleConsumer('consumer-noop-plugin.tsx');

    expect(declares(bundle, 'createRadixThemeNoOpPlugin')).toBe(true);

    // The no-op is the prod swap for createRadixThemePlugin; it is worth
    // nothing if the bundler still drags the real one's payload along.
    expect(bundle.imports).not.toContain('@tanstack/devtools-event-client');
    expect(declares(bundle, 'EventClient')).toBe(false);
    expect(declares(bundle, 'RadixThemePanel')).toBe(false);
    expect(declares(bundle, 'ACCENT_COLORS')).toBe(false);
  }, 30_000);

  it('importing createRadixThemePlugin DOES pull in the event client', async () => {
    const bundle = await bundleConsumer('consumer-plugin.tsx');

    // The plugin entry needs the bus; confirm we are not accidentally
    // tree-shaking it away (which would be a regression in the other direction).
    expect(bundle.imports).toContain('@tanstack/devtools-event-client');
    expect(declares(bundle, 'createRadixThemePlugin')).toBe(true);
  }, 30_000);
});
