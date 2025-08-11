const API_KEY = 'a8192034';
const API_BASE = `https://www.omdbapi.com/?apikey=${API_KEY}`;


const NO_IMAGE_URL = 'https://via.placeholder.com/400x600.png?text=No+Image';


function normalizeMovie(omdbMovie) {
  return {
    id: omdbMovie.imdbID,
    title: omdbMovie.Title,
    release_date: omdbMovie.Year, 
    poster_path: omdbMovie.Poster === 'N/A' ? null : omdbMovie.Poster,
  };
}

export async function fetchPopular(limit = 20) {
    const popularIds = [
    'tt0111161', 
    'tt0068646', 
    'tt0468569', 
    'tt0071562', 
    'tt0108052', 
    'tt0167260', 
    'tt0110912', 
    'tt1375666', 
    'tt0137523', 
    'tt0109830', 
  ];

  try {
    const moviePromises = popularIds.slice(0, limit).map(async (id) => {
      const response = await fetch(`${API_BASE}&i=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error fetching popular! status: ${response.status}`);
      }
      return response.json();
    });

    const moviesData = await Promise.all(moviePromises);
    return moviesData.map(normalizeMovie);
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
    throw new Error('Could not load popular movies.');
  }
}
export async function searchMovies(query, limit = 20) {
  if (!query) return [];

  const cacheKey = `search-${query.toLowerCase()}`;
  const cachedResult = sessionStorage.getItem(cacheKey);

  if (cachedResult) {
    console.log('Serving search result from cache.');
    return JSON.parse(cachedResult);
  }

  const url = `${API_BASE}&s=${encodeURIComponent(query)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error on search! status: ${response.status}`);
  }

  try {
    const data = await response.json();
    if (data.Response === "False") {
      return [];
    }
    
    const normalizedResults = data.Search.map(normalizeMovie).slice(0, limit);

    console.log('Saving search result to cache.');
    sessionStorage.setItem(cacheKey, JSON.stringify(normalizedResults));

    return normalizedResults;
  } catch (error) {
    throw new Error('Failed to parse search results response.');
  }
}

export function getPosterUrl(movie) {
    return movie.poster_path ? movie.poster_path : NO_IMAGE_URL;
}