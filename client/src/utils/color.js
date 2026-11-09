/**
 * Colour helpers for the owner-editable theme (settings.theme).
 * Tailwind's `brand` / `accent` colours read CSS variables holding "R G B"
 * triplets, so <ThemeColors> can recolour the whole landing page at runtime.
 */
const HEX_RE = /^#?([0-9a-f]{6})$/i;

/** "#7c3aed" -> [124, 58, 237] (null when invalid) */
export const hexToRgb = (hex) => {
  const match = HEX_RE.exec(hex || '');
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Mixes an RGB colour with white (amount > 0) or black (amount < 0). */
export const mixRgb = ([r, g, b], amount) => {
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return [r, g, b].map((c) => Math.round(c + (target - c) * t));
};

export const rgbTriplet = (rgb) => rgb.join(' ');

/**
 * CSS variable map for a theme:
 *   --color-brand / -light / -dark and --color-accent / -light
 */
export const themeVariables = ({ primaryColor, secondaryColor } = {}) => {
  const vars = {};
  const brand = hexToRgb(primaryColor);
  const accent = hexToRgb(secondaryColor);
  if (brand) {
    vars['--color-brand'] = rgbTriplet(brand);
    vars['--color-brand-light'] = rgbTriplet(mixRgb(brand, 0.35));
    vars['--color-brand-dark'] = rgbTriplet(mixRgb(brand, -0.25));
  }
  if (accent) {
    vars['--color-accent'] = rgbTriplet(accent);
    vars['--color-accent-light'] = rgbTriplet(mixRgb(accent, 0.35));
  }
  return vars;
};
