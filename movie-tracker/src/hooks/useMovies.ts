import { useCallback, useEffect, useState } from 'react';
import type { MovieEntry, WatchStatus } from '../types/movie';
import type { TmdbSearchResult } from '../api/tmdb';
import { loadMovies, saveMovies } from '../storage/movieStorage';
import { todayKey } from '../utils/date';

export function useMovies() {
  const [movies, setMovies] = useState<Record<number, MovieEntry>>(() => loadMovies());

  useEffect(() => {
    saveMovies(movies);
  }, [movies]);

  const addMovie = useCallback((result: TmdbSearchResult) => {
    setMovies((prev) => {
      if (prev[result.id]) return prev;
      const entry: MovieEntry = {
        id: result.id,
        title: result.title,
        posterPath: result.posterPath,
        releaseYear: result.releaseYear,
        genreIds: result.genreIds,
        status: 'watchlist',
        rating: null,
        memo: '',
        watchedDate: null,
        addedAt: todayKey(),
      };
      return { ...prev, [result.id]: entry };
    });
  }, []);

  const updateMovie = useCallback((id: number, changes: Partial<MovieEntry>) => {
    setMovies((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      return { ...prev, [id]: { ...existing, ...changes } };
    });
  }, []);

  const setStatus = useCallback((id: number, status: WatchStatus) => {
    setMovies((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const watchedDate = status === 'watched' ? existing.watchedDate ?? todayKey() : null;
      return { ...prev, [id]: { ...existing, status, watchedDate } };
    });
  }, []);

  const removeMovie = useCallback((id: number) => {
    setMovies((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return {
    movies: Object.values(movies).sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    addMovie,
    updateMovie,
    setStatus,
    removeMovie,
  };
}
