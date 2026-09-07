// Synthetic consumer used by `bundle-hygiene.test.ts`.
// Imports the `/plugin` entry point — should pull in the event client.
import { createRadixThemePlugin } from '../../plugin';

export const plugin = createRadixThemePlugin({
  defaultTheme: { accentColor: 'indigo' },
});
