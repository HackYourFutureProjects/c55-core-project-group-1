import express from 'express';
import {
  connectDb,
  closeDb,
  getPreferences,
  setPreferences,
} from '../db.js';
import { GENRE_MAP } from '../utils/genreMap.js';

// Preferences routes: expose available genres and persist selected genres.
const router = express.Router();

// Convert the static genre map into a sorted list for the frontend.
function buildGenreList() {
  return Object.entries(GENRE_MAP)
    .map(([key, id]) => ({
      id,
      key,
      name: key
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-'),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Return all supported genres in a display-friendly format.
router.get('/genres', (_req, res) => {
  res.json(buildGenreList());
});

// Fetch and return the user's currently saved genre preferences.
router.get('/', async (_req, res) => {
  let db;

  try {
    db = await connectDb();
    const genres = await getPreferences(db);
    return res.json({ genres });
  } catch (error) {
    console.error('Error loading preferences:', error);
    return res.status(500).json({ error: 'Failed to load preferences' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

// Validate and persist a new set of user genre preferences.
router.put('/', async (req, res) => {
  let db;
  const incoming = Array.isArray(req.body?.genres) ? req.body.genres : null;

  if (!incoming) {
    return res.status(400).json({ error: 'genres must be an array' });
  }

  const allowedGenres = new Set(Object.keys(GENRE_MAP));
  const normalizedGenres = Array.from(
    new Set(
      incoming
        .map((genre) => (typeof genre === 'string' ? genre.trim().toLowerCase() : ''))
        .filter((genre) => genre && allowedGenres.has(genre))
    )
  );

  if (normalizedGenres.length !== incoming.filter((v) => typeof v === 'string' && v.trim()).length) {
    return res.status(400).json({ error: 'One or more genres are invalid' });
  }

  try {
    db = await connectDb();
    await setPreferences(db, normalizedGenres);
    return res.status(200).json({ success: true, genres: normalizedGenres });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({ error: 'Failed to save preferences' });
  } finally {
    if (db) {
      await closeDb(db);
    }
  }
});

export default router;
