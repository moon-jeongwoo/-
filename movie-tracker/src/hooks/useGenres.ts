import { useEffect, useState } from 'react';
import { fetchGenreMap, hasApiKey } from '../api/tmdb';
import { loadGenreMap, saveGenreMap } from '../storage/genreStorage';

export function useGenres() {
  const [genreMap, setGenreMap] = useState<Record<number, string>>(() => loadGenreMap());

  useEffect(() => {
    if (!hasApiKey() || Object.keys(genreMap).length > 0) return;
    fetchGenreMap()
      .then((map) => {
        setGenreMap(map);
        saveGenreMap(map);
      })
      .catch(() => {
        // genre names are a nice-to-have for filter labels; failing silently
        // still leaves genreIds usable elsewhere
      });
  }, [genreMap]);

  return genreMap;
}
