import { useCallback, useEffect, useState } from 'react';
import type { Habit } from '../types/habit';
import { loadHabits, saveHabits } from '../storage/habitStorage';
import { todayKey } from '../utils/date';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = useCallback((name: string, color: string) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: todayKey(),
      completions: {},
    };
    setHabits((prev) => [...prev, habit]);
  }, []);

  const updateHabit = useCallback(
    (id: string, name: string, color: string) => {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, name, color } : h)),
      );
    },
    [],
  );

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleDate = useCallback((id: string, dateKey: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const completions = { ...h.completions };
        if (completions[dateKey]) {
          delete completions[dateKey];
        } else {
          completions[dateKey] = true;
        }
        return { ...h, completions };
      }),
    );
  }, []);

  return { habits, addHabit, updateHabit, deleteHabit, toggleDate };
}
