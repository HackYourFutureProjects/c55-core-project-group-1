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

// run: Internal helper for SQL commands that change data (INSERT, UPDATE, DELETE).
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