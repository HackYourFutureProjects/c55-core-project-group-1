/* global process */

import {
	getNowPlayingMovies,
	getPopularMovies,
	getTopRatedMovies,
	getUpcomingMovies,
	searchMovies,
} from './movieApi.js';

// Safety defaults for predictable API behavior.
const DEFAULT_LIMIT = 5;
const LLM_TIMEOUT_MS = 10_000;
const MAX_SEARCH_QUERIES = 6;

// Common filler words removed from fallback query expansion.
const STOP_WORDS = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'has',
	'he',
	'i',
	'in',
	'is',
	'it',
	'its',
	'me',
	'movie',
	'movies',
	'of',
	'on',
	'or',
	'that',
	'the',
	'this',
	'to',
	'was',
	'with',
	'you',
	'about',
	'like',
	'where',
	'which',
	'who',
	'what',
	'when',
	'why',
	'how',
]);

const TMDB_GENRES = {
	28: 'Action',
	12: 'Adventure',
	16: 'Animation',
	35: 'Comedy',
	80: 'Crime',
	99: 'Documentary',
	18: 'Drama',
	10751: 'Family',
	14: 'Fantasy',
	36: 'History',
	27: 'Horror',
	10402: 'Music',
	9648: 'Mystery',
	10749: 'Romance',
	878: 'Sci-Fi',
	10770: 'TV Movie',
	53: 'Thriller',
	10752: 'War',
	37: 'Western',
};

const ALLOWED_STRATEGIES = new Set(['search', 'popular', 'top_rated', 'upcoming', 'now_playing']);

// Clamp client-provided limits to a small range.
function normalizeLimit(limit) {
	const numeric = Number(limit);
	if (!Number.isInteger(numeric) || numeric < 1) {
		return DEFAULT_LIMIT;
	}

	return Math.min(numeric, 10);
}

// Convert "YYYY-MM-DD" from TMDB into a numeric year.
function getYearFromReleaseDate(releaseDate) {
	if (typeof releaseDate !== 'string' || releaseDate.length < 4) {
		return null;
	}

	const year = Number.parseInt(releaseDate.slice(0, 4), 10);
	return Number.isNaN(year) ? null : year;
}

// Pick the first known TMDB genre id and map it to a label.
function getGenreName(movie) {
	if (!Array.isArray(movie?.genre_ids) || movie.genre_ids.length === 0) {
		return 'Unknown';
	}

	const [firstKnownGenreId] = movie.genre_ids.filter((id) => TMDB_GENRES[id]);
	if (firstKnownGenreId) {
		return TMDB_GENRES[firstKnownGenreId];
	}

	return 'Unknown';
}

// Prefer TMDB overview text as the explanation shown in the UI.
function buildReason(movie, prompt) {
	if (typeof movie?.overview === 'string' && movie.overview.trim()) {
		const trimmedOverview = movie.overview.trim();
		return trimmedOverview.length > 160
			? `${trimmedOverview.slice(0, 157)}...`
			: trimmedOverview;
	}

	return `Suggested from TMDB results for "${prompt}".`;
}

// Map raw TMDB movie data into the frontend suggestion shape.
function mapTmdbMovieToSuggestion(movie, prompt) {
	const title = typeof movie?.title === 'string' ? movie.title.trim() : '';
	if (!title) {
		return null;
	}

	return {
		title,
		year: getYearFromReleaseDate(movie.release_date),
		genre: getGenreName(movie),
		reason: buildReason(movie, prompt),
	};
}

// Parse model output and tolerate responses wrapped in markdown code fences.
function parseLlmJson(content) {
	if (typeof content !== 'string') {
		return null;
	}

	const trimmed = content.trim();
	const unwrapped = trimmed.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

	try {
		return JSON.parse(unwrapped);
	} catch {
		return null;
	}
}

