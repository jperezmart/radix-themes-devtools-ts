import { useState, useEffect } from 'react';
import type { DevtoolsShellTheme, RadixThemeConfig } from './types';
import type { RadixThemeEventClient } from './client';

/**
 * The panel renders inside the devtools shell, not inside the host app's
 * `<Theme>`, so Radix tokens are unavailable here. These are the few colours
 * the panel chrome needs, in each shell appearance.
 */
interface ShellPalette {
  fg: string;
  border: string;
  selectedBg: string;
  selectedFg: string;
}

const SHELL_PALETTE: Record<DevtoolsShellTheme, ShellPalette> = {
  light: {
    fg: '#1c2024',
    border: '#ccc',
    selectedBg: '#000',
    selectedFg: '#fff',
  },
  dark: {
    fg: '#edeef0',
    border: '#4a4a4a',
    selectedBg: '#edeef0',
    selectedFg: '#1c2024',
  },
};

const ACCENT_COLORS: RadixThemeConfig['accentColor'][] = [
  'gray',
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
];

const GRAY_COLORS: RadixThemeConfig['grayColor'][] = [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
];

const RADIUS_VALUES: RadixThemeConfig['radius'][] = [
  'none',
  'small',
  'medium',
  'large',
  'full',
];

const SCALING_VALUES: RadixThemeConfig['scaling'][] = [
  '90%',
  '95%',
  '100%',
  '105%',
  '110%',
];

interface PanelProps {
  client: RadixThemeEventClient;
  defaultTheme?: RadixThemeConfig;
  /** Light/dark appearance of the surrounding devtools shell. */
  shellTheme?: DevtoolsShellTheme;
}

export function RadixThemePanel({
  client,
  defaultTheme,
  shellTheme = 'light',
}: PanelProps) {
  const palette = SHELL_PALETTE[shellTheme];
  const [theme, setTheme] = useState<RadixThemeConfig>({
    accentColor: 'indigo',
    grayColor: 'slate',
    appearance: 'light',
    radius: 'medium',
    scaling: '100%',
    panelBackground: 'translucent',
    ...defaultTheme,
    ...client.currentTheme,
  });

  function update(patch: Partial<RadixThemeConfig>) {
    const next = { ...theme, ...patch };
    setTheme(next);
    client.currentTheme = next;
    client.emit('theme-changed', next);
  }

  useEffect(() => {
    client.currentTheme = theme;
    client.emit('theme-changed', theme);
  }, []);

  return (
    <div
      style={{
        padding: '16px',
        color: palette.fg,
        fontFamily: 'sans-serif',
        fontSize: '13px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Section label="Accent color">
        <ColorGrid
          colors={ACCENT_COLORS}
          selected={theme.accentColor}
          onSelect={v => update({ accentColor: v })}
          palette={palette}
        />
      </Section>

      <Section label="Gray color">
        <ColorGrid
          colors={GRAY_COLORS}
          selected={theme.grayColor}
          onSelect={v => update({ grayColor: v })}
          palette={palette}
        />
      </Section>

      <Section label="Appearance">
        <ToggleGroup
          options={['light', 'dark']}
          selected={theme.appearance}
          onSelect={v =>
            update({ appearance: v as RadixThemeConfig['appearance'] })
          }
          palette={palette}
        />
      </Section>

      <Section label="Radius">
        <ToggleGroup
          options={RADIUS_VALUES as string[]}
          selected={theme.radius}
          onSelect={v => update({ radius: v as RadixThemeConfig['radius'] })}
          palette={palette}
        />
      </Section>

      <Section label="Scaling">
        <ToggleGroup
          options={SCALING_VALUES as string[]}
          selected={theme.scaling}
          onSelect={v => update({ scaling: v as RadixThemeConfig['scaling'] })}
          palette={palette}
        />
      </Section>

      <Section label="Panel background">
        <ToggleGroup
          options={['solid', 'translucent']}
          selected={theme.panelBackground}
          onSelect={v =>
            update({
              panelBackground: v as RadixThemeConfig['panelBackground'],
            })
          }
          palette={palette}
        />
      </Section>

      <button
        onClick={() => {
          client.emit('theme-reset', undefined);
        }}
        style={{
          marginTop: '8px',
          padding: '6px 12px',
          cursor: 'pointer',
          borderRadius: '4px',
          border: `1px solid ${palette.border}`,
          background: 'transparent',
          color: 'inherit',
        }}
      >
        Reset
      </button>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontWeight: 600,
          marginBottom: '8px',
          textTransform: 'capitalize',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ColorGrid<T extends string>({
  colors,
  selected,
  onSelect,
  palette,
}: {
  colors: (T | undefined)[];
  selected: T | undefined;
  onSelect: (v: T) => void;
  palette: ShellPalette;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {colors.map(color => (
        <button
          key={color}
          title={color}
          onClick={() => color && onSelect(color)}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border:
              selected === color
                ? `2px solid ${palette.fg}`
                : '2px solid transparent',
            background: `var(--${color}-9, ${color})`,
            cursor: 'pointer',
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

function ToggleGroup({
  options,
  selected,
  onSelect,
  palette,
}: {
  options: string[];
  selected: string | undefined;
  onSelect: (v: string) => void;
  palette: ShellPalette;
}) {
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            border: `1px solid ${palette.border}`,
            background: selected === opt ? palette.selectedBg : 'transparent',
            color: selected === opt ? palette.selectedFg : 'inherit',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
