/**
 * Hybrid Recommendation System
 * Combina content-based con cold-start para nuevos usuarios
 */

import mongoose from 'mongoose';
import Movie from '@/models/Movie';
import Rating from '@/models/Rating';
import { getContentBasedRecommendations, hasEnoughHistory } from './contentBased';

/**
 * Obtiene recomendaciones de cold-start para usuarios nuevos
 * Retorna películas populares recientes que el usuario no ha calificado
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número de recomendaciones
 * @returns {Promise<Array>}
 */
async function getColdStartRecommendations(userId, limit = 20) {
  // Obtener IDs de películas ya calificadas
  const ratedMovies = await Rating.find({ userId: userId }).select('movieId');
  const ratedMovieIds = ratedMovies.map(r => r.movieId);

  // Buscar películas populares y recientes no calificadas
  const movies = await Movie.find({
    _id: { $nin: ratedMovieIds },
    poster: { $exists: true, $ne: null },
    year: { $gte: 2015 }, // Películas relativamente recientes
  })
    .sort({ popularity: -1, year: -1 })
    .limit(limit);

  return movies;
}

/**
 * Sistema de recomendaciones híbrido
 * Usa content-based si el usuario tiene historial, sino cold-start
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número de recomendaciones (default: 20)
 * @returns {Promise<Array>} - Lista de películas recomendadas
 */
export async function getHybridRecommendations(userId, limit = 20) {
  // Verificar si el usuario tiene suficiente historial
  const hasHistory = await hasEnoughHistory(userId);

  if (hasHistory) {
    // Usar recomendaciones basadas en contenido
    const recommendations = await getContentBasedRecommendations(userId, limit);
    
    // Si no hay suficientes recomendaciones, completar con cold-start
    if (recommendations.length < limit) {
      const coldStart = await getColdStartRecommendations(
        userId,
        limit - recommendations.length
      );
      return [...recommendations, ...coldStart];
    }
    
    return recommendations;
  } else {
    // Usuario nuevo o sin suficiente historial: cold-start
    return getColdStartRecommendations(userId, limit);
  }
}

/**
 * Obtiene el tipo de recomendación que se está usando
 * @param {string} userId
 * @returns {Promise<string>} - 'content-based' | 'cold-start'
 */
export async function getRecommendationType(userId) {
  const hasHistory = await hasEnoughHistory(userId);
  return hasHistory ? 'content-based' : 'cold-start';
}

