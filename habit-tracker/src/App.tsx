import { useState } from 'react';
import type { Habit } from './types/habit';
import { useHabits } from './hooks/useHabits';
import { useTheme } from './hooks/useTheme';
import { useToday } from './hooks/useToday';
import { Dashboard } from './components/Dashboard';
import { HabitFormModal } from './components/HabitFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleDate } = useHabits();
  const { theme, toggleTheme } = useTheme();
  const today = useToday();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const openAddModal = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleSubmit = (name: string, color: string) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, name, color);
    } else {
      addHabit(name, color);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteHabit(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">습관 추적기</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + 습관 추가
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <Dashboard
          habits={habits}
          today={today}
          onToggleDate={toggleDate}
          onEdit={openEditModal}
          onDelete={(id) => setDeleteTarget(habits.find((h) => h.id === id) ?? null)}
        />
      </div>

      <HabitFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialHabit={editingHabit}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`"${deleteTarget?.name}" 습관을 삭제할까요? 기록도 함께 사라집니다.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default App;
