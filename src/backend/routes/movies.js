import express from 'express';

import { searchMovies } from '../movieApi.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const movies = await searchMovies(query);
    res.json(movies);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
