import { useEffect, useState, type FormEvent } from 'react';
import type { Habit } from '../types/habit';
import { PRESET_COLORS } from '../constants';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
  initialHabit?: Habit | null;
}

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialHabit,
}: HabitFormModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      setName(initialHabit?.name ?? '');
      setColor(initialHabit?.color ?? PRESET_COLORS[0]);
    }
  }, [isOpen, initialHabit]);

  if (!isOpen) return null;

  const trimmed = name.trim();
  const isEdit = !!initialHabit;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed, color);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEdit ? '습관 수정' : '새 습관 추가'}
        </h2>

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          이름
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 물 마시기"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          색상
        </label>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`h-7 w-7 rounded-full ${
                color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-offset-gray-800 dark:ring-gray-100' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
            aria-label="사용자 지정 색상"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!trimmed}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </div>
  );
}
