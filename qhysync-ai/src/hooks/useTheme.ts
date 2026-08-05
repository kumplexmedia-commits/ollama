import { useEffect } from 'react';

export type ThemeType = 'cyber' | 'dark' | 'slate' | 'oled' | 'light';

export function useTheme(theme: ThemeType = 'cyber') {
  useEffect(() => {
    const root = document.documentElement;

    // Remove old classes
    root.classList.remove('theme-cyber', 'theme-dark', 'theme-slate', 'theme-oled', 'theme-light', 'light', 'dark');

    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark', `theme-${theme}`);
    }

    // Set dataset attribute for custom styling
    root.setAttribute('data-theme', theme);
  }, [theme]);
}
