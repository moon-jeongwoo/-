import type { Habit } from '../types/habit';
import { HabitCard } from './HabitCard';

interface DashboardProps {
  habits: Habit[];
  today: string;
  onToggleDate: (habitId: string, dateKey: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export function Dashboard({ habits, today, onToggleDate, onEdit, onDelete }: DashboardProps) {
  if (habits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        아직 등록된 습관이 없어요. "습관 추가" 버튼으로 첫 습관을 만들어보세요.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          today={today}
          onToggleDate={(dateKey) => onToggleDate(habit.id, dateKey)}
          onEdit={() => onEdit(habit)}
          onDelete={() => onDelete(habit.id)}
        />
      ))}
    </div>
  );
}
