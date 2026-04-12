import { movieService } from '../services/movieService.js';

export const movieController = {
  async search(req, res) {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    try {
      const results = await movieService.searchMovies(query);
      res.json({ results });
    } catch (error) {
      console.error('Search error:', error.message);
      res.status(500).json({ error: 'Failed to fetch search results' });
    }
  },

  async getByYear() {
    // Implement
  },
};
