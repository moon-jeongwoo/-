import { addDays, parseDateKey, todayKey as getTodayKey } from './date';

const MS_PER_DAY = 86_400_000;

// Recomputed from the full completions map on every call rather than
// incrementally maintained, because a backfilled date can merge two runs
// into one longer streak — only a full rescan handles that correctly.
export function calcCurrentStreak(
  completions: Record<string, true>,
  today: string = getTodayKey(),
): number {
  let cursor = today;
  if (!completions[cursor]) {
    cursor = addDays(cursor, -1);
    if (!completions[cursor]) return 0;
  }
  let streak = 0;
  while (completions[cursor]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function calcLongestStreak(completions: Record<string, true>): number {
  const keys = Object.keys(completions).sort();
  let longest = 0;
  let runLength = 0;
  let prevKey: string | null = null;
  for (const key of keys) {
    if (prevKey !== null && addDays(prevKey, 1) === key) {
      runLength += 1;
    } else {
      runLength = 1;
    }
    longest = Math.max(longest, runLength);
    prevKey = key;
  }
  return longest;
}

export function calcCompletionRate(
  completions: Record<string, true>,
  createdAt: string,
  today: string = getTodayKey(),
): number {
  const totalDays =
    Math.round(
      (parseDateKey(today).getTime() - parseDateKey(createdAt).getTime()) /
        MS_PER_DAY,
    ) + 1;
  if (totalDays < 1) return 0;

  let completedDays = 0;
  for (const key of Object.keys(completions)) {
    if (key >= createdAt && key <= today) completedDays += 1;
  }
  return Math.round((completedDays / totalDays) * 100);
}
