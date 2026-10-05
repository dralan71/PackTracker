export type ColourPreset = {
  name: string;
  hex: string;
};

/** Common clothing colours — distinct enough to tell apart at a glance. */
export const COLOUR_PRESETS: ColourPreset[] = [
  { name: 'White', hex: '#f4f1ea' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Grey', hex: '#8a8a8a' },
  { name: 'Blue', hex: '#4a7ab5' },
  { name: 'Beige', hex: '#c4a882' },
  { name: 'Olive', hex: '#6b7c3e' },
  { name: 'Burgundy', hex: '#7a2e3a' },
  { name: 'Brown', hex: '#6b4423' },
  { name: 'Pink', hex: '#d4a0a8' },
  { name: 'Red', hex: '#b33a3a' },
  { name: 'Orange', hex: '#c4773b' },
  { name: 'Purple', hex: '#6b4a8a' },
  { name: 'Yellow', hex: '#c9a84c' },
  { name: 'Teal', hex: '#3d8a8a' },
  { name: 'Green', hex: '#4a8a5a' },
];

export function normalizeColour(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const hex = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
}
