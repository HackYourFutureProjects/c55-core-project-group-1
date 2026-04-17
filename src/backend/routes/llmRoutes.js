import express from 'express';
import { suggestMovies } from '../llm.js';

const router = express.Router();

router.post('/suggest', async (request, response) => {
	const { prompt, limit } = request.body ?? {};

	if (typeof prompt !== 'string' || prompt.trim().length < 3) {
		response.status(400).json({
			error: 'Please provide a prompt with at least 3 characters.',
		});
		return;
	}

	try {
		const result = await suggestMovies(prompt, { limit });
		response.status(200).json(result);
	} catch (error) {
		response.status(500).json({
			error: 'Could not generate movie suggestions right now.',
			details: error.message,
		});
	}
});

export default router;
