import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { RadixThemeProvider } from 'ts-devtools-plugin-radix-themes/provider';
import { createRadixThemePlugin } from 'ts-devtools-plugin-radix-themes/plugin';
import type { RadixThemeConfig } from 'ts-devtools-plugin-radix-themes';

const defaultTheme: RadixThemeConfig = {
  accentColor: 'indigo',
  radius: 'medium',
  scaling: '100%',
};

export const Route = createRootRoute({
  component: () => (
    <RadixThemeProvider defaultTheme={defaultTheme}>
      <nav
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--gray-5)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          Home
        </Link>
        <Link to="/about" style={{ textDecoration: 'none' }}>
          About
        </Link>
      </nav>

      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>

      <TanStackDevtools plugins={[createRadixThemePlugin({ defaultTheme })]} />
    </RadixThemeProvider>
  ),
});
