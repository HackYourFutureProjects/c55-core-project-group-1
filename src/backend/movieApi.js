/* global process */
import dotenv from "dotenv";
dotenv.config();


const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

console.log("API KEY loaded:", !!API_KEY);

// Helper function to reduce repetition (optional but clean)
async function fetchFromTMDB(endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);

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

//  Popular Movies
export async function getPopularMovies() {
  return fetchFromTMDB("/movie/popular");
}

// Upcoming Movies
export async function getUpcomingMovies() {
  return fetchFromTMDB("/movie/upcoming");
}

//  Now Playing
export async function getNowPlayingMovies() {
  return fetchFromTMDB("/movie/now_playing");
}

//  Top Rated
export async function getTopRatedMovies() {
  return fetchFromTMDB("/movie/top_rated");
}

//Search Movies 
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



// TEST
getPopularMovies().then(data => {
  console.log("Popular Movies (top 3):", data.slice(0, 3));
});