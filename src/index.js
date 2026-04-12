import express from 'express';
import morgan from 'morgan'; // automatically records server activity and shows it in the terminal
import movieRoutes from './routes/movieRoutes.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/', movieRoutes);

// Week 3 - JavaScript Modules - Default Exports
export default app;
