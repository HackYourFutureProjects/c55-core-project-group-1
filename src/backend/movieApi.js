import dotenv from "dotenv";
dotenv.config();

console.log("API KEY:", process.env.TMDB_API_KEY);


const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

//Popular Movies
export async function getPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

//Upcoming Movies
export async function getUpcomingMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

//Now Playing
export async function getNowPlayingMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

// Top Rated
export async function getTopRatedMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

// Search
export async function searchMovies(query) {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

//Try 
getPopularMovies().then(data => {
  console.log("Popular Movies:", data.slice(0, 3));
});