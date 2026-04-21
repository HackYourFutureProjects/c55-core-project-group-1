/*
 * API ENDPOINTS
 *
 * GET    /api/watchlist                          — Load watchlist state
 * POST   /api/watchlist                          — Add movie to watchlist
 * DELETE /api/watchlist/:id                      — Remove movie from watchlist
 * GET    /api/movies/search?type=title&q=        — Search movies by title
 * GET    /api/movies/search?type=genre&q=        — Search movies by genre
 * GET    /api/movies/search?type=actor&q=        — Search movies by actor
 * GET    /api/movies/watchlist-display           — Display watchlist movies
 * GET    /api/movies/:id                         — Get single movie details by ID
 * GET    /api/movies/recommendations             — Load recommended movies (NOT USED YET)
 * POST   /api/llm/suggest                        — AI movie suggestions
 *
 */

// 1. DOM element //
const movieContainer = document.getElementById('movieContainer');
const suggestInput = document.getElementById('aiInput');
const suggestButton = document.getElementById('aiBtn');
const searchTypeSelect = document.querySelector('.search-type');
const searchInput = document.querySelector('.search-control input');
const searchButton = document.querySelector('.search-control button');
const viewWatchlistBtn = document.getElementById('viewWatchlistBtn');

// Tracks which movie IDs are currently in the watchlist (avoids repeated API calls)
const watchlistMovieIds = new Set();

// 2. UI render //

// Renders a simple status/loading message inside the movie container
function renderStatus(message) {
  if (!movieContainer) return;
  movieContainer.innerHTML = `<p>${message}</p>`;
}

// Returns the correct watchlist button HTML based on current watchlist state
function getWatchlistButtonMarkup(movieId) {
  if (!Number.isInteger(movieId) || movieId <= 0) {
    return '<button class="watchlist-btn" type="button" disabled>Add unavailable</button>';
  }

  const isInWatchlist = watchlistMovieIds.has(movieId);
  const label = isInWatchlist ? 'Remove from Watchlist' : '+ Add to Watchlist';
  const action = isInWatchlist ? 'remove' : 'add';

  return `<button class="watchlist-btn" data-id="${movieId}" data-action="${action}">${label}</button>`;
}

// Syncs a watchlist button's label and action attribute after a toggle
function updateWatchlistButtonState(button, movieId) {
  const isInWatchlist = watchlistMovieIds.has(movieId);
  button.dataset.action = isInWatchlist ? 'remove' : 'add';
  button.textContent = isInWatchlist
    ? 'Remove from Watchlist'
    : '+ Add to Watchlist';
  button.disabled = false;
}

/*
 * renderMovieCard
 *
 * @param {object} movie  — movie data object
 * @param {string} mode   — 'watchlist' shows a remove-btn, anything else shows
 *                          the standard add/remove watchlist-btn
 */
function renderMovieCard(movie, mode = 'default') {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : 'https://placehold.net/400x400.png';

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = movie.release_date
    ? movie.release_date.split('-')[0]
    : 'Unknown';

  // In watchlist view we show a dedicated remove button; elsewhere use the toggle markup
  const actionButton =
    mode === 'watchlist'
      ? `<button class="remove-btn" data-id="${movie.id}">Remove from Watchlist</button>`
      : getWatchlistButtonMarkup(Number.parseInt(movie.id, 10));

  return `
    <article class="movie-card">
      <img src="${posterUrl}" alt="${movie.title}" loading="lazy" />
      <h3>
        <a href="https://www.themoviedb.org/movie/${movie.id}"
           target="_blank" rel="noopener noreferrer">
          ${movie.title} (${year})
        </a>
      </h3>
      <p><strong>Rating:</strong> ⭐ ${rating}</p>
      <p>${movie.overview?.slice(0, 120) || 'No description available'}...</p>
      ${actionButton}
    </article>
  `;
}

// Renders an array of movies into the movie container (default mode)
function displayMovies(movies) {
  if (!movieContainer) return;

  if (!movies || movies.length === 0) {
    movieContainer.innerHTML =
      '<p>No movies found. Try a different search!</p>';
    return;
  }

  movieContainer.innerHTML = movies
    .map((movie) => renderMovieCard(movie))
    .join('');
}

