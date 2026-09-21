/**
 * Default plugin id, shared by the event client, the plugin registration and
 * the no-op entry. Its own module so `/plugin-noop` can use it without
 * importing the event client.
 */
export const RADIX_THEME_PLUGIN_ID = 'radix-themes';
