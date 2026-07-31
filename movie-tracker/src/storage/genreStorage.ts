import { safeGetJSON, safeSetJSON } from './storage';

const GENRES_KEY = 'movie-tracker:genres:v1';

export function loadGenreMap(): Record<number, string> {
  const value = safeGetJSON<Record<number, string>>(GENRES_KEY, {});
  return value && typeof value === 'object' ? value : {};
}

export function saveGenreMap(genres: Record<number, string>): void {
  safeSetJSON(GENRES_KEY, genres);
}
