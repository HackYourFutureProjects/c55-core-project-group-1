import dotenv from 'dotenv';
dotenv.config();

export const movieService = {
  async searchMovies(query) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data.results;
  },
};
