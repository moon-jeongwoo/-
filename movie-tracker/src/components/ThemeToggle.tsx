import type { Theme } from '../types/movie';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="테마 전환"
      title="라이트/다크 모드 전환"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
