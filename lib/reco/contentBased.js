/**
 * Content-Based Recommendation System
 * Recomienda películas basándose en géneros y keywords de películas que al usuario le gustaron
 */

import mongoose from 'mongoose';
import Rating from '@/models/Rating';
import Movie from '@/models/Movie';
import { toObjectId } from '@/lib/utils';

/**
 * Construye un perfil de usuario basado en sus películas favoritas
 * @param {string} userId - ID del usuario
 * @param {number} minRating - Rating mínimo considerado "me gusta" (default: 4)
 * @returns {Promise<object>} - { genres: Map, keywords: Map, likedMovieIds: Set }
 */
async function buildUserProfile(userId, minRating = 4) {
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in buildUserProfile:', userId);
    return { genres: new Map(), keywords: new Map(), likedMovieIds: new Set() };
  }
  
  // Obtener ratings altos del usuario
  const ratings = await Rating.find({
    userId: userIdObj,
    rating: { $gte: minRating },
  }).populate('movieId');

  const genreWeights = new Map();
  const keywordWeights = new Map();
  const likedMovieIds = new Set();

  // Acumular géneros y keywords de películas que le gustaron
  for (const rating of ratings) {
    const movie = rating.movieId;
    if (!movie) continue;

    likedMovieIds.add(movie._id.toString());

    // Peso proporcional al rating (rating 5 pesa más que rating 4)
    const weight = rating.rating;

    // Acumular géneros
    for (const genre of movie.genres || []) {
      genreWeights.set(genre, (genreWeights.get(genre) || 0) + weight);
    }

    // Acumular keywords
    for (const keyword of movie.keywords || []) {
      keywordWeights.set(keyword, (keywordWeights.get(keyword) || 0) + weight);
    }
  }

  return {
    genres: genreWeights,
    keywords: keywordWeights,
    likedMovieIds,
  };
}

/**
 * Calcula score de una película basado en el perfil del usuario
 * @param {object} movie - Película candidata
 * @param {object} profile - Perfil del usuario
 * @returns {number} - Score de similitud
 */
function scoreMovie(movie, profile) {
  let score = 0;

  // Puntuar por géneros coincidentes
  for (const genre of movie.genres || []) {
    if (profile.genres.has(genre)) {
      score += profile.genres.get(genre) * 2; // Géneros tienen más peso
    }
  }

  // Puntuar por keywords coincidentes
  for (const keyword of movie.keywords || []) {
    if (profile.keywords.has(keyword)) {
      score += profile.keywords.get(keyword);
    }
  }

  // Bonus por popularidad (pequeño factor)
  score += (movie.popularity || 0) * 0.01;

  return score;
}

/**
 * Genera recomendaciones basadas en contenido para un usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número de recomendaciones (default: 20)
 * @returns {Promise<Array>} - Lista de películas recomendadas
 */
export async function getContentBasedRecommendations(userId, limit = 20) {
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in getContentBasedRecommendations:', userId);
    return [];
  }
  
  // Construir perfil de usuario
  const profile = await buildUserProfile(userIdObj);

  // Si no hay suficiente historial, retornar vacío
  if (profile.genres.size === 0 && profile.keywords.size === 0) {
    return [];
  }

  // Buscar géneros favoritos del usuario (top 3)
  const topGenres = Array.from(profile.genres.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  // Buscar películas candidatas con géneros similares
  // Excluir películas ya calificadas
  const candidates = await Movie.find({
    _id: { $nin: Array.from(profile.likedMovieIds) },
    genres: { $in: topGenres },
    poster: { $exists: true, $ne: null }, // Solo películas con poster
  }).limit(limit * 3); // Buscar más candidatos para filtrar

  // Puntuar y ordenar candidatos
  const scoredCandidates = candidates
    .map(movie => ({
      movie,
      score: scoreMovie(movie, profile),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredCandidates.map(({ movie }) => movie);
}

/**
 * Verifica si un usuario tiene suficiente historial para recomendaciones
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function hasEnoughHistory(userId) {
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in hasEnoughHistory:', userId);
    return false;
  }
  
  const count = await Rating.countDocuments({
    userId: userIdObj,
    rating: { $gte: 4 },
  });
  return count >= 3;
}

