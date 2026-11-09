/**
 * ThemeColors — applies the owner's theme colours (settings.theme) as CSS
 * variables on <html>. Tailwind's `brand` / `accent` colours read these
 * variables, so the whole landing page re-colours without a rebuild.
 * Renders nothing; restores the defaults from index.css on unmount.
 */
import { useEffect } from 'react';
import { themeVariables } from '../utils/color';

export const ThemeColors = ({ theme }) => {
  const primary = theme?.primaryColor;
  const secondary = theme?.secondaryColor;

  useEffect(() => {
    const vars = themeVariables({ primaryColor: primary, secondaryColor: secondary });
    const root = document.documentElement;
    Object.entries(vars).forEach(([name, value]) => root.style.setProperty(name, value));
    return () => Object.keys(vars).forEach((name) => root.style.removeProperty(name));
  }, [primary, secondary]);

  return null;
};

export default ThemeColors;
