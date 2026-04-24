-- Core schema for local SQLite persistence.
-- watchlist keeps unique TMDB movie IDs selected by the user.
CREATE TABLE watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    UNIQUE(movie_id)
);

-- preferences stores unique normalized genre keys (for recommendations).
CREATE TABLE preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre TEXT NOT NULL,
    UNIQUE(genre)
);
