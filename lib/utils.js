/**
 * Utility Functions
 * Funciones auxiliares para el manejo de datos
 */

import mongoose from 'mongoose';

/**
 * Convierte un string a ObjectId de MongoDB de forma segura
 * @param {string|mongoose.Types.ObjectId} id - ID a convertir
 * @returns {mongoose.Types.ObjectId|null} - ObjectId válido o null si es inválido
 */
export function toObjectId(id) {
  try {
    if (!id) return null;
    
    // Si ya es un ObjectId, retornarlo
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    
    return null;
  } catch (error) {
    console.error('Error converting to ObjectId:', error);
    return null;
  }
}

/**
 * Valida si un string es un ObjectId válido
 * @param {string} id - ID a validar
 * @returns {boolean} - True si es válido
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convierte ObjectId a string de forma segura
 * @param {mongoose.Types.ObjectId|string} id - ID a convertir
 * @returns {string|null} - String del ID o null si es inválido
 */
export function objectIdToString(id) {
  try {
    if (!id) return null;
    
    // Si ya es string, retornarlo
    if (typeof id === 'string') return id;
    
    // Si es ObjectId, convertir a string
    if (mongoose.Types.ObjectId.isValid(id)) {
      return id.toString();
    }
    
    return null;
  } catch (error) {
    console.error('Error converting ObjectId to string:', error);
    return null;
  }
}