// 3. API Calls //

// Fetches the current watchlist from the server and rebuilds watchlistMovieIds
async function loadWatchlistState() {
  try {
    const response = await fetch('/api/watchlist');
    if (!response.ok)
      throw new Error(`Could not load watchlist: ${response.status}`);

    const rows = await response.json();
    watchlistMovieIds.clear();

    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        const movieId = Number.parseInt(row.movie_id, 10);
        if (Number.isInteger(movieId) && movieId > 0) {
          watchlistMovieIds.add(movieId);
        }
      });
    }
  } catch (error) {
    console.error(error.message || 'Failed to load watchlist state.');
  }
}

// Searches movies by type (title | genre | actor) and renders the results
async function loadMovies(type, query) {
  movieContainer.innerHTML = '<p>Fetching movies...</p>';
  try {
    await loadWatchlistState();
    const params = new URLSearchParams({ type, q: query });
    const res = await fetch(`/api/movies/search?${params}`);

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    displayMovies(data);
  } catch (err) {
    movieContainer.innerHTML = '<p>Something went wrong. Please try again.</p>';
    console.error('Fetch error:', err.message);
  }
}

// Adds a movie to the watchlist on the server and updates local state
async function addMovieToWatchlist(movieId) {
  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movie_id: movieId }),
  });

  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || 'Could not add movie to watchlist.');

  watchlistMovieIds.add(movieId);
}

// Removes a movie from the watchlist on the server and updates local state
async function removeMovieFromWatchlist(movieId) {
  const response = await fetch(`/api/watchlist/${movieId}`, {
    method: 'DELETE',
  });

  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || 'Could not remove movie from watchlist.');

  watchlistMovieIds.delete(movieId);
}

// 4. AI Suggest feature //

async function enrichAiSuggestion(movie, index) {
  const fallbackMovie = {
    id: `ai-${index}`,
    title: movie.title || 'Untitled',
    release_date: Number.isInteger(movie.year) ? `${movie.year}-01-01` : '',
    vote_average: null,
    poster_path: movie.poster_path || null,
    overview: movie.reason || 'No description available',
  };

  if (!movie?.title) return fallbackMovie;

  try {
    const params = new URLSearchParams({ type: 'title', q: movie.title });
    const res = await fetch(`/api/movies/search?${params}`);
    if (!res.ok) return fallbackMovie;

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return fallbackMovie;

    const targetYear = Number.isInteger(movie.year) ? String(movie.year) : null;
    const exactMatch = results.find((item) => {
      const itemYear = item?.release_date?.split('-')?.[0] || null;
      if (targetYear && itemYear && itemYear === targetYear) return true;
      return (item?.title || '').toLowerCase() === movie.title.toLowerCase();
    });

    const bestMatch = exactMatch || results[0];

    return {
      ...fallbackMovie,
      id: bestMatch?.id ?? fallbackMovie.id,
      title: bestMatch?.title || fallbackMovie.title,
      release_date: bestMatch?.release_date || fallbackMovie.release_date,
      vote_average:
        typeof bestMatch?.vote_average === 'number'
          ? bestMatch.vote_average
          : fallbackMovie.vote_average,
      poster_path: bestMatch?.poster_path || fallbackMovie.poster_path,
      overview: movie.reason || bestMatch?.overview || fallbackMovie.overview,
    };
  } catch {
    return fallbackMovie;
  }
}

async function renderSuggestions(source, suggestions) {
  if (!movieContainer) return;

  const normalizedSuggestions = await Promise.all(
    suggestions.map((movie, index) => enrichAiSuggestion(movie, index))
  );

  displayMovies(normalizedSuggestions);

  // Map internal source keys to human-readable labels
  const sourceLabels = { tmdb: 'TMDB API', 'llm+tmdb': 'LLM + TMDB API' };
  const sourceText = sourceLabels[source] || 'AI';

  // Remove any previous source label before inserting a new one
  document.querySelector('.recommendation-source')?.remove();

  movieContainer.insertAdjacentHTML(
    'beforebegin',
    `<p class="recommendation-source">Recommendations generated by: <strong>${sourceText}</strong></p>`
  );
}

