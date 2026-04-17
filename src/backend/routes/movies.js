import express from 'express';
import { searchMovies } from '../movieApi.js';

const MoviesRouter = express.Router();

// Search movies (supports genre, text search, trending, etc.)
MoviesRouter.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q && !type) {
      return res
        .status(400)
        .json({ error: "Search query 'q' or 'type' is required" });
    }

    const data = await searchMovies(q, type);
    if (!data) {
      return res.status(404).json({ error: 'No movies found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Search Route Error:', error.message);
    res
      .status(500)
      .json({ error: 'Internal Server Error while searching movies' });
  }
});

export default MoviesRouter;
