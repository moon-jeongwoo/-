import { useMemo, useState } from 'react';
import type { MovieEntry, WatchStatus } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: MovieEntry[];
  genreMap: Record<number, string>;
  onSelect: (movie: MovieEntry) => void;
}

type StatusFilter = WatchStatus | 'all';

export function MovieGrid({ movies, genreMap, onSelect }: MovieGridProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [genreFilter, setGenreFilter] = useState<number | null>(null);

  const availableGenres = useMemo(() => {
    const ids = new Set<number>();
    movies.forEach((m) => m.genreIds.forEach((id) => ids.add(id)));
    return Array.from(ids)
      .filter((id) => genreMap[id])
      .sort((a, b) => genreMap[a].localeCompare(genreMap[b]));
  }, [movies, genreMap]);

  const filtered = movies.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (genreFilter != null && !m.genreIds.includes(genreFilter)) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(['all', 'watchlist', 'watched'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {s === 'all' ? '전체' : s === 'watchlist' ? '볼 예정' : '시청 완료'}
          </button>
        ))}
      </div>

      {availableGenres.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGenreFilter(null)}
            className={`rounded-full px-2.5 py-0.5 text-xs ${
              genreFilter === null
                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            모든 장르
          </button>
          {availableGenres.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setGenreFilter(id)}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                genreFilter === id
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {genreMap[id]}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          {movies.length === 0
            ? '아직 등록된 영화가 없어요. 위에서 검색해서 추가해보세요.'
            : '조건에 맞는 영화가 없어요.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} onClick={() => onSelect(m)} />
          ))}
        </div>
      )}
    </div>
  );
}
