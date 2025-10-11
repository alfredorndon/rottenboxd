/**
 * TMDb API Helper
 * Usa Bearer Token v4 para autorización
 * Incluye reintentos y rate limiting
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY no configurada');
}

/**
 * Sleep helper para rate limiting
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Realiza una petición a TMDb API con reintentos
 * @param {string} path - Ruta del endpoint (ej: '/movie/popular')
 * @param {object} params - Query params opcionales
 * @param {number} retries - Número de reintentos
 * @returns {Promise<object>}
 */
export async function tmdb(path, params = {}, retries = 3) {
  const queryString = new URLSearchParams({
    language: 'es-MX',
    ...params,
  }).toString();

  const url = `${BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        // Rate limit - esperar antes de reintentar
        const waitTime = Math.pow(2, attempt) * 1000; // Backoff exponencial
        console.warn(`⚠️  Rate limit alcanzado, esperando ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Esperar antes de reintentar
      await sleep(Math.pow(2, attempt) * 500);
    }
  }
}

/**
 * Genera URL completa para imágenes de TMDb
 * @param {string} path - Ruta de la imagen (ej: '/abc123.jpg')
 * @param {string} size - Tamaño deseado (w92, w154, w185, w342, w500, w780, original)
 * @returns {string}
 */
export function imageUrl(path, size = 'w500') {
  if (!path) return '/placeholder.png';
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Obtiene películas populares
 */
export async function getPopularMovies(page = 1) {
  return tmdb('/movie/popular', { page });
}

/**
 * Obtiene detalles de una película
 */
export async function getMovieDetails(tmdbId) {
  return tmdb(`/movie/${tmdbId}`);
}

/**
 * Obtiene keywords de una película
 */
export async function getMovieKeywords(tmdbId) {
  return tmdb(`/movie/${tmdbId}/keywords`);
}

/**
 * Busca películas por query
 */
export async function searchMovies(query, page = 1) {
  return tmdb('/search/movie', { query, page });
}

