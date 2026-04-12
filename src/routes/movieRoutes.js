import Router from 'express';
import { movieController } from '../controllers/movieController.js';

const movieRoutes = Router();

movieRoutes.get('/api/search', movieController.search);

// Week 3 - JavaScript Modules - Default Exports
export default movieRoutes;
