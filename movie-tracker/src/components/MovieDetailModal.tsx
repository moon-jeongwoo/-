import { useEffect, useState } from 'react';
import type { MovieEntry, WatchStatus } from '../types/movie';
import { POSTER_BASE } from '../api/tmdb';
import { todayKey } from '../utils/date';

interface MovieDetailModalProps {
  movie: MovieEntry | null;
  onClose: () => void;
  onUpdate: (id: number, changes: Partial<MovieEntry>) => void;
  onSetStatus: (id: number, status: WatchStatus) => void;
  onDelete: (id: number) => void;
}

export function MovieDetailModal({ movie, onClose, onUpdate, onSetStatus, onDelete }: MovieDetailModalProps) {
  const [memo, setMemo] = useState('');

  useEffect(() => {
    setMemo(movie?.memo ?? '');
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800"
      >
        <div className="flex gap-4 p-6">
          <div className="w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
            {movie.posterPath ? (
              <img
                src={`${POSTER_BASE}${movie.posterPath}`}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center text-xs text-gray-400">
                포스터 없음
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{movie.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{movie.releaseYear || '연도 미상'}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onSetStatus(movie.id, 'watchlist')}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  movie.status === 'watchlist'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                볼 예정
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(movie.id, 'watched')}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  movie.status === 'watched'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                시청 완료
              </button>
            </div>

            {movie.status === 'watched' && (
              <>
                <div className="mt-3 flex gap-1 text-2xl text-amber-500">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => onUpdate(movie.id, { rating: movie.rating === n ? null : n })}
                      aria-label={`별점 ${n}`}
                    >
                      {movie.rating != null && n <= movie.rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <label className="mt-2 block text-sm text-gray-500 dark:text-gray-400">
                  본 날짜
                  <input
                    type="date"
                    value={movie.watchedDate ?? todayKey()}
                    onChange={(e) => onUpdate(movie.id, { watchedDate: e.target.value })}
                    className="mt-1 block rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            onBlur={() => onUpdate(movie.id, { memo })}
            rows={3}
            placeholder="이 영화에 대한 감상을 남겨보세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="flex justify-between border-t border-gray-100 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onDelete(movie.id)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
