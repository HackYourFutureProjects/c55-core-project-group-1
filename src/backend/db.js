import sqlite3 from 'sqlite3';
import path from 'node:path';

const DB_FILE = path.resolve('src/database/movies_recommendation.db');

// connectDB: Open SQLite connection to database file.
export function connectDb(dbPath = DB_FILE) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (error) => {
      if (error) return reject(error);

      db.run('PRAGMA foreign_keys = ON;', (pragmaError) => {
        if (pragmaError) return reject(pragmaError);
        resolve(db);
      });
    });
  });
}

// closeDb: Closes an open SQLite connection.
export function closeDb(db) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(); // safety check

    db.close((error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

// run: helper for INSERT, UPDATE, DELETE
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) return reject(error);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// get: helper for single row
function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) return reject(error);
      resolve(row ?? null);
    });
  });
}

// all: helper for multiple rows
function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) return reject(error);
      resolve(rows || []);
    });
  });
}

// addMovieToWatchlist
export async function addMovieToWatchlist(db, movieId) {
  if (!movieId) {
    throw new Error('movieId is required');
  }

  try {
    await run(
      db,
      'INSERT INTO watchlist (movie_id) VALUES (?);',
      [movieId]
    );

    return { success: true, movieId };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        message: 'Movie already in watchlist',
        movieId,
      };
    }
    throw error;
  }
}

// get all movies
export function getAllWatchlistMovies(db) {
  return all(
    db,
    'SELECT movie_id FROM watchlist ORDER BY id DESC;'
  );
}

// check if movie exists (returns boolean)
export async function isMovieInWatchlist(db, movieId) {
  if (!movieId) {
    throw new Error('movieId is required');
  }

  const result = await get(
    db,
    'SELECT 1 FROM watchlist WHERE movie_id = ? LIMIT 1;',
    [movieId]
  );

  return !!result;
}