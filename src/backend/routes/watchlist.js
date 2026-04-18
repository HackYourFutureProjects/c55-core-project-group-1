import express from 'express';
import db, { addMovieToWatchlist } from '../db.js';

const router = express.Router();

// GET all watchlist items
router.get('/', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM watchlist');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// ADD movie to watchlist
router.post('/', async (req, res) => {
  const { movie_id } = req.body;

  if (!movie_id) {
    return res.status(400).json({ error: 'movie_id is required' });
  }

  try {
    await addMovieToWatchlist(movie_id);
    res.json({ success: true, movie_id });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Movie already in watchlist' });
    }

    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Failed to add movie to watchlist' });
  }
});

export default router;
