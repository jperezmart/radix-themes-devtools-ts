// Synthetic consumer used by `bundle-hygiene.test.ts`.
// Imports ONLY the prod-safe `/provider` entry point.
import { RadixThemeProvider } from '../../provider';

export function App() {
  return (
    <RadixThemeProvider defaultTheme={{ accentColor: 'indigo' }}>
      <span>app</span>
    </RadixThemeProvider>
  );
}
