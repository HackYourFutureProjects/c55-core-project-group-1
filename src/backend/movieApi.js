/* global process */
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Helper
async function fetchFromTMDB(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);

    if (!res.ok) {
      throw new Error(`TMDB Error: ${res.status}`);
    }

    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Fetch error:", error.message);
    return [];
  }
}



//  SEARCH BY TITLE (NO CHANGE)

export async function searchMovies(query) {
  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`);
    }

    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Search error:", error.message);
    return [];
  }
}



//  FILTERS (NEW FEATURES)

//  Genre filter
export async function getMoviesByGenre(genreId) {
  return fetchFromTMDB(
    `/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
  );
}

//  Year filter
export async function getMoviesByYear(year) {
  return fetchFromTMDB(
    `/discover/movie?api_key=${API_KEY}&primary_release_year=${year}`
  );
}

//  Rating filter
export async function getMoviesByRating(minRating) {
  return fetchFromTMDB(
    `/discover/movie?api_key=${API_KEY}&vote_average.gte=${minRating}`
  );
}

// Actor filter
export async function getMoviesByActor(personId) {
  return fetchFromTMDB(
    `/discover/movie?api_key=${API_KEY}&with_cast=${personId}`
  );
}

//  Step 1: search actor (helper)
export async function searchActor(query) {
  try {
    const res = await fetch(
      `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );

    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Actor search error:", error.message);
    return [];
  }
}
