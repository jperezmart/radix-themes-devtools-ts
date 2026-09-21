// Synthetic consumer used by `bundle-hygiene.test.ts`.
// Imports the `/plugin-noop` entry point — neither the panel nor the event
// client should survive into the bundle.
import { createRadixThemeNoOpPlugin } from '../../plugin-noop';

export const plugin = createRadixThemeNoOpPlugin();
