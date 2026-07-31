import { useMemo, useState } from 'react';
import type { MovieEntry } from './types/movie';
import { useMovies } from './hooks/useMovies';
import { useTheme } from './hooks/useTheme';
import { useGenres } from './hooks/useGenres';
import { SearchBar } from './components/SearchBar';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailModal } from './components/MovieDetailModal';
import { StatsPanel } from './components/StatsPanel';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const { movies, addMovie, updateMovie, setStatus, removeMovie } = useMovies();
  const { theme, toggleTheme } = useTheme();
  const genreMap = useGenres();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MovieEntry | null>(null);

  const addedIds = useMemo(() => new Set(movies.map((m) => m.id)), [movies]);
  const selected = selectedId != null ? movies.find((m) => m.id === selectedId) ?? null : null;

  const confirmDelete = () => {
    if (deleteTarget) {
      removeMovie(deleteTarget.id);
      if (selectedId === deleteTarget.id) setSelectedId(null);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">영화 기록</h1>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <div className="mb-6">
          <SearchBar onAdd={addMovie} addedIds={addedIds} />
        </div>

        <StatsPanel movies={movies} genreMap={genreMap} />

        <MovieGrid movies={movies} genreMap={genreMap} onSelect={(m) => setSelectedId(m.id)} />
      </div>

      <MovieDetailModal
        movie={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={updateMovie}
        onSetStatus={setStatus}
        onDelete={(id) => setDeleteTarget(movies.find((m) => m.id === id) ?? null)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`"${deleteTarget?.title}"을(를) 삭제할까요?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default App;
