import express from 'express';
import { searchMovies, getMovieDetails } from '../movieApi.js';

const router = express.Router();

// Search movies (supports genre, text search, trending, etc.)
router.get('/search', async (req, res) => {
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

// Get movie details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }
    const data = await getMovieDetails(id);
    if (!data) {
      return res.status(404).json({ error: `Movie with ID ${id} not found` });
    }
    res.json(data);
  } catch (error) {
    console.error('Details Route Error:', error.message);
    res
      .status(500)
      .json({ error: 'Internal Server Error fetching movie details' });
  }
});

export default router;
