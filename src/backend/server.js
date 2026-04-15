/* global process */
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import router from './routes/movies.js';

const app = express();

app.use(express.json());
app.use('/api/movies', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
