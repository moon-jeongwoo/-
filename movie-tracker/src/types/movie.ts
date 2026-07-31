export type WatchStatus = 'watchlist' | 'watched';

export interface MovieEntry {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genreIds: number[];
  status: WatchStatus;
  rating: number | null;
  memo: string;
  watchedDate: string | null;
  addedAt: string;
}

export type Theme = 'light' | 'dark';
