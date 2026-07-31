import type { MovieEntry } from '../types/movie';
import { POSTER_BASE } from '../api/tmdb';

interface MovieCardProps {
  movie: MovieEntry;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="aspect-[2/3] w-full bg-gray-200 dark:bg-gray-700">
        {movie.posterPath ? (
          <img
            src={`${POSTER_BASE}${movie.posterPath}`}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">포스터 없음</div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{movie.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{movie.releaseYear || '연도 미상'}</p>
        {movie.status === 'watched' && movie.rating != null && (
          <p className="mt-1 text-sm text-amber-500">
            {'★'.repeat(movie.rating)}
            {'☆'.repeat(5 - movie.rating)}
          </p>
        )}
      </div>
    </button>
  );
}
