import sqlite3 from 'sqlite3';
import path from 'node:path';

const DB_FILE = path.resolve('src/database/movies_recommendation.db');

// connectDB: Open SQLite connection to database file.
export function connectDb(dbPath = DB_FILE) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (error) => {
      if (error) {
        reject(error);
        return;
      }

      db.run('PRAGMA foreign_keys = ON;', (pragmaError) => {
        if (pragmaError) {
          reject(pragmaError);
          return;
        }

        resolve(db);
      });
    });
  });
}

// closeDb: Closes an open SQLite connection.
export function closeDb(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

// run: Internal helper for SQL commands (INSERT, UPDATE, DELETE).
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// get: Internal helper to fetch one row.
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row ?? null);
    });
  });
}

// all: Internal helper to fetch multiple rows.
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows || []);
    });
  });
}

/////////////////////////////////////////////////////
// WATCHLIST FUNCTIONS

// addMovieToWatchlist: Adds one movie_id to the watchlist table
export async function addMovieToWatchlist(db, movieId) {
  try {
    await run(
      db,
      'INSERT INTO watchlist (movie_id) VALUES (?);',
      [movieId]
    );
    return { success: true, movieId };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, message: 'Movie already in watchlist', movieId };
    }
    throw error;
  }
}

// removeMovieFromWatchlist: Removes one movie_id from the watchlist table
export async function removeMovieFromWatchlist(db, movieId) {
  const result = await run(
    db,
    'DELETE FROM watchlist WHERE movie_id = ?;',
    [movieId]
  );

  if (result.changes === 0) {
    return { success: false, message: 'Movie not found in watchlist', movieId };
  }

  return { success: true, movieId };
}

// getAllWatchlistMovies: Fetches all saved movie IDs in watchlist.
export function getAllWatchlistMovies(db) {
  return all(
    db,
    'SELECT movie_id FROM watchlist ORDER BY id DESC;'
  );
}

// isMovieInWatchlist: Checks if a movie already exists in watchlist.
export function isMovieInWatchlist(db, movieId) {
  return get(
    db,
    'SELECT 1 FROM watchlist WHERE movie_id = ? LIMIT 1;',
    [movieId]
  );
}

/////////////////////////////////////////////////////
// PREFERENCES FUNCTIONS

// getPreferences: Fetch all preferred genres
export async function getPreferences(db) {
  const rows = await all(db, 'SELECT genre FROM preferences;');
  return rows.map(row => row.genre);
}

// addPreference: Adds one genre key to user preferences.
export async function addPreference(db, genre) {
  const normalizedGenre = typeof genre === 'string' ? genre.trim().toLowerCase() : '';

  if (!normalizedGenre) {
    return { success: false, message: 'Genre is required' };
  }

  try {
    await run(db, 'INSERT INTO preferences (genre) VALUES (?);', [normalizedGenre]);
    return { success: true, genre: normalizedGenre };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: true, genre: normalizedGenre };
    }

    throw error;
  }
}

// removePreference: Removes one genre key from user preferences.
export async function removePreference(db, genre) {
  const normalizedGenre = typeof genre === 'string' ? genre.trim().toLowerCase() : '';

  if (!normalizedGenre) {
    return { success: false, message: 'Genre is required' };
  }

  const result = await run(
    db,
    'DELETE FROM preferences WHERE genre = ?;',
    [normalizedGenre]
  );

  if (result.changes === 0) {
    return { success: false, message: 'Genre not found', genre: normalizedGenre };
  }

  return { success: true, genre: normalizedGenre };
}

// setPreferences: Replaces existing preference set in a single operation.
export async function setPreferences(db, genres = []) {
  const normalizedGenres = Array.from(
    new Set(
      (Array.isArray(genres) ? genres : [])
        .map((genre) => (typeof genre === 'string' ? genre.trim().toLowerCase() : ''))
        .filter(Boolean)
    )
  );

  await run(db, 'BEGIN TRANSACTION;');

  try {
    await run(db, 'DELETE FROM preferences;');

    for (const genre of normalizedGenres) {
      await run(db, 'INSERT INTO preferences (genre) VALUES (?);', [genre]);
    }

    await run(db, 'COMMIT;');
    return { success: true, genres: normalizedGenres };
  } catch (error) {
    try {
      await run(db, 'ROLLBACK;');
    } catch {
      // Ignore rollback failures so the original error can be handled upstream.
    }

    throw error;
  }
}