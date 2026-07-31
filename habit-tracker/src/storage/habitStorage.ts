import type { Habit } from '../types/habit';
import { safeGetJSON, safeSetJSON } from './storage';

const HABITS_KEY = 'habit-tracker:habits:v1';

export function loadHabits(): Habit[] {
  const value = safeGetJSON<Habit[]>(HABITS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveHabits(habits: Habit[]): void {
  safeSetJSON(HABITS_KEY, habits);
}
