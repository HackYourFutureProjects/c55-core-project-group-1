/* global process */
import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import llmRoutes from './routes/llmRoutes.js';
import moviesRoutes from './routes/movies.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.resolve('frontend')));

app.use('/api/llm', llmRoutes);

app.use('/api/movies', moviesRoutes);
app.get('/health', (_request, response) => {
  response.status(200).json({ ok: true });
});

const rawPort =
  typeof process.env.PORT === 'string'
    ? process.env.PORT.replace(/[^0-9]/g, '')
    : '';
const PORT = Number.parseInt(rawPort || '3000', 10);
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
});