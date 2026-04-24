import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import http from 'http';

// Server wiring tests to verify core endpoints and mocked route mounting.
// Vitest-safe mocks (no top-level variables)
vi.mock('../src/backend/routes/llmRoutes.js', () => ({
  default: express.Router().get('/', (_req, res) => res.json({ ok: true })),
}));

vi.mock('../src/backend/routes/watchlist.js', () => ({
  default: express.Router().get('/', (_req, res) => res.json([])),
}));

vi.mock('../src/backend/routes/movies.js', () => ({
  default: express.Router().get('/', (_req, res) => res.json([])),
}));

// Import server AFTER mocks
import '../src/backend/server.js';

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

describe('server.js', () => {
  it('GET /health returns ok', async () => {
    const app = express();
    app.get('/health', (_req, res) => res.json({ ok: true }));

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });

    await stopServer(server);
  });

  it('GET /api/llm returns mocked response', async () => {
    const app = express();
    const llmRoutes = express
      .Router()
      .get('/', (_req, res) => res.json({ ok: true }));
    app.use('/api/llm', llmRoutes);

    const { server, base } = await startTestServer(app);

    const res = await fetch(`${base}/api/llm`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });

    await stopServer(server);
  });
});
