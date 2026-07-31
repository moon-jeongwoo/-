import { useMemo } from 'react';
import type { MovieEntry } from '../types/movie';

interface StatsPanelProps {
  movies: MovieEntry[];
  genreMap: Record<number, string>;
}

export function StatsPanel({ movies, genreMap }: StatsPanelProps) {
  const stats = useMemo(() => {
    const watched = movies.filter((m) => m.status === 'watched');
    const now = new Date();
    const thisMonthCount = watched.filter((m) => {
      if (!m.watchedDate) return false;
      const [y, mo] = m.watchedDate.split('-').map(Number);
      return y === now.getFullYear() && mo === now.getMonth() + 1;
    }).length;

    const rated = watched.filter((m) => m.rating != null);
    const avgRating =
      rated.length > 0 ? rated.reduce((sum, m) => sum + (m.rating ?? 0), 0) / rated.length : null;

    const genreCounts = new Map<number, number>();
    watched.forEach((m) => {
      m.genreIds.forEach((id) => {
        genreCounts.set(id, (genreCounts.get(id) ?? 0) + 1);
      });
    });
    const topGenres = Array.from(genreCounts.entries())
      .filter(([id]) => genreMap[id])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxGenreCount = topGenres[0]?.[1] ?? 0;

    return { watchedCount: watched.length, thisMonthCount, avgRating, topGenres, maxGenreCount };
  }, [movies, genreMap]);

  if (movies.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">총 시청</p>
        <p className="text-2xl font-semibold">{stats.watchedCount}편</p>
        <p className="text-xs text-gray-400">이번 달 {stats.thisMonthCount}편</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">평균 별점</p>
        <p className="text-2xl font-semibold">{stats.avgRating != null ? stats.avgRating.toFixed(1) : '-'}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">많이 본 장르</p>
        {stats.topGenres.length === 0 ? (
          <p className="text-sm text-gray-400">-</p>
        ) : (
          <div className="space-y-1">
            {stats.topGenres.map(([id, count]) => (
              <div key={id} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 truncate">{genreMap[id]}</span>
                <div className="h-2 flex-1 rounded bg-gray-100 dark:bg-gray-700">
                  <div
                    className="h-2 rounded bg-blue-500"
                    style={{ width: `${(count / stats.maxGenreCount) * 100}%` }}
                  />
                </div>
                <span className="w-4 shrink-0 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
