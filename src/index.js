import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// SEARCH ENDPOINT
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    res.json({ results: data.results });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

export default app;