async function handleSuggestClick() {
  const prompt = suggestInput?.value?.trim();

  if (!prompt) {
    renderStatus('Please enter a movie description first.');
    return;
  }

  if (suggestButton) {
    suggestButton.disabled = true;
    suggestButton.textContent = 'Loading...';
  }

  renderStatus('Finding recommendations...');

  try {
    const response = await fetch('/api/llm/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, limit: 5 }),
    });

    const payload = await response.json();
    if (!response.ok)
      throw new Error(payload.error || 'Failed to get suggestions.');

    if (
      !Array.isArray(payload.suggestions) ||
      payload.suggestions.length === 0
    ) {
      renderStatus('No suggestions found. Try another description.');
      return;
    }

    await loadWatchlistState();
    await renderSuggestions(payload.source, payload.suggestions);
  } catch (error) {
    renderStatus(
      error.message || 'Something went wrong while requesting suggestions.'
    );
  } finally {
    if (suggestButton) {
      suggestButton.disabled = false;
      suggestButton.textContent = 'Suggest AI';
    }
  }
}

// Handles the watchlist toggle button (add / remove) inside movie cards
async function toggleWatchlist(button) {
  const movieId = Number.parseInt(button.dataset.id, 10);
  if (!Number.isInteger(movieId) || movieId <= 0) return;

  button.disabled = true;
  const action = button.dataset.action;
  button.textContent = action === 'remove' ? 'Removing...' : 'Adding...';

  try {
    if (action === 'remove') {
      await removeMovieFromWatchlist(movieId);
    } else {
      await addMovieToWatchlist(movieId);
    }
    updateWatchlistButtonState(button, movieId);
  } catch (error) {
    updateWatchlistButtonState(button, movieId);
    alert(error.message || 'Failed to update watchlist.');
  }
}

// 5. Event Listeners //

// Search button click
searchButton?.addEventListener('click', () => {
  const type = searchTypeSelect?.value?.toLowerCase() || 'title';
  const query = searchInput?.value?.trim();

  if (!query) {
    searchInput?.focus();
    return;
  }

  loadMovies(type, query);
});

// Allow pressing Enter in the search input to trigger a search
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchButton?.click();
});

// AI suggest button click
suggestButton?.addEventListener('click', handleSuggestClick);

// View Watchlist sidebar button
viewWatchlistBtn?.addEventListener('click', async () => {
  if (!movieContainer) return;

  try {
    movieContainer.innerHTML = '<p>Loading watchlist...</p>';

    const response = await fetch('/api/movies/watchlist-display');
    if (!response.ok) throw new Error('Failed to load watchlist movies.');

    const movies = await response.json();

    if (!Array.isArray(movies) || movies.length === 0) {
      movieContainer.innerHTML = '<p>Your watchlist is empty!</p>';
      return;
    }

    // Render each movie in watchlist mode (shows remove button instead of add)
    movieContainer.innerHTML = movies
      .map((movie) => renderMovieCard(movie, 'watchlist'))
      .join('');
  } catch (error) {
    console.error('Error loading watchlist:', error);
    movieContainer.innerHTML = '<p>Failed to load watchlist.</p>';
  }
});

/*
 * Delegated click listener for movie cards (watchlist toggle and remove)
 * Handles:
 *   .watchlist-btn  — toggle add / remove via toggleWatchlist()
 *   .remove-btn     — remove from watchlist and remove the card from the DOM
 */
movieContainer?.addEventListener('click', (event) => {
  const watchlistBtn = event.target.closest('.watchlist-btn');
  if (watchlistBtn) {
    toggleWatchlist(watchlistBtn);
    return;
  }

  const removeBtn = event.target.closest('.remove-btn');
  if (removeBtn) {
    const movieId = Number.parseInt(removeBtn.dataset.id, 10);
    removeMovieFromWatchlist(movieId).then(() => {
      removeBtn.closest('.movie-card').remove();
    });
  }
});

// Sidebar genre selection
document.querySelectorAll('.genres li').forEach((item) => {
  item.addEventListener('click', () => {
    const genre = item.dataset.genre;
    loadMovies('genre', genre);
  });
});

// 6. Initialization

// Pre-load the watchlist state so buttons render correctly on first paint
loadWatchlistState();
