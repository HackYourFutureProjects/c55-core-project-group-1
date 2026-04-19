import express from 'express';
import {
  searchMovies,
  getMoviesByGenre,
  getMoviesByYear,
  getMoviesByRating,
  searchActor,
  getMoviesByActor,
} from '../movieApi.js';


// Shared genre mapping used for search filters and recommendations
import { GENRE_MAP } from '../utils/genreMap.js';

import { connectDb, getPreferences } from '../db.js';
import { getRecommendedMovies } from '../movieApi.js';

const MoviesRouter = express.Router();

/////////////////////////////////////////////////////

// SEARCH ROUTE
MoviesRouter.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let data;

    switch (type) {
      case 'genre': {
        const genreId = GENRE_MAP[q.toLowerCase()] ?? q;
        data = await getMoviesByGenre(genreId);
        break;
      }

      case 'year':
        data = await getMoviesByYear(q);
        break;

      case 'rating':
        data = await getMoviesByRating(q);
        break;

      case 'actor': {
        const actors = await searchActor(q);
        if (actors.length === 0) return res.json([]);
        data = await getMoviesByActor(actors[0].id);
        break;
      }

      default:
        data = await searchMovies(q);
        break;
    }

    res.json(data);
  } catch (error) {
    console.error('Search Route Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/////////////////////////////////////////////////////
// AI RECOMMENDATIONS ROUTE

MoviesRouter.get('/recommendations', async (req, res) => {
  try {
    const db = await connectDb();

    const genres = await getPreferences(db);

    const movies = await getRecommendedMovies(genres);

    res.json(movies);
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default MoviesRouter;