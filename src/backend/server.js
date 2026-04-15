/* global process */
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan'; // automatically records server activity and shows it in the terminal

dotenv.config();

import router from './routes/movies.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/movies', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
