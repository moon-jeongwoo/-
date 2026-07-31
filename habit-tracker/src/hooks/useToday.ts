import { useEffect, useState } from 'react';
import { todayKey } from '../utils/date';

// Recomputes the local date-key exactly once, at the moment local midnight
// passes, so a tab left open overnight flips over on its own instead of
// needing a reload or click to notice the day changed.
export function useToday(): string {
  const [today, setToday] = useState(todayKey());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      const delay = nextMidnight.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        setToday(todayKey());
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  return today;
}
