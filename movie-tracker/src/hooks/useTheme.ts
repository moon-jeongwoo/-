import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '../types/movie';
import { loadTheme, saveTheme } from '../storage/themeStorage';

function getInitialTheme(): Theme {
  const stored = loadTheme();
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
