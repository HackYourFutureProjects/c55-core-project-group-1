import express from 'express';
import {
  searchMovies,
  getMoviesByGenre,
  getMoviesByYear,
  getMoviesByRating,
  searchActor,
  getMoviesByActor,
  getMovieById,
} from '../movieApi.js';
import {
  connectDb,
  closeDb,
  getAllWatchlistMovies,
  getPreferences,
} from '../db.js';


// Shared genre mapping used for search filters and recommendations
import { GENRE_MAP } from '../utils/genreMap.js';
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

MoviesRouter.get('/watchlist-display', async (_req, res) => {
  let db;

  try {
    db = await connectDb();
    const rows = await getAllWatchlistMovies(db);

    if (rows.length === 0) {
      return res.json([]);
    }

    const movies = await Promise.all(
      rows.map(async ({ movie_id }) => getMovieById(movie_id))
    );

    return res.json(movies.filter(Boolean));
  } catch (error) {
    console.error('Watchlist display error:', error.message);
    return res.status(500).json({ error: 'Failed to load watchlist movies' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

MoviesRouter.get('/recommendations', async (_req, res) => {
  let db;

  try {
    db = await connectDb();
    const genres = await getPreferences(db);
    const movies = await getRecommendedMovies(genres);

    return res.json(movies);
  } catch (error) {
    console.error('Recommendation Error:', error);
    return res.status(500).json({ error: 'Failed to get recommendations' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

MoviesRouter.get('/:id', async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    res.json(movie);
  } catch (error) {
    console.error('Search Route Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

export default MoviesRouter;
