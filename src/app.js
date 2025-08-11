import { fetchPopular, searchMovies, getPosterUrl } from './api.js';
import { debounce } from './debounce.js';
import { loadFavorites,toggleFavorite } from './favourites.js';

const state = {
  status: 'idle', 
  items: [],
  errorMessage: '',
  favorites: [],
  mode: 'popular', 
  lastQuery: '',
};


const elements = {
  searchInput: document.getElementById('search-input'),
  resultsGrid: document.getElementById('results-grid'),
  resultsStatus: document.getElementById('results-status'),
  resultsHeading: document.getElementById('results-heading'),
  favoritesGrid: document.getElementById('favorites-grid'),
};



function render() {
  renderResults();
  renderFavorites();
}

function renderResults() {
  const { status, items, errorMessage, mode, lastQuery } = state;

  
  if (mode === 'search') {
    elements.resultsHeading.textContent = `Results for: "${lastQuery}"`;
  } else {
    elements.resultsHeading.textContent = 'Popular Movies';
  }

  
  elements.resultsGrid.innerHTML = '';
  elements.resultsStatus.textContent = '';
  elements.resultsStatus.style.display = 'none';

  switch (status) {
    case 'loading':
      elements.resultsStatus.textContent = 'Loading...';
      elements.resultsStatus.style.display = 'block';
      break;
    case 'success':
      elements.resultsGrid.innerHTML = createMovieCardsHTML(items);
      break;
    case 'empty':
      elements.resultsStatus.textContent = 'No movies found. Try another search!';
      elements.resultsStatus.style.display = 'block';
      break;
    case 'error':
      elements.resultsStatus.textContent = `Error: ${errorMessage}`;
      elements.resultsStatus.style.display = 'block';
      break;
    default:
      break;
  }
}

function renderFavorites() {
    elements.favoritesGrid.innerHTML = createMovieCardsHTML(state.favorites, true);
}

function createMovieCardsHTML(movieList, isFavoriteList = false) {
  return movieList.map(movie => {
    const isFavorite = state.favorites.some(fav => fav.id === movie.id);
    const buttonText = isFavorite ? 'Remove Favorite' : 'Add Favorite';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const posterSrc = getPosterUrl(movie);

    return `
      <div class="movie-card" data-movie-id="${movie.id}">
        <img src="${posterSrc}" alt="${movie.title}">
        <div class="movie-card-content">
          <h3>${movie.title}</h3>
          <p>${year}</p>
          <button class="favorite-btn">${buttonText}</button>
        </div>
      </div>
    `;
  }).join('');
}




async function showPopularMovies() {
  state.status = 'loading';
  state.mode = 'popular';
  render();

  try {
    const movies = await fetchPopular();
    state.items = movies;
    state.status = movies.length > 0 ? 'success' : 'empty';
  } catch (err) {
    state.status = 'error';
    state.errorMessage = err.message;
  }
  render();
}

async function performSearch(query) {
  if (query.trim() === '') {
    showPopularMovies();
    return;
  }
  state.status = 'loading';
  state.mode = 'search';
  state.lastQuery = query;
  render();

  try {
    const movies = await searchMovies(query);
    state.items = movies;
    state.status = movies.length > 0 ? 'success' : 'empty';
  } catch (err) {
    state.status = 'error';
    state.errorMessage = err.message;
  }
  render();
}



function handleFavoriteToggle(event) {
  const button = event.target.closest('.favorite-btn');
  if (!button) return;

  const card = button.closest('.movie-card');
  const movieId = card.dataset.movieId;

  
  const movie = [...state.items, ...state.favorites].find(m => m.id === movieId);
  if (movie) {
    state.favorites = toggleFavorite(state.favorites, movie);
    render(); 
  }
}


const debouncedSearch = debounce(performSearch, 400);

function handleSearchInput(event) {
  debouncedSearch(event.target.value);
}


function init() {
  
  state.favorites = loadFavorites();

  
  elements.searchInput.addEventListener('input', handleSearchInput);
  document.addEventListener('click', handleFavoriteToggle);

  
  showPopularMovies();
}


init();