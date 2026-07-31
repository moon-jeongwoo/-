import { useMemo } from 'react';
import type { Habit } from '../types/habit';
import { Heatmap } from './Heatmap';
import { calcCompletionRate, calcCurrentStreak, calcLongestStreak } from '../utils/stats';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onToggleDate: (dateKey: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, today, onToggleDate, onEdit, onDelete }: HabitCardProps) {
  const doneToday = !!habit.completions[today];

  const stats = useMemo(
    () => ({
      current: calcCurrentStreak(habit.completions, today),
      longest: calcLongestStreak(habit.completions),
      rate: calcCompletionRate(habit.completions, habit.createdAt, today),
    }),
    [habit.completions, habit.createdAt, today],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {habit.name}
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="수정"
            title="수정"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="삭제"
            title="삭제"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
          >
            🗑️
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggleDate(today)}
        aria-pressed={doneToday}
        className={`mb-3 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          doneToday
            ? 'border-transparent text-white'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        style={doneToday ? { backgroundColor: habit.color } : undefined}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-sm border text-[11px] leading-none ${
            doneToday ? 'border-white' : 'border-gray-400 dark:border-gray-500'
          }`}
        >
          {doneToday ? '✓' : ''}
        </span>
        {doneToday ? '오늘 완료' : '오늘 체크하기'}
      </button>

      <div className="mb-3 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>🔥 현재 {stats.current}일</span>
        <span>🏆 최장 {stats.longest}일</span>
        <span>📊 완료율 {stats.rate}%</span>
      </div>

      <Heatmap
        completions={habit.completions}
        color={habit.color}
        today={today}
        onToggleDate={onToggleDate}
      />
    </div>
  );
}
