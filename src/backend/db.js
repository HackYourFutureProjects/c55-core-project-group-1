import sqlite3 from 'sqlite3';
import path from 'node:path';

const DB_FILE = path.resolve('src/database/movies_recommendation.db');

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

export function removeMovieFromWatchlist(db, movieId) {
  return run(
    db,
    'DELETE FROM watchlist WHERE movie_id = ?;',
    [movieId]
  );
}

export function getAllWatchlistMovies(db) {
  return all(
    db,
    'SELECT movie_id FROM watchlist ORDER BY id DESC;'
  );
}

export function isMovieInWatchlist(db, movieId) {
  return get(
    db,
    'SELECT 1 FROM watchlist WHERE movie_id = ? LIMIT 1;',
    [movieId]
  );
}

export async function clearWatchlist(db) {
  const result = await run(db, 'DELETE FROM watchlist;', []);
  return result.changes;
}

export function getWatchlistCount(db) {
  return get(
    db,
    'SELECT COUNT(*) as count FROM watchlist;'
  );
}
