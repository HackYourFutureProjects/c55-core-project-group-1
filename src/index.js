/*
    I faced some difficulty running HTML files with Express.js.
    With the help of AI, I wrote some lines of code, and now I need to understand how they work.
*/

import express from 'express';
import morgan from 'morgan'; // automatically records server activity and shows it in the terminal
import movieRoutes from './routes/movieRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../public')));

// This line serves the index.html file when the user visits the homepage
// AI help me when this code
app.get('/', (res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/movies', movieRoutes);
// app.use('/watchlist', watchlistRoutes); // not implemented yet

// Week 3 - JavaScript Modules - Default Exports
export default app;
