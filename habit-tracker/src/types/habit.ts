export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  completions: Record<string, true>;
}

export type Theme = 'light' | 'dark';
