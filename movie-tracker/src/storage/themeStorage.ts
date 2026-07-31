import type { Theme } from '../types/movie';
import { safeGetJSON, safeSetJSON } from './storage';

const THEME_KEY = 'movie-tracker:theme:v1';

export function loadTheme(): Theme | null {
  return safeGetJSON<Theme | null>(THEME_KEY, null);
}

export function saveTheme(theme: Theme): void {
  safeSetJSON(THEME_KEY, theme);
}
