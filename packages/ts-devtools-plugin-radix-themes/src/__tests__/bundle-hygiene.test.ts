// @vitest-environment node
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';

const FIXTURES = resolve(__dirname, '__fixtures__');

/**
 * Bundle a synthetic consumer entry the way a real downstream app would
 * (react and friends marked external) and return the concatenated JS output
 * so the tests can scan for forbidden / required strings.
 */
async function bundleConsumer(fixture: string): Promise<string> {
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

  const outputs = Array.isArray(result) ? result : [result];
  return outputs
    .flatMap(o => ('output' in o ? o.output : []))
    .map(chunk => ('code' in chunk ? chunk.code : ''))
    .join('\n');
}

describe('bundle hygiene', () => {
  it('importing only RadixThemeProvider does NOT pull in devtools or panel', async () => {
    const code = await bundleConsumer('consumer-provider-only.tsx');

    // No event client / devtools bus
    expect(code).not.toContain('@tanstack/devtools-event-client');
    expect(code).not.toContain('EventClient');

    // No panel UI
    expect(code).not.toContain('RadixThemePanel');
    expect(code).not.toContain('ACCENT_COLORS');

    // Plugin factory should not be present either
    expect(code).not.toContain('createRadixThemePlugin');

    // Sanity: provider IS present
    expect(code).toContain('RadixThemeProvider');
  }, 30_000);

  it('importing createRadixThemePlugin DOES pull in the event client', async () => {
    const code = await bundleConsumer('consumer-plugin.tsx');

    // The plugin entry needs the bus; confirm we are not accidentally
    // tree-shaking it away (which would be a regression in the other direction).
    expect(code).toContain('@tanstack/devtools-event-client');
    expect(code).toContain('createRadixThemePlugin');
  }, 30_000);
});
