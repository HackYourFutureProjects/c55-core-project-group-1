import express from 'express';
import {
  connectDb,
  closeDb,
  addMovieToWatchlist,
  getAllWatchlistMovies,
} from '../db.js';

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
    await closeDb(db);
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
    await closeDb(db);
  }
});

export default router;
