const FAVORITES_KEY = 'movie-favorites';

export function loadFavorites() {
  const favoritesJSON = localStorage.getItem(FAVORITES_KEY);
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
}


export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}


export function toggleFavorite(favorites, movie) {
  const movieIndex = favorites.findIndex((fav) => fav.id === movie.id);
  let updatedFavorites;

  if (movieIndex === -1) {
    
    updatedFavorites = [...favorites, movie];
  } else {
    
    updatedFavorites = favorites.filter((fav) => fav.id !== movie.id);
  }

  saveFavorites(updatedFavorites);
  return updatedFavorites;
}