import express from 'express';
import {
  searchMovies,
  getMoviesByGenre,
  getMoviesByYear,
  getMoviesByRating,
  searchActor,
  getMoviesByActor,
} from '../movieApi.js';

const MoviesRouter = express.Router();

const GENRE_MAP = {
  action: 28,
  comedy: 35,
  drama: 18,
  'sci-fi': 878,
  adventure: 12,
  horror: 27,
  romance: 10749,
  thriller: 53,
  animation: 16,
  documentary: 99,
};

MoviesRouter.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q) return res.status(400).json({ error: 'Search query is required' });

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

      default: // title
        data = await searchMovies(q);
        break;
    }

    res.json(data);
  } catch (error) {
    console.error('Search Route Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default MoviesRouter;
