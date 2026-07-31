# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This repository hosts five independent, unrelated apps:

1. **The weather app** (`weather-app/`) — a single-page Korean-language weather app (날씨 조회) built with plain HTML/CSS/JS — no build step, no bundler, no package.json. It fetches current/forecast weather from the OpenWeatherMap API and renders a live animated 3D background (rain, snow, sun/moon, drifting clouds, lightning flashes) with Three.js that reacts to the current weather condition. See [Weather App](#weather-app-weather-app) below.
2. **The habit tracker** (`habit-tracker/`) — a Korean-language habit-tracking dashboard built with React + Vite + TypeScript + Tailwind CSS. See [Habit Tracker app](#habit-tracker-app-habit-tracker) below.
3. **The movie tracker** (`movie-tracker/`) — a Korean-language movie watchlist/log built with React + Vite + TypeScript + Tailwind CSS, using the TMDB API for search. See [Movie Tracker app](#movie-tracker-app-movie-tracker) below.
4. **The ideal-type world cup** (`ideal-worldcup/`) — a Korean-language "이상형 월드컵" bracket-voting game built with Python (FastAPI) + SQLite on the backend and plain HTML/CSS/JS on the frontend (no build step). See [Ideal World Cup app](#ideal-world-cup-app-ideal-worldcup) below.
5. **The rock-paper-scissors AI** (`ai-rps-game/`) — a single-file Python console script, no dependencies. See [AI Rock-Paper-Scissors](#ai-rock-paper-scissors-ai-rps-game) below.

They share no code, dependencies, or build tooling — treat them as separate projects that happen to live in the same git repo.

## Weather App (`weather-app/`)

There is no build or test tooling. Serve the `weather-app/` directory as static files and open it in a browser:

```bash
npx --yes serve -l 5173 weather-app
```

(This matches the `weather-app` launch config in `.claude/launch.json`, used by the browser preview tool.) Opening `weather-app/index.html` directly via `file://` will not work for API calls due to CORS/fetch restrictions in some browsers — use a local server.

### API key setup

The app calls the OpenWeatherMap API directly from the browser using `window.OPENWEATHER_API_KEY`, set in `weather-app/config.js` (gitignored). To run locally, copy `config.example.js` to `config.js` inside `weather-app/`:

```bash
cp weather-app/config.example.js weather-app/config.js
```

Note: because this is a pure client-side app with no backend proxy, the API key is visible in the browser's Network tab to anyone who loads the deployed page — `config.js`/`.gitignore` only keeps the key out of git history, it does not hide it from end users at runtime.

### Architecture

Four files loaded in sequence by `index.html`, each with a distinct responsibility:

1. **`weather-bg.js`** — self-contained IIFE that owns the Three.js scene rendered on `#bg-canvas`. Exposes a single global entry point, `window.setWeatherScene(main, isNight)`, which toggles visibility of pre-built rain/snow/sun/cloud objects and swaps the page background gradient based on the OpenWeatherMap `weather[0].main` condition string (`Clear`, `Clouds`, `Rain`/`Drizzle`, `Thunderstorm`, `Snow`, else mist/fog/haze) and day/night state. It has no knowledge of the weather-fetching logic — `script.js` calls into it after a successful fetch.
2. **`config.js`** (gitignored, see above) — defines `window.OPENWEATHER_API_KEY`. `config.example.js` is the checked-in template.
3. **`script.js`** — all app logic: DOM wiring, geocoding (city name → lat/lon via OpenWeatherMap's geo API), fetching current weather + 5-day/3-hour forecast, grouping forecast entries into daily hi/lo cards, and rendering results into the DOM. Calls `window.setWeatherScene(...)` after each successful weather fetch to sync the 3D background.
4. **`style.css`** — layout/visual styling for the card UI (the 3D canvas sits behind it via `z-index`).

Key implementation details worth knowing before touching `script.js`:
- `CITY_ALIASES` is a hardcoded Korean-name → English-name map used to populate the `<datalist>` autocomplete; it does not affect actual geocoding accuracy.
- `geocodeCity()` biases toward results whose Korean local name starts with the query, then prefers `country === "KR"`, to compensate for OpenWeatherMap's geocoding sort order being imprecise for Korean queries.
- Forecast timestamps are shifted by the API's per-city `timezoneOffset` (`data.city.timezone`, seconds) and then read back with UTC getters (`getUTCHours()` etc.) — this is intentional; it's how local time-at-the-queried-city is derived from UTC epoch seconds without relying on the browser's own timezone.
- `groupForecastByDay()` picks the forecast entry closest to the 12:00 local slot as the representative icon/description for each day, while min/max temps are aggregated across all entries for that day.

## Habit Tracker app (`habit-tracker/`)

A self-contained React + Vite + TypeScript + Tailwind CSS v4 app with its own `package.json` — fully independent of the weather app (own `node_modules`, no shared code). It shows a dashboard of the user's habits, each rendered as a GitHub-contributions-style heatmap (last ~13 weeks), with current streak / longest streak / completion-rate stats. Data is stored **only** in `localStorage` (keys `habit-tracker:habits:v1` and `habit-tracker:theme:v1`) — there is no backend or API of any kind.

### Running it

```bash
cd habit-tracker
npm install
npm run dev
```

Serves on `http://localhost:5174` (fixed via `server.strictPort` in `vite.config.ts`, distinct from the weather app's port 5173 so both can run at once). Matches the `habit-tracker` launch config in `.claude/launch.json`.

### Architecture

- `src/types/habit.ts` — `Habit` type; `completions` is a `Record<string, true>` keyed by local date (`YYYY-MM-DD`), not a `Set`/array, so it's directly JSON-serializable.
- `src/utils/date.ts` — local-calendar date-key helpers. Always builds/reads date keys via local getters/setters (`getFullYear`/`getMonth`/`getDate`, `setDate`), **never** `toISOString()` or `new Date(dateString)`, since both parse in UTC and can shift the calendar day near midnight. This is the opposite pattern from the weather app's intentional UTC-shift trick — there's no external API timezone to compensate for here.
- `src/utils/stats.ts` — `calcCurrentStreak`/`calcLongestStreak`/`calcCompletionRate` are pure functions that rescan the full `completions` map on every call (not incrementally maintained counters), because a backfilled date can merge two runs into one longer streak — only a full rescan handles that correctly.
- `src/storage/` — thin `localStorage` wrappers (`storage.ts` generic JSON get/set with try/catch fallback, `habitStorage.ts`/`themeStorage.ts` per-key helpers).
- `src/hooks/useHabits.ts` / `useTheme.ts` — state + persistence; `useTheme` toggles a `dark` class on `<html>`, which Tailwind's `@custom-variant dark (&:where(.dark, .dark *))` (declared in `src/index.css`) targets instead of the OS `prefers-color-scheme` media query.
- `src/components/Heatmap.tsx` — any past/today cell is clickable to toggle that date's completion (backfill is unrestricted); future cells are rendered invisible/disabled.
- Tailwind v4 is wired in via the `@tailwindcss/vite` plugin directly (see `vite.config.ts`) — there is deliberately no `tailwind.config.js` or `postcss.config.js`, both are obsolete for this setup.

## Movie Tracker app (`movie-tracker/`)

A self-contained React + Vite + TypeScript + Tailwind CSS v4 app with its own `package.json` — same stack and conventions as the habit tracker, but fully independent (own `node_modules`, no shared code). Lets the user search movies via the TMDB API, add them to a watchlist, mark them watched with a 1–5 star rating + free-text memo + watched date, and view basic stats (total watched, average rating, top genres). Personal data (ratings/memos/status) is stored **only** in `localStorage` (key `movie-tracker:movies:v1`); movie metadata (title/poster/genre) comes from TMDB at search time and is cached onto the entry so the UI doesn't need to re-fetch it.

### Running it

```bash
cd movie-tracker
npm install
npm run dev
```

Serves on `http://localhost:5175` (fixed via `server.strictPort` in `vite.config.ts`). Matches the `movie-tracker` launch config in `.claude/launch.json`.

### API key setup

Unlike the weather app's `window.OPENWEATHER_API_KEY` global (no build step available there), this project has a Vite build step, so the TMDB key is injected via Vite's standard env var mechanism: copy `.env.example` to `.env` and set `VITE_TMDB_API_KEY` to a key from [themoviedb.org](https://www.themoviedb.org/settings/api) (free account signup required, no payment info). `.env` is gitignored; `src/api/tmdb.ts` throws a `MissingApiKeyError` if the key is absent, which `SearchBar.tsx` catches to show an inline setup hint instead of crashing. As with the weather app, this key is still visible in the browser's Network tab at runtime — acceptable here since TMDB's read endpoints are free-tier and rate-limited per key, not per request cost.

### Architecture

- `src/types/movie.ts` — `MovieEntry`; stored as `Record<number, MovieEntry>` keyed by the TMDB movie id (doubles as natural dedupe — `useMovies.addMovie` no-ops if the id already exists).
- `src/api/tmdb.ts` — thin `fetch` wrappers (`searchMovies`, `fetchGenreMap`) around TMDB's `/search/movie` and `/genre/movie/list` v3 endpoints; `POSTER_BASE` is the image CDN prefix images are served from (`posterPath` is stored relative, not as a full URL).
- `src/hooks/useGenres.ts` — fetches the TMDB genre id→name map once and caches it in `localStorage` (`movie-tracker:genres:v1`) since it almost never changes; used to render genre filter chips and stats labels without re-fetching per movie.
- `src/storage/` — same generic-wrapper pattern as the habit tracker (`storage.ts` try/catch JSON get/set, `movieStorage.ts`/`themeStorage.ts`/`genreStorage.ts` per-key helpers).
- `src/hooks/useMovies.ts` — CRUD + persistence, mirrors `habit-tracker`'s `useHabits.ts` shape; `setStatus('watched')` auto-fills `watchedDate` to today if not already set, `setStatus('watchlist')` clears it.
- `src/utils/date.ts` — same local-calendar date-key convention as the habit tracker (never `toISOString()`/`new Date(dateString)`).
- Dark mode (`useTheme.ts`, `ThemeToggle.tsx`, the `@custom-variant dark` in `index.css`) is copied verbatim from the habit tracker for visual parity between the two React apps.

## Ideal World Cup app (`ideal-worldcup/`)

A self-contained Python app (own `requirements.txt`, no shared code) — the first project in this repo with a real backend and database instead of `localStorage`. It's the classic Korean "이상형 월드컵" format: pick a bracket size (4/8/16), enter that many candidates (name + optional image URL), then repeatedly choose the winner of head-to-head pairs until one champion remains. Data (tournaments, candidates, matches) is stored in a SQLite file at `ideal-worldcup/data/app.db` — SQLite needs no separate server process to install or run, unlike MySQL/MongoDB; it's just the Python stdlib `sqlite3` module reading/writing that one file.

### Running it

```bash
cd ideal-worldcup
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

No virtual environment is used here, consistent with `ai-rps-game` in this repo — just a global `pip install`. Serves on `http://localhost:8000` (FastAPI serves both the JSON API and the static frontend, so there's no separate frontend dev server or CORS setup). Matches the `ideal-worldcup` launch config in `.claude/launch.json`.

### Architecture

- `app/schema.sql` — three tables: `tournaments` (has a nullable `champion_id`, set once a winner is decided), `candidates` (per-tournament, with a `wins` counter incremented on every match win — this is what the results bar chart sorts by), `matches` (`winner_id` is NULL until decided; `match_order` orders matches within whatever round is currently in progress).
- `app/db.py` — `get_connection()` opens the SQLite file with `row_factory = sqlite3.Row` (so columns can be read by name) and `PRAGMA foreign_keys = ON`; `init_db()` runs `schema.sql` on startup.
- `app/bracket.py` — the pure pairing logic, deliberately kept free of DB/FastAPI code: `make_first_round_pairs()` shuffles candidates and pairs them up; `make_next_round_pairs()` pairs the previous round's winners *without* reshuffling, since a bracket's whole point is that each side's position carries through the rounds.
- `app/main.py` — all API routes in one file (small enough not to need a router split). The key trick in `/api/tournaments/{id}/vote`: finding the "next match" never needs to track which round is current — `SELECT ... WHERE winner_id IS NULL ORDER BY match_order LIMIT 1` always works, because the next round's match rows simply don't exist yet until the current round fully completes (checked via `COUNT(*) WHERE winner_id IS NULL = 0`, at which point the winners are re-paired and inserted, or the tournament is closed out if only one winner remains).
- `static/` — three plain HTML pages (`index.html`, `play.html`, `result.html`) each with one matching JS file, plus a shared `api.js` (thin `fetch` wrappers, same "one file, one responsibility" convention as the weather app's `script.js`/`weather-bg.js` split) and one shared `style.css`. No React, no bundler — FastAPI's `StaticFiles` mount serves them as-is.

## AI Rock-Paper-Scissors (`ai-rps-game/`)

A single file, `rps_ai.py`, with no dependencies beyond the Python stdlib (`random`) and no package manifest — run directly with `python ai-rps-game/rps_ai.py`. It's a console rock-paper-scissors game where the "AI" learns the human player's habits rather than playing randomly: it keeps a transition table of "previous move → next move" counts (`build_empty_transition_table()`), predicts the player's next move from their last move (`predict_next_user_move()`), and plays the counter to that prediction (`decide_ai_move()`) — falling back to a random move whenever there isn't yet enough data for a given previous move. The file is written as a learning artifact with dense inline Korean comments explaining each Python construct (dict-of-dicts, `max(..., key=...)`, guard clauses); preserve that commenting style if editing it.
