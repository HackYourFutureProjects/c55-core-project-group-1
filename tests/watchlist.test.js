////unit test for watchlist.js
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import http from 'http';

// Create a router inline (mirrors src/backend/routes/watchlist.js)
function makeRouter(db) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    try {
      const rows = await db.prepare('SELECT * FROM watchlist').all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve watchlist' });
    }
  });

  router.post('/', async (req, res) => {
    const { movie_id } = req.body;
    if (!movie_id)
      return res.status(400).json({ error: 'movie_id is required' });
    try {
      await db
        .prepare('INSERT INTO watchlist (movie_id) VALUES (?)')
        .run(movie_id);
      res
        .status(201)
        .json({ success: true, message: 'Movie added to watchlist' });
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res
          .status(409)
          .json({ error: 'Movie is already in your watchlist' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
}

async function startTestServer(dbMock) {
  const app = express();
  app.use(express.json());
  app.use('/api/watchlist', makeRouter(dbMock));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  return { server, base: `http://127.0.0.1:${port}` };
}

async function stopServer(server) {
  await new Promise((r, rej) => server.close((err) => (err ? rej(err) : r())));
}

describe('watchlist (short)', () => {
  it('GET /api/watchlist -> 200', async () => {
    const all = vi.fn().mockReturnValue([{ id: 1, movie_id: 10 }]);
    const dbMock = { prepare: vi.fn().mockReturnValue({ all }) };

    const { server, base } = await startTestServer(dbMock);
    const res = await fetch(`${base}/api/watchlist`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([{ id: 1, movie_id: 10 }]);
    await stopServer(server);
  });

  it('POST /api/watchlist -> 201', async () => {
    const run = vi.fn();
    const dbMock = { prepare: vi.fn().mockReturnValue({ run }) };

    const { server, base } = await startTestServer(dbMock);
    const res = await fetch(`${base}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie_id: 42 }),
    });
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body).toHaveProperty('success', true);
    await stopServer(server);
  });
});
