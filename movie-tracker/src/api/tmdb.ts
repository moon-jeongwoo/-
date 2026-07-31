const API_BASE = 'https://api.themoviedb.org/3';
export const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export class MissingApiKeyError extends Error {
  constructor() {
    super('TMDB API 키가 설정되지 않았습니다.');
    this.name = 'MissingApiKeyError';
  }
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  genreIds: number[];
}

function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) throw new MissingApiKeyError();
  return key;
}

export function hasApiKey(): boolean {
  return Boolean(import.meta.env.VITE_TMDB_API_KEY);
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const apiKey = getApiKey();
  const url = `${API_BASE}/search/movie?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB 검색 실패: ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as number,
    title: (r.title as string) ?? '',
    posterPath: (r.poster_path as string | null) ?? null,
    releaseYear: typeof r.release_date === 'string' && r.release_date ? r.release_date.slice(0, 4) : '',
    genreIds: (r.genre_ids as number[]) ?? [],
  }));
}

export async function fetchGenreMap(): Promise<Record<number, string>> {
  const apiKey = getApiKey();
  const url = `${API_BASE}/genre/movie/list?api_key=${apiKey}&language=ko-KR`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB 장르 조회 실패: ${res.status}`);
  const data = await res.json();

  const map: Record<number, string> = {};
  for (const g of data.genres ?? []) {
    map[g.id] = g.name;
  }
  return map;
}
