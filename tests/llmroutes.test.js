import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import http from 'http';

// Mock suggestMovies BEFORE importing the router
vi.mock('../src/backend/llm.js', () => ({
  suggestMovies: vi.fn(),
}));

import { suggestMovies } from '../src/backend/llm.js';
import llmRoutes from '../src/backend/routes/llmRoutes.js';

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

describe('POST /api/llm/suggest', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/llm', llmRoutes);
    vi.clearAllMocks();
  });

  it('returns 400 when prompt is missing or too short', async () => {
    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/llm/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hi' }), // too short
    });

    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe(
      'Please provide a prompt with at least 3 characters.'
    );

    await stopServer(server);
  });

  it('returns 200 and suggestion result when suggestMovies succeeds', async () => {
    suggestMovies.mockResolvedValue({
      source: 'tmdb',
      suggestions: [{ title: 'Inception' }],
    });

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/llm/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'dream heist', limit: 5 }),
    });

    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.suggestions.length).toBe(1);
    expect(suggestMovies).toHaveBeenCalledWith('dream heist', { limit: 5 });

    await stopServer(server);
  });

  it('returns 500 when suggestMovies throws an error', async () => {
    suggestMovies.mockRejectedValue(new Error('LLM failure'));

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/llm/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'thriller movie' }),
    });

    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Could not generate movie suggestions right now.');
    expect(body.details).toBe('LLM failure');

    await stopServer(server);
  });
});
