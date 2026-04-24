import express from 'express';
import {
  connectDb,
  closeDb,
  addMovieToWatchlist,
  getAllWatchlistMovies,
  removeMovieFromWatchlist,
} from '../db.js';

// Watchlist routes: list, add, and remove saved movie IDs.
const router = express.Router();

// GET all watchlist items
router.get('/', async (req, res) => {
  let db;

  try {
    db = await connectDb();
    const rows = await getAllWatchlistMovies(db);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

// ADD movie to watchlist
router.post('/', async (req, res) => {
  let db;
  const { movie_id } = req.body;
  const movieId = Number.parseInt(movie_id, 10);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({ error: 'movie_id is required' });
  }

  try {
    db = await connectDb();
    const result = await addMovieToWatchlist(db, movieId);

    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }

    res.status(201).json({ success: true, movie_id: movieId });
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Failed to add movie to watchlist' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

// REMOVE movie from watchlist
router.delete('/:movieId', async (req, res) => {
  let db;
  const movieId = Number.parseInt(req.params.movieId, 10);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return res.status(400).json({ error: 'movieId must be a positive integer' });
  }

  try {
    db = await connectDb();
    const result = await removeMovieFromWatchlist(db, movieId);

    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }

    return res.status(200).json({ success: true, movie_id: movieId });
  } catch (error) {
    console.error('Error removing movie:', error);
    return res.status(500).json({ error: 'Failed to remove movie from watchlist' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

export default router;
