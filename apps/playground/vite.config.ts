import { resolve } from 'path';

import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const pkgRoot = resolve(
  __dirname,
  '../../packages/ts-devtools-plugin-radix-themes/src',
);

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    // Order matters: longer/more specific aliases must come first.
    alias: [
      {
        find: 'ts-devtools-plugin-radix-themes/provider',
        replacement: resolve(pkgRoot, 'provider.tsx'),
      },
      {
        find: 'ts-devtools-plugin-radix-themes/plugin',
        replacement: resolve(pkgRoot, 'plugin.tsx'),
      },
      {
        find: 'ts-devtools-plugin-radix-themes',
        replacement: resolve(pkgRoot, 'index.ts'),
      },
    ],
  },
});
