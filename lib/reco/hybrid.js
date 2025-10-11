/**
 * Hybrid Recommendation System
 * Combina content-based con cold-start para nuevos usuarios
 */

import mongoose from 'mongoose';
import Movie from '@/models/Movie';
import Rating from '@/models/Rating';
import { toObjectId } from '@/lib/utils';
import { getContentBasedRecommendations, hasEnoughHistory } from './contentBased';

/**
 * Obtiene recomendaciones de cold-start para usuarios nuevos
 * Retorna películas populares recientes que el usuario no ha calificado
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número de recomendaciones
 * @returns {Promise<Array>}
 */
async function getColdStartRecommendations(userId, limit = 20) {
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in getColdStartRecommendations:', userId);
    return [];
  }
  
  // Obtener IDs de películas ya calificadas
  const ratedMovies = await Rating.find({ userId: userIdObj }).select('movieId');
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
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in getHybridRecommendations:', userId);
    return [];
  }
  
  // Verificar si el usuario tiene suficiente historial
  const hasHistory = await hasEnoughHistory(userIdObj);

  if (hasHistory) {
    // Usar recomendaciones basadas en contenido
    const recommendations = await getContentBasedRecommendations(userIdObj, limit);
    
    // Si no hay suficientes recomendaciones, completar con cold-start
    if (recommendations.length < limit) {
      const coldStart = await getColdStartRecommendations(
        userIdObj,
        limit - recommendations.length
      );
      return [...recommendations, ...coldStart];
    }
    
    return recommendations;
  } else {
    // Usuario nuevo o sin suficiente historial: cold-start
    return getColdStartRecommendations(userIdObj, limit);
  }
}

/**
 * Obtiene el tipo de recomendación que se está usando
 * @param {string} userId
 * @returns {Promise<string>} - 'content-based' | 'cold-start'
 */
export async function getRecommendationType(userId) {
  // Convertir userId a ObjectId de forma segura
  const userIdObj = toObjectId(userId);
  
  if (!userIdObj) {
    console.error('Invalid userId in getRecommendationType:', userId);
    return 'cold-start';
  }
  
  const hasHistory = await hasEnoughHistory(userIdObj);
  return hasHistory ? 'content-based' : 'cold-start';
}

