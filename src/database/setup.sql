-- ------------------------------------------------------------
-- Schema
-- ------------------------------------------------------------
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT  -- this isn't important and login will not get affected if password is not given.
    );

-- preferences table tracks genre preferences 
CREATE TABLE preferences (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    genre_id    INTEGER, -- From genre API
    FOREIGN KEY (user_id) REFERENCES users(id)
    );

-- watchlist table tracks specific movies.
CREATE TABLE watchlist (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    movie_id    INTEGER, -- From movies API
    FOREIGN KEY (user_id) REFERENCES users(id)
    );