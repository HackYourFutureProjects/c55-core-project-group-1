import Router from 'express';
import { movieController } from '../controllers/movieController.js';

const movieRoutes = Router();

movieRoutes.get('/search', movieController.search);
movieRoutes.get('/year', movieController.getByYear);

// Week 3 - JavaScript Modules - Default Exports
export default movieRoutes;
