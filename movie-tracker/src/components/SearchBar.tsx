import { useEffect, useRef, useState } from 'react';
import { searchMovies, POSTER_BASE, MissingApiKeyError } from '../api/tmdb';
import type { TmdbSearchResult } from '../api/tmdb';

interface SearchBarProps {
  onAdd: (result: TmdbSearchResult) => void;
  addedIds: Set<number>;
}

export function SearchBar({ onAdd, addedIds }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchMovies(trimmed)
        .then((r) => {
          setResults(r);
          setError(null);
          setIsOpen(true);
        })
        .catch((err) => {
          setResults([]);
          setError(
            err instanceof MissingApiKeyError
              ? 'TMDB API 키가 설정되지 않았어요. movie-tracker/.env 파일에 VITE_TMDB_API_KEY를 넣어주세요.'
              : '검색 중 오류가 발생했어요.',
          );
          setIsOpen(true);
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="영화 제목으로 검색..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      {isOpen && error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {isOpen && loading && !error && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">검색 중...</p>
      )}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((r) => {
            const added = addedIds.has(r.id);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => onAdd(r)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
                >
                  {r.posterPath ? (
                    <img
                      src={`${POSTER_BASE}${r.posterPath}`}
                      alt=""
                      className="h-14 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span className="flex-1">
                    <span className="block font-medium text-gray-900 dark:text-gray-100">{r.title}</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      {r.releaseYear || '연도 미상'}
                    </span>
                  </span>
                  {added && <span className="text-sm text-green-600 dark:text-green-400">추가됨</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
