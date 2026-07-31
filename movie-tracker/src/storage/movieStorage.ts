import type { MovieEntry } from '../types/movie';
import { safeGetJSON, safeSetJSON } from './storage';

const MOVIES_KEY = 'movie-tracker:movies:v1';

export function loadMovies(): Record<number, MovieEntry> {
  const value = safeGetJSON<Record<number, MovieEntry>>(MOVIES_KEY, {});
  return value && typeof value === 'object' ? value : {};
}

export function saveMovies(movies: Record<number, MovieEntry>): void {
  safeSetJSON(MOVIES_KEY, movies);
}