// Normalize text so token matching is case-insensitive and punctuation-safe.
function normalizeText(input) {
	return input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

// Split text into meaningful tokens for search and fallback query building.
function tokenize(text) {
	if (typeof text !== 'string') {
		return [];
	}

	return normalizeText(text)
		.split(/\s+/)
		.filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

// Deduplicate a list of strings while preserving original order.
function uniqueStrings(list) {
	const values = [];
	const seen = new Set();

	for (const item of list) {
		if (typeof item !== 'string') {
			continue;
		}

		const trimmed = item.trim();
		if (!trimmed) {
			continue;
		}

		const key = trimmed.toLowerCase();
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		values.push(trimmed);
	}

	return values;
}

// Create backup search queries when LLM is unavailable or low quality.
function buildFallbackQueries(prompt) {
	const terms = tokenize(prompt);
	if (terms.length === 0) {
		return [prompt];
	}

	const queryCandidates = [prompt];

	if (terms.length >= 2) {
		queryCandidates.push(`${terms[0]} ${terms[1]}`);
	}

	if (terms.length >= 3) {
		queryCandidates.push(`${terms[0]} ${terms[1]} ${terms[2]}`);
	}

	queryCandidates.push(...terms.slice(0, 3));

	return uniqueStrings(queryCandidates).slice(0, MAX_SEARCH_QUERIES);
}

// Only allow list endpoints when user explicitly asks for list intent.
function hasExplicitListIntent(prompt) {
	const normalizedPrompt = prompt.toLowerCase();
	return (
		normalizedPrompt.includes('top rated') ||
		normalizedPrompt.includes('best rated') ||
		normalizedPrompt.includes('upcoming') ||
		normalizedPrompt.includes('coming soon') ||
		normalizedPrompt.includes('now playing') ||
		normalizedPrompt.includes('in theater') ||
		normalizedPrompt.includes('popular') ||
		normalizedPrompt.includes('trending')
	);
}

// Validate and normalize the LLM plan into safe defaults.
function sanitizeLlmPlan(plan, fallbackPrompt) {
	if (!plan || typeof plan !== 'object') {
		return {
			strategy: 'search',
			searchQueries: buildFallbackQueries(fallbackPrompt),
			keywords: tokenize(fallbackPrompt),
		};
	}

	const rawStrategy = typeof plan.strategy === 'string' ? plan.strategy.trim() : 'search';
	const strategyFromPlan = ALLOWED_STRATEGIES.has(rawStrategy) ? rawStrategy : 'search';

	const rawQueries = Array.isArray(plan.searchQueries)
		? plan.searchQueries
		: [plan.searchQuery, fallbackPrompt];
	const candidateTitles = uniqueStrings(Array.isArray(plan.candidateTitles) ? plan.candidateTitles : []).slice(0, 6);

	const searchQueries = uniqueStrings([...candidateTitles, ...rawQueries, fallbackPrompt]).slice(0, MAX_SEARCH_QUERIES);
	const keywords = uniqueStrings(Array.isArray(plan.keywords) ? plan.keywords : tokenize(fallbackPrompt)).slice(0, 12);
	const strategy = hasExplicitListIntent(fallbackPrompt) ? strategyFromPlan : 'search';

	return {
		strategy,
		searchQueries: searchQueries.length > 0 ? searchQueries : [fallbackPrompt],
		keywords,
		candidateTitles,
	};
}

// Ask the LLM to transform natural-language movie requests into a TMDB retrieval plan.
async function getLlmPlan(prompt) {
	const token = process.env.LLM_API_TOKEN;
	const endpoint = process.env.LLM_API_URL;
	const model = process.env.LLM_MODEL;

	if (!token || !endpoint || !model) {
		return null;
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				model,
				stream: false,
				temperature: 0.2,
				messages: [
					{
						role: 'system',
						content:
							'You convert a movie request into a TMDB retrieval plan. Return strict JSON only with this schema: {"strategy":"search|popular|top_rated|upcoming|now_playing","searchQueries":["string"],"keywords":["string"],"candidateTitles":["string"]}. For plot/description prompts, infer likely movie titles in candidateTitles and include 3-6 focused searchQueries.',
					},
					{
						role: 'user',
						content: `User movie request: "${prompt}". If this sounds like a known film, put likely exact titles in candidateTitles.`,
					},
				],
			}),
			signal: controller.signal,
		});

		if (!response.ok) {
			return null;
		}

		const payload = await response.json();
		const content = payload?.choices?.[0]?.message?.content;
		const parsed = parseLlmJson(content);

		return sanitizeLlmPlan(parsed, prompt);
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

// Execute the plan using TMDB helpers.
async function getTmdbCandidatesFromPlan(plan) {
	if (!plan) {
		return [];
	}

	if (plan.strategy === 'top_rated') {
		return getTopRatedMovies();
	}

	if (plan.strategy === 'upcoming') {
		return getUpcomingMovies();
	}

	if (plan.strategy === 'now_playing') {
		return getNowPlayingMovies();
	}

	if (plan.strategy === 'popular') {
		return getPopularMovies();
	}

	const results = await Promise.all(plan.searchQueries.map((query) => searchMovies(query)));
	return results.flat();
}

// Non-LLM fallback retrieval strategy.
async function getTmdbCandidates(prompt) {
	const normalizedPrompt = prompt.toLowerCase();

	if (normalizedPrompt.includes('top rated') || normalizedPrompt.includes('best rated')) {
		return getTopRatedMovies();
	}

	if (normalizedPrompt.includes('upcoming') || normalizedPrompt.includes('coming soon')) {
		return getUpcomingMovies();
	}

	if (normalizedPrompt.includes('now playing') || normalizedPrompt.includes('in theater')) {
		return getNowPlayingMovies();
	}

	if (normalizedPrompt.includes('popular') || normalizedPrompt.includes('trending')) {
		return getPopularMovies();
	}

	const searched = await searchMovies(prompt);
	if (searched.length > 0) {
		return searched;
	}

	return getPopularMovies();
}
// Remove duplicate titles and keep only the requested number of items.
function createSuggestions(movies, prompt, limit) {
	if (!Array.isArray(movies)) {
		return [];
	}

	const uniqueByTitle = new Map();
	for (const movie of movies) {
		const mapped = mapTmdbMovieToSuggestion(movie, prompt);
		if (mapped && !uniqueByTitle.has(mapped.title)) {
			uniqueByTitle.set(mapped.title, mapped);
		}
	}

	return Array.from(uniqueByTitle.values()).slice(0, normalizeLimit(limit));
}

// End-to-end suggestion pipeline used by the route handler.
export async function suggestMovies(prompt, options = {}) {
    // cleaning user prompt
	const cleanedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
	if (!cleanedPrompt) {
		throw new Error('Prompt is required.');
	}

    // send prompt to LLM (gpt) to create a search plan for TMDB
	const limit = normalizeLimit(options.limit);
	const llmPlan = await getLlmPlan(cleanedPrompt);

    // first try to get movies from TMDB based on LLM search
	let tmdbMovies = await getTmdbCandidatesFromPlan(llmPlan);

    // if LLM response fails, then provide simple search from TMDB api
	if (!Array.isArray(tmdbMovies) || tmdbMovies.length === 0) {
		tmdbMovies = await getTmdbCandidates(cleanedPrompt);
	}

    // prepare the final response in form of suggestions
	const suggestions = createSuggestions(tmdbMovies, cleanedPrompt, limit);

    // return the suggestion response
	return {
		source: llmPlan ? 'llm+tmdb' : 'tmdb',
		suggestions,
	};
}
