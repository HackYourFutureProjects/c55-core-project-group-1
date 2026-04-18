import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import http from 'http';

// Mock searchMovies BEFORE importing the router
vi.mock('../src/backend/movieApi.js', () => ({
  searchMovies: vi.fn(),
}));

import { searchMovies } from '../src/backend/movieApi.js';
import MoviesRouter from '../src/backend/routes/movies.js';

function startTestServer(app) {
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

function stopServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

describe('MoviesRouter /search', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api/movies', MoviesRouter);
    vi.clearAllMocks();
  });

  it('returns 400 when query is missing', async () => {
    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/movies/search`);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Search query is required');

    await stopServer(server);
  });

  it('returns movie results when searchMovies succeeds', async () => {
    searchMovies.mockResolvedValue([{ id: 1, title: 'Inception' }]);

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/movies/search?q=inception`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: 1, title: 'Inception' }]);
    expect(searchMovies).toHaveBeenCalledWith('inception');

    await stopServer(server);
  });

  it('returns 500 when searchMovies throws an error', async () => {
    searchMovies.mockRejectedValue(new Error('TMDB down'));

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/movies/search?q=test`);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Internal Server Error');

    await stopServer(server);
  });
});
