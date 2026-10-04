export type ColourPreset = {
  name: string;
  hex: string;
};

/** Common clothing colours — distinct enough to tell apart at a glance. */
export const COLOUR_PRESETS: ColourPreset[] = [
  { name: 'White', hex: '#f4f1ea' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Grey', hex: '#8a8a8a' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Blue', hex: '#4a7ab5' },
  { name: 'Light blue', hex: '#8bb8d8' },
  { name: 'Beige', hex: '#c4a882' },
  { name: 'Olive', hex: '#6b7c3e' },
  { name: 'Burgundy', hex: '#7a2e3a' },
  { name: 'Brown', hex: '#6b4423' },
  { name: 'Pink', hex: '#d4a0a8' },
  { name: 'Red', hex: '#b33a3a' },
];

export function normalizeColour(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const hex = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
}
