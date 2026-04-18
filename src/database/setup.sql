CREATE TABLE watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    UNIQUE(movie_id)
);

CREATE TABLE preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre TEXT NOT NULL,
    UNIQUE(genre)
);
